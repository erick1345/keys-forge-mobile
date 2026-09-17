import { api } from './client';

export async function uploadImage(
  uri: string,
  name: string,
  type: string
): Promise<string> {
  const formData = new FormData();
  
  formData.append('imagem', { uri, name, type } as any);

  const { data } = await api.post<{ url: string }>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.url;
}
