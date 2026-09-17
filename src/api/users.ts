import { User } from './auth';
import { api } from './client';

export async function updateProfile(nome: string, senha?: string): Promise<User> {
  const body: { nome: string; senha?: string } = { nome };
  if (senha) body.senha = senha;

  const { data } = await api.put<{ message: string; user: User }>('/users/profile', body);
  return data.user;
}

export async function uploadAvatar(uri: string, name: string, type: string): Promise<User> {
  const formData = new FormData();
  formData.append('imagem', { uri, name, type } as any);

  const { data } = await api.post<{ user: User }>('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.user;
}
