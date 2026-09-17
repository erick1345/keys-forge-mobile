import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { resolveImageUrl } from '@/api/config';
import { updateProfile, uploadAvatar } from '@/api/users';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/contexts/AuthContext';
import { colors, radius, spacing } from '@/theme/theme';

export default function PerfilScreen() {
  const { user, isAdmin, signOut, updateUser } = useAuth();
  const [nome, setNome] = useState(user?.nome ?? '');
  const [senha, setSenha] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const fotoUri = resolveImageUrl(user?.foto_url);
  async function trocarFoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permissao', 'Libere o acesso as fotos para trocar a imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1, // sem compressao: envia no tamanho real (valida os 5 MB)
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    try {
      setUploadingFoto(true);
      const name = asset.fileName ?? `avatar-${Date.now()}.jpg`;
      const type = asset.mimeType ?? 'image/jpeg';
      const atualizado = await uploadAvatar(asset.uri, name, type);
      updateUser(atualizado);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Nao foi possivel enviar a foto.';
      Alert.alert('Erro', msg);
    } finally {
      setUploadingFoto(false);
    }
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert('Atencao', 'O nome não pode ficar vazio.');
      return;
    }
    if (senha && senha.length < 8) {
      Alert.alert('Atencao', 'A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    try {
      setSaving(true);
      const atualizado = await updateProfile(nome.trim(), senha || undefined);
      updateUser(atualizado);
      setSenha('');
      Alert.alert('Pronto', 'Perfil atualizado com sucesso.');
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Nao foi possivel salvar.';
      Alert.alert('Erro', msg);
    } finally {
      setSaving(false);
    }
  }

  function sair() {
    signOut();
    router.replace('/');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={trocarFoto} disabled={uploadingFoto} style={styles.avatarWrap}>
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.nome ?? '?').charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.cameraBadge}>
            {uploadingFoto ? (
              <ActivityIndicator size="small" color={colors.primaryText} />
            ) : (
              <Ionicons name="camera" size={14} color={colors.primaryText} />
            )}
          </View>
        </Pressable>

        <Pressable onPress={trocarFoto} disabled={uploadingFoto} hitSlop={6}>
          <Text style={styles.changePhoto}>{uploadingFoto ? 'Enviando...' : 'Trocar foto'}</Text>
        </Pressable>

        <Text style={styles.name}>{user?.nome}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={[styles.badge, isAdmin ? styles.badgeAdmin : styles.badgeUser]}>
          <Text style={[styles.badgeText, { color: isAdmin ? colors.primaryText : colors.text }]}>
            {isAdmin ? 'Administrador' : 'Cliente'}
          </Text>
        </View>
      </View>

      <Text style={styles.section}>Editar dados</Text>
      <Input label="Nome" value={nome} onChangeText={setNome} />
      <Input label="Nova senha (opcional)" value={senha} onChangeText={setSenha} placeholder="deixe em branco para manter" secureTextEntry />
      <Button title="Salvar alterações" onPress={salvar} loading={saving} />

      <View style={{ marginTop: spacing.xl }}>
        <Button title="Sair da conta" variant="danger" onPress={sair} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  avatarWrap: { width: 88, height: 88 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.surfaceAlt },
  avatarText: { color: colors.primary, fontSize: 34, fontWeight: '800' },
  cameraBadge: {
    position: 'absolute', right: 0, bottom: 0,
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background,
  },
  changePhoto: { color: colors.primary, fontWeight: '700', fontSize: 13, marginTop: spacing.sm },
  name: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: spacing.xs },
  email: { color: colors.muted, fontSize: 13, marginTop: 2 },
  badge: { marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.sm },
  badgeAdmin: { backgroundColor: colors.primary },
  badgeUser: { backgroundColor: colors.surfaceAlt },
  badgeText: { color: colors.primaryText, fontWeight: '700', fontSize: 12 },
  section: { color: colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
});
