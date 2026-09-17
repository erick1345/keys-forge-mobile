import { api } from './client';
import { Game } from './games';

export type LibraryGame = Game & {
  purchase_id: number;
  purchased_at: string;
};

export async function buyGame(gameId: number): Promise<void> {
  await api.post('/purchase', { gameId });
}

export async function getLibrary(): Promise<LibraryGame[]> {
  const { data } = await api.get<LibraryGame[]>('/users/library');
  return data;
}
