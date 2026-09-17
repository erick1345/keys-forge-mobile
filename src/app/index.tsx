
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing } from '@/theme/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
  
    if (!email || !senha) {
      Alert.alert('Atencao', 'Preencha e-mail e senha.');
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), senha);
      router.replace('/loja'); 
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ??
        'Nao foi possivel conectar ao servidor. Verifique se o backend esta ligado.';
      Alert.alert('Erro no login', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>PlayHub</Text>
        <Text style={styles.subtitle}>Marketplace de keys de jogos</Text>

        <View style={styles.form}>
          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="voce@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <Input
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            placeholder="********"
            secureTextEntry
            editable={!loading}
          />
          <Button title="Entrar" onPress={handleLogin} loading={loading} />

          <Pressable onPress={() => router.push('/register')} style={styles.registerLink} disabled={loading}>
            <Text style={styles.registerText}>
              Não tem conta? <Text style={styles.registerBold}>Cadastre-se</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logo: {
    color: colors.primary,
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: { width: '100%' },
  registerLink: { marginTop: spacing.lg, alignItems: 'center' },
  registerText: { color: colors.muted, fontSize: 14 },
  registerBold: { color: colors.primary, fontWeight: '700' },
});
