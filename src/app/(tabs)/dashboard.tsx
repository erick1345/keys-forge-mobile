
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AdminDashboard, getAdminDashboard, getSalesStats, SalesStats } from '@/api/dashboard';
import { colors, radius, spacing } from '@/theme/theme';

function money(v: number) {
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`;
}

export default function DashboardScreen() {
  const [dash, setDash] = useState<AdminDashboard | null>(null);
  const [sales, setSales] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [d, s] = await Promise.all([getAdminDashboard(), getSalesStats()]);
      setDash(d);
      setSales(s);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, []));

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.grid}>
        <Stat label="Jogos" value={String(dash?.totalJogos ?? 0)} />
        <Stat label="Estoque baixo" value={String(dash?.estoqueBaixo ?? 0)} accent="danger" />
        <Stat label="Valor em estoque" value={money(dash?.valorEstoque ?? 0)} wide />
        <Stat label="Vendas" value={String(sales?.totalSales ?? 0)} />
        <Stat label="Receita" value={money(sales?.totalRevenue ?? 0)} accent="good" />
      </View>

      <Text style={styles.section}>Mais vendidos</Text>
      <View style={styles.card}>
        {sales && sales.topGames.length > 0 ? (
          sales.topGames.slice(0, 6).map((g) => (
            <View key={g.gameId} style={styles.row}>
              <Text style={styles.rowTitle} numberOfLines={1}>{g.titulo}</Text>
              <Text style={styles.rowMeta}>{g.totalSales} venda(s) · {money(g.totalRevenue)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.muted}>Nenhuma venda ainda.</Text>
        )}
      </View>

      <Text style={styles.section}>Estoque mais baixo</Text>
      <View style={styles.card}>
        {dash && dash.ranking.length > 0 ? (
          dash.ranking.slice(0, 6).map((g, i) => (
            <View key={`${g.titulo}-${i}`} style={styles.row}>
              <Text style={styles.rowTitle} numberOfLines={1}>{g.titulo}</Text>
              <Text style={styles.rowMeta}>{g.estoque} un.</Text>
            </View>
          ))
        ) : (
          <Text style={styles.muted}>Sem dados.</Text>
        )}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value, accent, wide }: { label: string; value: string; accent?: 'good' | 'danger'; wide?: boolean }) {
  const color = accent === 'good' ? colors.success : accent === 'danger' ? colors.danger : colors.primary;
  return (
    <View style={[styles.stat, wide && styles.statWide]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: {
    flexGrow: 1, flexBasis: '30%', minWidth: 100,
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
  },
  statWide: { flexBasis: '100%' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  section: { color: colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: spacing.sm, gap: spacing.md },
  rowTitle: { color: colors.text, flex: 1, fontWeight: '600' },
  rowMeta: { color: colors.muted, fontSize: 12 },
  muted: { color: colors.muted, padding: spacing.sm },
});
