import { api } from './client';

export type Game = {
  id: number;
  titulo: string;
  descricao: string;
  preco: string | number;
  plataforma: string;
  estoque: number;
  imagem_url: string | null;
  requisitos_minimos?: string | null;
  requisitos_recomendados?: string | null;
};

export type GameInput = {
  titulo: string;
  descricao: string;
  preco: number;
  plataforma: string;
  estoque: number;
  imagem_url: string;
  requisitos_minimos?: string;
  requisitos_recomendados?: string;
};

type ListResponse = {
  jogos: Game[];
  total: number;
  totalPages: number;
  currentPage: number;
};

export async function listGames(page = 1, limit = 20): Promise<ListResponse> {
  const { data } = await api.get<ListResponse>('/games', { params: { page, limit } });
  return data;
}

export async function getGame(id: number): Promise<Game> {
  const { data } = await api.get<Game>(`/games/${id}`);
  return data;
}

export async function createGame(input: GameInput): Promise<Game> {
  const { data } = await api.post<Game>('/games', input);
  return data;
}

export async function updateGame(id: number, input: GameInput): Promise<Game> {
  const { data } = await api.put<Game>(`/games/${id}`, input);
  return data;
}

export async function deleteGame(id: number): Promise<void> {
  await api.delete(`/games/${id}`);
}
