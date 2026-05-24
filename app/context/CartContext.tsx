"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  equipmentId: string;
  name: string;
  image: string;
  dailyPrice: number;
  deposit: number;
  quantity: number;
};

export type CartSession = {
  renterName: string;
  phone: string;
  teamMembers: string[];
  startDate: string; // ISO date string
  endDate: string;
};

type CartContextType = {
  session: CartSession | null;
  items: CartItem[];
  setSession: (s: CartSession) => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (equipmentId: string) => void;
  updateQuantity: (equipmentId: string, quantity: number) => void;
  clearCart: () => void;
  totalDays: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "camera-rental-cart";

type StoredCart = { session: CartSession | null; items: CartItem[] };

function loadFromStorage(): StoredCart {
  if (typeof window === "undefined") return { session: null, items: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { session: null, items: [] };
  } catch {
    return { session: null, items: [] };
  }
}

function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<CartSession | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage();
    setSessionState(stored.session);
    setItems(stored.items);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ session, items }));
  }, [session, items, hydrated]);

  const setSession = (s: CartSession) => setSessionState(s);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.equipmentId === item.equipmentId);
      if (existing) return prev;
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (equipmentId: string) =>
    setItems((prev) => prev.filter((i) => i.equipmentId !== equipmentId));

  const updateQuantity = (equipmentId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.equipmentId === equipmentId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setSessionState(null);
    setItems([]);
  };

  const totalDays =
    session ? daysBetween(session.startDate, session.endDate) : 0;

  const totalPrice = items.reduce(
    (sum, item) => sum + item.dailyPrice * item.quantity * totalDays + item.deposit * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        session,
        items,
        setSession,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalDays,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
