// Carrinho de compras (estado global em memoria). O cliente adiciona jogos
// aqui e finaliza na tela de pagamento.
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { Game } from '@/api/games';

type CartContextData = {
  items: Game[];
  count: number;
  total: number;
  add: (game: Game) => void;
  remove: (id: number) => void;
  clear: () => void;
  has: (id: number) => boolean;
};

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Game[]>([]);

  function add(game: Game) {
    setItems((prev) => (prev.some((g) => g.id === game.id) ? prev : [...prev, game]));
  }

  function remove(id: number) {
    setItems((prev) => prev.filter((g) => g.id !== id));
  }

  function clear() {
    setItems([]);
  }

  function has(id: number) {
    return items.some((g) => g.id === id);
  }

  const total = useMemo(
    () => items.reduce((sum, g) => sum + Number(g.preco), 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, count: items.length, total, add, remove, clear, has }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
