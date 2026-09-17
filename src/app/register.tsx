
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { register } from '@/api/auth';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing } from '@/theme/theme';

export default function RegisterScreen() {
  const { signIn } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!nome.trim() || !email.trim() || !cpf.trim() || !senha) {
      Alert.alert('Atencao', 'Preencha todos os campos.');
      return;
    }
    if (senha.length < 8 || !/\d/.test(senha)) {
      Alert.alert('Atencao', 'A senha deve ter no mínimo 8 caracteres e pelo menos 1 número.');
      return;
    }

    try {
      setLoading(true);
      const cpfLimpo = cpf.replace(/\D/g, '');
      await register(nome.trim(), email.trim(), cpfLimpo, senha);
     
      await signIn(email.trim(), senha);
      router.replace('/loja');
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Nao foi possivel cadastrar.';
      Alert.alert('Erro no cadastro', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>Cadastre-se para comprar e montar sua biblioteca.</Text>

      <View style={styles.form}>
        <Input label="Nome completo" value={nome} onChangeText={setNome} placeholder="Seu nome" />
        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          label="CPF"
          value={cpf}
          onChangeText={setCpf}
          placeholder="000.000.000-00"
          keyboardType="number-pad"
        />
        <Input
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          placeholder="mínimo 8 caracteres e 1 número"
          secureTextEntry
        />
        <Button title="Cadastrar" onPress={handleRegister} loading={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  title: { color: colors.text, fontSize: 26, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { width: '100%' },
});
