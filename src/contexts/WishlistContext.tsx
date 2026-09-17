// Lista de desejos (estado global em memoria). O usuario marca jogos que
// quer acompanhar; a tela "Lista de desejos" mostra todos.
import { createContext, ReactNode, useContext, useState } from 'react';
import { Game } from '@/api/games';

type WishlistContextData = {
  items: Game[];
  count: number;
  toggle: (game: Game) => void;
  remove: (id: number) => void;
  has: (id: number) => boolean;
};

const WishlistContext = createContext<WishlistContextData>({} as WishlistContextData);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Game[]>([]);

  function toggle(game: Game) {
    setItems((prev) =>
      prev.some((g) => g.id === game.id)
        ? prev.filter((g) => g.id !== game.id)
        : [...prev, game]
    );
  }

  function remove(id: number) {
    setItems((prev) => prev.filter((g) => g.id !== id));
  }

  function has(id: number) {
    return items.some((g) => g.id === id);
  }

  return (
    <WishlistContext.Provider value={{ items, count: items.length, toggle, remove, has }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
