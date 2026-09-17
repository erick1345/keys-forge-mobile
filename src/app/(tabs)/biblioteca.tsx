
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { getLibrary, LibraryGame } from '@/api/purchase';
import { GameCard } from '@/components/GameCard';
import { colors, spacing } from '@/theme/theme';

export default function BibliotecaScreen() {
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setGames(await getLibrary());
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, []));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (games.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="library-outline" size={54} color={colors.muted} />
        <Text style={styles.emptyTitle}>Sua biblioteca está vazia</Text>
        <Text style={styles.emptyText}>Compre jogos na Loja para vê-los aqui.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={games}
        keyExtractor={(item) => String(item.purchase_id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <GameCard game={item} owned />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, gap: spacing.sm, padding: spacing.xl },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: spacing.sm },
  emptyText: { color: colors.muted, textAlign: 'center' },
});
