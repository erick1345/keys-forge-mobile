
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { resolveImageUrl } from '@/api/config';
import { Game } from '@/api/games';
import { colors, radius, spacing } from '@/theme/theme';

type Props = {
  game: Game;
  isAdmin?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddToCart?: () => void;
  onBuy?: () => void;
  inCart?: boolean;
  owned?: boolean;
};

export function GameCard({ game, isAdmin, onPress, onEdit, onDelete, onAddToCart, onBuy, inCart, owned }: Props) {
  const preco = Number(game.preco).toFixed(2).replace('.', ',');
  const imageUri = resolveImageUrl(game.imagem_url);
  const semEstoque = Number(game.estoque) <= 0;

  return (
    <Pressable style={styles.card} onPress={onPress} disabled={!onPress}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text style={styles.noImageText}>sem imagem</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{game.titulo}</Text>
        <Text style={styles.meta}>{game.plataforma}{owned ? '' : ` - estoque ${game.estoque}`}</Text>
        <Text style={styles.price}>R$ {preco}</Text>

        {isAdmin && onEdit && onDelete && (
          <View style={styles.actions}>
            <Pressable onPress={onEdit} style={[styles.btn, styles.edit]}>
              <Text style={styles.btnText}>Editar</Text>
            </Pressable>
            <Pressable onPress={onDelete} style={[styles.btn, styles.del]}>
              <Text style={styles.btnText}>Excluir</Text>
            </Pressable>
          </View>
        )}

        {owned && (
          <View style={styles.ownedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={styles.ownedText}>Na biblioteca</Text>
          </View>
        )}

        {!isAdmin && !owned && (onBuy || onAddToCart) && (
          <View style={styles.buyRow}>
            {onBuy && (
              <Pressable
                onPress={onBuy}
                disabled={semEstoque}
                style={[styles.buyBtn, semEstoque && styles.btnOff]}
              >
                <Text style={[styles.buyText, semEstoque && styles.btnTextOff]}>
                  {semEstoque ? 'Sem estoque' : 'Comprar'}
                </Text>
              </Pressable>
            )}
            {onAddToCart && !semEstoque && (
              <Pressable
                onPress={onAddToCart}
                disabled={inCart}
                style={[styles.cartBtn, inCart && styles.btnOff]}
              >
                <Ionicons
                  name={inCart ? 'checkmark' : 'cart-outline'}
                  size={15}
                  color={inCart ? colors.muted : colors.text}
                />
                <Text style={[styles.cartBtnText, inCart && styles.btnTextOff]}>
                  {inCart ? 'No carrinho' : 'Carrinho'}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  image: { width: '100%', aspectRatio: 460 / 215, backgroundColor: colors.surfaceAlt },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  noImageText: { color: colors.muted, fontSize: 12 },
  info: { padding: spacing.md },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  price: { color: colors.primary, fontSize: 18, fontWeight: '800', marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btn: { paddingVertical: 8, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  edit: { backgroundColor: colors.surfaceAlt },
  del: { backgroundColor: colors.danger },
  btnText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  buyRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  buyBtn: {
    backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: spacing.lg,
    borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center',
  },
  buyText: { color: colors.primaryText, fontWeight: '800', fontSize: 14 },
  cartBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border,
    paddingVertical: 10, paddingHorizontal: spacing.md, borderRadius: radius.sm,
  },
  cartBtnText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  btnOff: { opacity: 0.5 },
  btnTextOff: { color: colors.muted },
  ownedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.sm },
  ownedText: { color: colors.success, fontWeight: '700', fontSize: 12 },
});
