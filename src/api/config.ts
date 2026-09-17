import Constants from 'expo-constants';
function resolveApiUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri; 
  const host = hostUri?.split(':')[0];

  if (host) {
    return `http://${host}:3001`;
  }

  return 'http://192.168.3.186:3001';
}

export const API_URL = resolveApiUrl();

export function resolveImageUrl(caminho?: string | null): string | undefined {
  if (!caminho) return undefined;
  if (caminho.startsWith('http')) return caminho;
  return `${API_URL}${caminho.startsWith('/') ? '' : '/'}${caminho}`;
}
