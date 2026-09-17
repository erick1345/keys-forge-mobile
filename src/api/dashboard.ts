import { api } from './client';

export type AdminDashboard = {
  totalJogos: number;
  valorEstoque: number;
  estoqueBaixo: number;
  ultimosJogos: { id: number; titulo: string; preco: number; estoque: number }[];
  ranking: { titulo: string; estoque: number }[];
};

export type SalesStats = {
  topGames: { gameId: number; titulo: string; totalSales: number; totalRevenue: number }[];
  totalSales: number;
  totalRevenue: number;
};

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const { data } = await api.get<AdminDashboard>('/dashboard/admin');
  return data;
}

export async function getSalesStats(): Promise<SalesStats> {
  const { data } = await api.get<SalesStats>('/dashboard/sales');
  return data;
}
