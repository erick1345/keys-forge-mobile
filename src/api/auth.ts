import { api } from './client';

export type User = {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  nivel_acesso: 'admin' | 'cliente';
  foto_url?: string | null;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/login', { email, senha });
  return data;
}

export async function register(
  nome: string,
  email: string,
  cpf: string,
  senha: string
): Promise<void> {
  await api.post('/register', { nome, email, cpf, senha });
}
