
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { GameCard } from '@/components/GameCard';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { colors, spacing } from '@/theme/theme';

export default function WishlistScreen() {
  const { items } = useWishlist();
  const cart = useCart();

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={54} color={colors.muted} />
        <Text style={styles.title}>Sua lista de desejos está vazia</Text>
        <Text style={styles.text}>Toque no coração na página de um jogo para adicioná-lo aqui.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(g) => String(g.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <GameCard
            game={item}
            onPress={() => router.push({ pathname: '/game/[id]', params: { id: String(item.id) } })}
            onAddToCart={() => cart.add(item)}
            onBuy={() => { cart.add(item); router.push('/payment'); }}
            inCart={cart.has(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, gap: spacing.sm, padding: spacing.xl },
  title: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: spacing.sm },
  text: { color: colors.muted, textAlign: 'center' },
});
