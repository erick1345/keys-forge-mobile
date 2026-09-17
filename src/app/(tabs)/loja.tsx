import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { deleteGame, Game, listGames } from '@/api/games';
import { GameCard } from '@/components/GameCard';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { colors, radius, spacing } from '@/theme/theme';

const PAGE_SIZE = 10;

export default function LojaScreen() {
  const navigation = useNavigation();
  const { isAdmin } = useAuth();
  const { add, has } = useCart();
  const listRef = useRef<FlatList<Game>>(null);

  const [pageGames, setPageGames] = useState<Game[]>([]); 
  const [allGames, setAllGames] = useState<Game[]>([]); 
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  async function loadPage() {
    try {
      const data = await listGames(page, PAGE_SIZE);
      setPageGames(data.jogos);
      setTotalPages(data.totalPages || 1);
    } catch {
      Alert.alert('Erro', 'Nao foi possivel carregar os jogos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadAll() {
    try {
      const data = await listGames(1, 500);
      setAllGames(data.jogos);
    } catch {
    }
  }

  useEffect(() => { loadPage(); }, [page]);
  useEffect(() => { loadAll(); }, []);
  useFocusEffect(useCallback(() => { loadPage(); loadAll(); }, [page]));

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [page]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginRight: 12 }}>
          {!isAdmin && (
            <Pressable onPress={() => router.push('/wishlist')} hitSlop={8}>
              <Ionicons name="heart-outline" size={24} color={colors.text} />
            </Pressable>
          )}
          {isAdmin && (
            <Pressable onPress={() => router.push('/game-form')} hitSlop={8}>
              <Ionicons name="add-circle" size={26} color={colors.primary} />
            </Pressable>
          )}
        </View>
      ),
    });
  }, [navigation, isAdmin]);

  const searching = search.trim().length > 0;


  const data = useMemo(() => {
    if (!searching) return pageGames;
    const q = search.trim().toLowerCase();
    return allGames.filter(
      (g) => g.titulo.toLowerCase().includes(q) || (g.plataforma ?? '').toLowerCase().includes(q)
    );
  }, [searching, search, pageGames, allGames]);

  function handleDelete(game: Game) {
    Alert.alert('Excluir jogo', `Excluir "${game.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGame(game.id);
            setPageGames((prev) => prev.filter((g) => g.id !== game.id));
            setAllGames((prev) => prev.filter((g) => g.id !== game.id));
          } catch {
            Alert.alert('Erro', 'Nao foi possivel excluir.');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Busca */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar jogo..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); loadPage(); loadAll(); }}
        renderItem={({ item }) => (
          <GameCard
            game={item}
            isAdmin={isAdmin}
            onPress={() => router.push({ pathname: '/game/[id]', params: { id: String(item.id) } })}
            onEdit={() => router.push({ pathname: '/game-form', params: { id: String(item.id) } })}
            onDelete={() => handleDelete(item)}
            onAddToCart={() => add(item)}
            onBuy={() => { add(item); router.push('/payment'); }}
            inCart={has(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {searching ? `Nenhum jogo encontrado para "${search}".` : 'Nenhum jogo cadastrado.'}
          </Text>
        }
        ListFooterComponent={
          !searching && totalPages > 1 ? (
            <View style={styles.pager}>
              <Pressable
                disabled={page === 1}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                style={styles.pagerArrow}
              >
                <Ionicons name="chevron-back" size={20} color={page === 1 ? colors.muted : colors.text} />
              </Pressable>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pagerNums}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => setPage(n)}
                    style={[styles.pageNum, n === page && styles.pageNumOn]}
                  >
                    <Text style={[styles.pageNumText, n === page && styles.pageNumTextOn]}>{n}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Pressable
                disabled={page === totalPages}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={styles.pagerArrow}
              >
                <Ionicons name="chevron-forward" size={20} color={page === totalPages ? colors.muted : colors.text} />
              </Pressable>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  empty: { color: colors.muted, textAlign: 'center', marginTop: spacing.xl },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, height: 44, margin: spacing.md, marginBottom: 0,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, height: '100%' },
  pager: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginTop: spacing.sm, paddingVertical: spacing.sm,
  },
  pagerArrow: {
    width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  pagerNums: { alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  pageNum: {
    minWidth: 36, height: 36, paddingHorizontal: 8, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  pageNumOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  pageNumText: { color: colors.text, fontWeight: '700' },
  pageNumTextOn: { color: colors.primaryText },
});
