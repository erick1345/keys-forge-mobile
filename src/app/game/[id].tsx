
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resolveImageUrl } from '@/api/config';
import { Game, getGame } from '@/api/games';
import { getLibrary } from '@/api/purchase';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { colors, radius, spacing } from '@/theme/theme';

function parseRequisitos(texto?: string | null): string[] {
  if (!texto) return [];
  return texto.split('|').map((t) => t.trim()).filter(Boolean);
}

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { add, has } = useCart();
  const wishlist = useWishlist();
  const { isAdmin } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [owned, setOwned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const g = await getGame(Number(id));
        setGame(g);
        if (!isAdmin) {
          try {
            const lib = await getLibrary();
            setOwned(lib.some((item) => item.id === g.id));
          } catch {
            // ignora: sem biblioteca
          }
        }
      } catch {
        setGame(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  if (!game) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Jogo não encontrado.</Text>
      </View>
    );
  }

  const uri = resolveImageUrl(game.imagem_url);
  const preco = Number(game.preco).toFixed(2).replace('.', ',');
  const inCart = has(game.id);
  const inWishlist = wishlist.has(game.id);
  const semEstoque = Number(game.estoque) <= 0;
  const minimos = parseRequisitos(game.requisitos_minimos);
  const recomendados = parseRequisitos(game.requisitos_recomendados);

  function comprarAgora() {
    if (game && !inCart) add(game);
    router.push('/payment');
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Capa */}
        {uri ? (
          <Image source={{ uri }} style={styles.cover} resizeMode="contain" />
        ) : (
          <View style={[styles.cover, styles.noCover]}><Text style={styles.muted}>sem imagem</Text></View>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{game.titulo}</Text>
            {!isAdmin && (
              <Pressable onPress={() => wishlist.toggle(game)} hitSlop={10} style={styles.heart}>
                <Ionicons
                  name={inWishlist ? 'heart' : 'heart-outline'}
                  size={26}
                  color={inWishlist ? colors.danger : colors.muted}
                />
              </Pressable>
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.platform}><Text style={styles.platformText}>{game.plataforma}</Text></View>
            <Text style={styles.stock}>{semEstoque ? 'Sem estoque' : `${game.estoque} em estoque`}</Text>
          </View>

          <Text style={styles.price}>R$ {preco}</Text>

          {/* Acoes de compra */}
          {isAdmin ? (
            <View style={{ marginTop: spacing.md }}>
              <Button
                title="Editar jogo"
                onPress={() => router.push({ pathname: '/game-form', params: { id: String(game.id) } })}
              />
            </View>
          ) : owned ? (
            <View style={styles.ownedBox}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.ownedText}>Você já tem este jogo na biblioteca</Text>
            </View>
          ) : (
            <View style={styles.actions}>
              <View style={{ flex: 1 }}>
                <Button title="Comprar agora" onPress={comprarAgora} disabled={semEstoque} />
              </View>
              <Pressable
                onPress={() => add(game)}
                disabled={inCart || semEstoque}
                style={[styles.cartBtn, (inCart || semEstoque) && styles.cartBtnOff]}
              >
                <Ionicons name={inCart ? 'checkmark' : 'cart-outline'} size={20} color={inCart || semEstoque ? colors.muted : colors.primaryText} />
              </Pressable>
            </View>
          )}

          {/* Descricao */}
          <Text style={styles.section}>Sobre o jogo</Text>
          <Text style={styles.desc}>{game.descricao || 'Sem descrição disponível.'}</Text>

          {/* Requisitos */}
          <Text style={styles.section}>Requisitos do sistema</Text>
          <View style={styles.reqGrid}>
            <ReqCard titulo="Mínimos" itens={minimos} />
            <ReqCard titulo="Recomendados" itens={recomendados} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReqCard({ titulo, itens }: { titulo: string; itens: string[] }) {
  return (
    <View style={styles.reqCard}>
      <Text style={styles.reqTitle}>{titulo}</Text>
      {itens.length > 0 ? (
        itens.map((linha, i) => (
          <View key={i} style={styles.reqLine}>
            <Text style={styles.reqDot}>•</Text>
            <Text style={styles.reqText}>{linha}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.muted}>Não informado.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  muted: { color: colors.muted },
  content: { paddingBottom: spacing.xl },
  cover: { width: '100%', aspectRatio: 460 / 215, backgroundColor: colors.surfaceAlt },
  noCover: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', flex: 1 },
  heart: { paddingTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  platform: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.sm },
  platformText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  stock: { color: colors.muted, fontSize: 12 },
  price: { color: colors.primary, fontSize: 28, fontWeight: '800', marginTop: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  cartBtn: { width: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  cartBtnOff: { opacity: 0.6 },
  ownedBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  ownedText: { color: colors.success, fontWeight: '700' },
  section: { color: colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: spacing.sm },
  desc: { color: colors.text, fontSize: 15, lineHeight: 22 },
  reqGrid: { gap: spacing.md },
  reqCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  reqTitle: { color: colors.primary, fontWeight: '800', marginBottom: spacing.sm },
  reqLine: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  reqDot: { color: colors.primary },
  reqText: { color: colors.text, flex: 1, fontSize: 13.5, lineHeight: 20 },
});
