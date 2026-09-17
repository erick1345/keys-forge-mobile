// Estado global de autenticacao: guarda o usuario logado e o token,
// e oferece signIn/signOut para o app inteiro (via hook useAuth).
import { createContext, ReactNode, useContext, useState } from 'react';
import { login as loginRequest, User } from '@/api/auth';
import { setAuthToken } from '@/api/client';

type AuthContextData = {
  user: User | null;
  isAdmin: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => void;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function signIn(email: string, senha: string) {
    const { user: loggedUser, token } = await loginRequest(email, senha);
    setAuthToken(token); // passa a enviar o token nas proximas requisicoes
    setUser(loggedUser);
  }

  function signOut() {
    setAuthToken(null);
    setUser(null);
  }

  function updateUser(updated: User) {
    setUser(updated);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.nivel_acesso === 'admin',
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para qualquer tela acessar o usuario logado e as acoes de login/logout.
export function useAuth() {
  return useContext(AuthContext);
}
