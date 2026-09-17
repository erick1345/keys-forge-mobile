
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buyGame } from '@/api/purchase';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useCart } from '@/contexts/CartContext';
import { colors, radius, spacing } from '@/theme/theme';

export default function PaymentScreen() {
  const { items, total, clear } = useCart();
  const [metodo, setMetodo] = useState<'cartao' | 'pix'>('cartao');
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  async function confirmar() {
    if (items.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione jogos antes de pagar.');
      return;
    }
    if (metodo === 'cartao' && (!nome || !numero || !validade || !cvv)) {
      Alert.alert('Atencao', 'Preencha os dados do cartão.');
      return;
    }

    try {
      setLoading(true);
      const results = await Promise.allSettled(items.map((g) => buyGame(g.id)));
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const fail = results.length - ok;
      clear();

      const irParaBiblioteca = () => router.replace('/biblioteca');

      if (fail === 0) {
        Alert.alert('Compra concluída', 'Jogos adicionados à sua biblioteca!', [
          { text: 'Ver biblioteca', onPress: irParaBiblioteca },
        ]);
      } else {
        Alert.alert(
          'Compra parcial',
          `${ok} jogo(s) comprado(s). ${fail} não puderam ser comprados (sem estoque ou já na biblioteca).`,
          [{ text: 'Ver biblioteca', onPress: irParaBiblioteca }]
        );
      }
    } catch {
      Alert.alert('Erro', 'Nao foi possivel concluir o pagamento.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Resumo */}
      <Text style={styles.section}>Resumo do pedido</Text>
      <View style={styles.card}>
        {items.map((g) => (
          <View key={g.id} style={styles.item}>
            <Text style={styles.itemTitle} numberOfLines={1}>{g.titulo}</Text>
            <Text style={styles.itemPrice}>R$ {Number(g.preco).toFixed(2).replace('.', ',')}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
        </View>
      </View>

      {/* Forma de pagamento */}
      <Text style={styles.section}>Forma de pagamento</Text>
      <View style={styles.methods}>
        <Pressable
          style={[styles.method, metodo === 'cartao' && styles.methodOn]}
          onPress={() => setMetodo('cartao')}
        >
          <Ionicons name="card-outline" size={18} color={metodo === 'cartao' ? colors.primary : colors.muted} />
          <Text style={[styles.methodText, metodo === 'cartao' && styles.methodTextOn]}>Cartão</Text>
        </Pressable>
        <Pressable
          style={[styles.method, metodo === 'pix' && styles.methodOn]}
          onPress={() => setMetodo('pix')}
        >
          <Ionicons name="qr-code-outline" size={18} color={metodo === 'pix' ? colors.primary : colors.muted} />
          <Text style={[styles.methodText, metodo === 'pix' && styles.methodTextOn]}>Pix</Text>
        </Pressable>
      </View>

      {metodo === 'cartao' ? (
        <View>
          <Input label="Nome no cartão" value={nome} onChangeText={setNome} placeholder="Como impresso no cartão" />
          <Input label="Número do cartão" value={numero} onChangeText={setNumero} placeholder="0000 0000 0000 0000" keyboardType="number-pad" />
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Input label="Validade" value={validade} onChangeText={setValidade} placeholder="MM/AA" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="CVV" value={cvv} onChangeText={setCvv} placeholder="123" keyboardType="number-pad" secureTextEntry />
            </View>
          </View>
          <View style={styles.secure}>
            <Ionicons name="lock-closed" size={13} color={colors.muted} />
            <Text style={styles.secureText}>Simulação de compra — nenhum dado real é cobrado.</Text>
          </View>
        </View>
      ) : (
        <View style={styles.pixBox}>
          <Ionicons name="qr-code" size={40} color={colors.primary} />
          <Text style={styles.pixCode}>PIX-PlayHub-2026</Text>
          <Text style={styles.secureText}>Ao confirmar, a compra é processada na hora (simulação).</Text>
        </View>
      )}

      <View style={{ marginTop: spacing.lg }}>
        <Button title="Confirmar pagamento" onPress={confirmar} loading={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  section: { color: colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm, marginTop: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  itemTitle: { color: colors.text, flex: 1, marginRight: spacing.md },
  itemPrice: { color: colors.muted },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.sm },
  totalLabel: { color: colors.text, fontWeight: '700' },
  totalValue: { color: colors.primary, fontWeight: '800', fontSize: 18 },
  methods: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  method: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  methodOn: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  methodText: { color: colors.muted, fontWeight: '700' },
  methodTextOn: { color: colors.primary },
  cardRow: { flexDirection: 'row', gap: spacing.md },
  secure: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
  secureText: { color: colors.muted, fontSize: 12, flex: 1 },
  pixBox: { alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  pixCode: { color: colors.text, fontWeight: '800', fontFamily: undefined, fontSize: 16, letterSpacing: 1 },
});
