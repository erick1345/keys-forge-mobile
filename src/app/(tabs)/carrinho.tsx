
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resolveImageUrl } from '@/api/config';
import { Button } from '@/components/Button';
import { useCart } from '@/contexts/CartContext';
import { colors, radius, spacing } from '@/theme/theme';

export default function CarrinhoScreen() {
  const { items, remove, total } = useCart();

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="cart-outline" size={54} color={colors.muted} />
        <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
        <Text style={styles.emptyText}>Adicione jogos pela Loja para continuar.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const uri = resolveImageUrl(item.imagem_url);
          return (
            <View style={styles.row}>
              {uri ? <Image source={{ uri }} style={styles.thumb} /> : <View style={[styles.thumb, styles.noImg]} />}
              <View style={styles.rowInfo}>
                <Text style={styles.title} numberOfLines={1}>{item.titulo}</Text>
                <Text style={styles.plat}>{item.plataforma}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.price}>R$ {Number(item.preco).toFixed(2).replace('.', ',')}</Text>
                <Pressable onPress={() => remove(item.id)} hitSlop={8}>
                  <Text style={styles.remove}>Remover</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{items.length} item(ns)</Text>
          <Text style={styles.totalValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
        </View>
        <Button title="Ir para pagamento" onPress={() => router.push('/payment')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.sm, marginBottom: spacing.sm,
  },
  thumb: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  noImg: {},
  rowInfo: { flex: 1 },
  title: { color: colors.text, fontWeight: '700', fontSize: 15 },
  plat: { color: colors.muted, fontSize: 12, marginTop: 2 },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  price: { color: colors.primary, fontWeight: '800' },
  remove: { color: colors.danger, fontSize: 12, fontWeight: '600' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, gap: spacing.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: colors.muted },
  totalValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, gap: spacing.sm, padding: spacing.xl },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: spacing.sm },
  emptyText: { color: colors.muted, textAlign: 'center' },
});
