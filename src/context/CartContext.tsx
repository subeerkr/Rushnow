"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { Product } from "../lib/products";

export interface CartItem extends Product {
  quantity: number;
}

interface CartPublicState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  initialized: boolean;
  addItem: (p: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clear: () => void;
  getItem: (id: string) => CartItem | undefined;
}

interface InternalState {
  items: CartItem[];
}

type CartAction =
  | { type: "SET"; payload: CartItem[] }
  | { type: "ADD"; payload: Product }
  | { type: "REMOVE"; payload: string }
  | { type: "UPDATE"; payload: { id: string; quantity: number } }
  | { type: "CLEAR" };

const CartCtx = createContext<CartPublicState | undefined>(undefined);
const CART_STORAGE_KEY = "rushnow-cart-v1";

function sanitizeItems(items: CartItem[]): CartItem[] {
  return items
    .filter((item) => item && item.id && item.quantity > 0)
    .map((item) => ({
      ...item,
      quantity: Math.min(99, Math.max(1, Math.floor(item.quantity))),
    }));
}

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return sanitizeItems(parsed);
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function reducer(state: InternalState, action: CartAction): InternalState {
  switch (action.type) {
    case "SET":
      return { items: sanitizeItems(action.payload) };
    case "ADD": {
      const exists = state.items.find((item) => item.id === action.payload.id);
      if (exists) {
        return {
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: Math.min(99, item.quantity + 1) }
              : item
          ),
        };
      }
      return { items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case "REMOVE":
      return {
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case "UPDATE": {
      const qty = Math.floor(action.payload.quantity);
      if (qty <= 0 || Number.isNaN(qty)) {
        return { items: state.items.filter((i) => i.id !== action.payload.id) };
      }
      return {
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.min(99, qty) }
            : item
        ),
      };
    }
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [initialized, setInitialized] = useState(false);
  const isHydratingRef = useRef(true);

  useEffect(() => {
    const stored = loadFromStorage();
    dispatch({ type: "SET", payload: stored });
    setInitialized(true);
    isHydratingRef.current = false;
  }, []);

  useEffect(() => {
    if (!initialized || isHydratingRef.current) return;
    saveToStorage(state.items);
  }, [state.items, initialized]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY) return;
      try {
        const next = event.newValue ? JSON.parse(event.newValue) : [];
        dispatch({ type: "SET", payload: next });
      } catch {
        // ignore malformed data from other tabs
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback(
    (product: Product) => dispatch({ type: "ADD", payload: product }),
    []
  );
  const removeItem = useCallback(
    (id: string) => dispatch({ type: "REMOVE", payload: id }),
    []
  );
  const updateQuantity = useCallback(
    (id: string, quantity: number) =>
      dispatch({ type: "UPDATE", payload: { id, quantity } }),
    []
  );
  const increment = useCallback(
    (id: string) => {
      const item = state.items.find((i) => i.id === id);
      if (!item) return;
      dispatch({
        type: "UPDATE",
        payload: { id, quantity: item.quantity + 1 },
      });
    },
    [state.items]
  );
  const decrement = useCallback(
    (id: string) => {
      const item = state.items.find((i) => i.id === id);
      if (!item) return;
      dispatch({
        type: "UPDATE",
        payload: { id, quantity: item.quantity - 1 },
      });
    },
    [state.items]
  );
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const totals = useMemo(() => {
    const subtotal = state.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const totalItems = state.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    // Delivery is free when there are no items or subtotal is greater than 100
    // Otherwise a flat delivery charge of ₹30 applies
    const deliveryFee = subtotal === 0 || subtotal > 100 ? 0 : 30;
    const grandTotal = subtotal + deliveryFee;
    return { subtotal, totalItems, deliveryFee, grandTotal };
  }, [state.items]);

  const getItem = useCallback(
    (id: string) => state.items.find((item) => item.id === id),
    [state.items]
  );

  const value: CartPublicState = {
    items: state.items,
    totalItems: totals.totalItems,
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    grandTotal: totals.grandTotal,
    initialized,
    addItem,
    removeItem,
    updateQuantity,
    increment,
    decrement,
    clear,
    getItem,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
};

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("CartContext missing");
  return ctx;
}
