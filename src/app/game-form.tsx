
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { resolveImageUrl } from '@/api/config';
import { createGame, getGame, updateGame } from '@/api/games';
import { uploadImage } from '@/api/upload';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { colors, radius, spacing } from '@/theme/theme';

export default function GameFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [plataforma, setPlataforma] = useState('');
  const [estoque, setEstoque] = useState('');
  const [reqMin, setReqMin] = useState('');
  const [reqRec, setReqRec] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);


  useEffect(() => {
    if (!isEdit) return;
    getGame(Number(id))
      .then((g) => {
        setTitulo(g.titulo ?? '');
        setDescricao(g.descricao ?? '');
        setPreco(String(g.preco ?? ''));
        setPlataforma(g.plataforma ?? '');
        setEstoque(String(g.estoque ?? ''));
        setReqMin(g.requisitos_minimos ?? '');
        setReqRec(g.requisitos_recomendados ?? '');
        setImagemUrl(g.imagem_url ?? '');
      })
      .catch(() => Alert.alert('Erro', 'Nao foi possivel carregar o jogo.'));
  }, [id]);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permissao', 'Libere o acesso as fotos para enviar a imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1, // sem compressao: envia a imagem no tamanho real (valida os 5 MB)
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    try {
      setUploading(true);
      const name = asset.fileName ?? `foto-${Date.now()}.jpg`;
      const type = asset.mimeType ?? 'image/jpeg';
      const url = await uploadImage(asset.uri, name, type);
      setImagemUrl(url);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Nao foi possivel enviar a imagem.';
      Alert.alert('Erro no upload', msg);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!titulo.trim() || !plataforma.trim()) {
      Alert.alert('Atencao', 'Titulo e plataforma sao obrigatorios.');
      return;
    }
    const precoNum = Number(preco.replace(',', '.'));
    const estoqueNum = Number(estoque);
    if (Number.isNaN(precoNum) || precoNum < 0) {
      Alert.alert('Atencao', 'Preco invalido.');
      return;
    }
    if (!Number.isInteger(estoqueNum) || estoqueNum < 0) {
      Alert.alert('Atencao', 'Estoque deve ser um numero inteiro.');
      return;
    }

    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      preco: precoNum,
      plataforma: plataforma.trim(),
      estoque: estoqueNum,
      imagem_url: imagemUrl.trim(),
      requisitos_minimos: reqMin.trim(),
      requisitos_recomendados: reqRec.trim(),
    };

    try {
      setSaving(true);
      if (isEdit) {
        await updateGame(Number(id), payload);
      } else {
        await createGame(payload);
      }
      router.back();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Nao foi possivel salvar.';
      Alert.alert('Erro', msg);
    } finally {
      setSaving(false);
    }
  }

  const previewUri = resolveImageUrl(imagemUrl);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: isEdit ? 'Editar jogo' : 'Novo jogo' }} />
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Input label="Titulo" value={titulo} onChangeText={setTitulo} placeholder="Ex: Elden Ring" />
        <Input
          label="Descricao"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Breve descricao"
          multiline
          style={styles.textarea}
        />
        <Input label="Plataforma" value={plataforma} onChangeText={setPlataforma} placeholder="Ex: PC" />
        <Input
          label="Preco (R$)"
          value={preco}
          onChangeText={setPreco}
          placeholder="199.90"
          keyboardType="decimal-pad"
        />
        <Input
          label="Estoque"
          value={estoque}
          onChangeText={setEstoque}
          placeholder="10"
          keyboardType="number-pad"
        />

        <Input
          label="Requisitos minimos"
          value={reqMin}
          onChangeText={setReqMin}
          placeholder="SO: Windows 10 | CPU: i5 | RAM: 8 GB | GPU: GTX 960"
          multiline
          style={styles.textarea}
        />
        <Text style={styles.hint}>Separe cada item com &quot; | &quot; para aparecer em lista na pagina do jogo.</Text>

        <Input
          label="Requisitos recomendados"
          value={reqRec}
          onChangeText={setReqRec}
          placeholder="SO: Windows 10 | CPU: i7 | RAM: 16 GB | GPU: RTX 2060"
          multiline
          style={styles.textarea}
        />

        {/* Imagem: preview + botao para escolher/enviar do celular */}
        <Text style={styles.label}>Imagem</Text>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={[styles.preview, styles.previewEmpty]}>
            <Text style={styles.previewText}>sem imagem</Text>
          </View>
        )}
        <Button
          title={uploading ? 'Enviando...' : 'Escolher imagem do celular'}
          variant="outline"
          onPress={pickImage}
          loading={uploading}
        />
        <Text style={styles.imgHint}>Formatos aceitos: JPG, PNG, WEBP ou GIF  ·  máximo 5 MB</Text>

        <View style={styles.saveArea}>
          <Button
            title={isEdit ? 'Salvar alteracoes' : 'Cadastrar jogo'}
            onPress={handleSave}
            loading={saving}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  form: { padding: spacing.lg },
  textarea: { height: 90, paddingTop: spacing.sm, textAlignVertical: 'top' },
  label: { color: colors.muted, marginBottom: spacing.xs, fontSize: 13, fontWeight: '600' },
  hint: { color: colors.muted, fontSize: 12, marginTop: -8, marginBottom: spacing.md },
  imgHint: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 8 },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  previewEmpty: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  previewText: { color: colors.muted },
  saveArea: { marginTop: spacing.lg },
});
