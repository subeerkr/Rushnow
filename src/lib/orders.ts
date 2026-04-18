export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "completed" | "cancelled";
  rating?: number; // 1-5
  feedback?: string;
  createdAt: string;
}

// Simple in-memory orders store for demo/admin usage.
// Replace with a real DB in production.
const orders: Order[] = [
  {
    id: "ord_1001",
    user: "alice@example.com",
    items: [
      { productId: "apple", name: "Red Apples", price: 120, quantity: 1 },
    ],
    total: 120,
    status: "completed",
    rating: 5,
    feedback: "Great quality and fast delivery!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "ord_1002",
    user: "bob@example.com",
    items: [
      { productId: "tomato", name: "Tomatoes", price: 40, quantity: 2 },
    ],
    total: 80,
    status: "completed",
    rating: 4,
    feedback: "Good, but a few tomatoes were soft.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "ord_1003",
    user: "charlie@example.com",
    items: [
      { productId: "milk", name: "Whole Milk", price: 70, quantity: 2 },
    ],
    total: 140,
    status: "pending",
    createdAt: new Date().toISOString(),
  },
];

export function getOrders(): Order[] {
  // Return a shallow copy so callers don't mutate internal store accidentally.
  return orders.map((o) => ({ ...o }));
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function createOrder(order: Omit<Order, "id" | "createdAt"> & Partial<Pick<Order, "id" | "createdAt">>): Order {
  const id = order.id ?? `ord_${Math.floor(Math.random() * 9000) + 1000}`;
  const createdAt = order.createdAt ?? new Date().toISOString();
  const newOrder: Order = {
    id,
    createdAt,
    user: order.user,
    items: order.items,
    total: order.total,
    status: order.status ?? "pending",
    rating: order.rating,
    feedback: order.feedback,
  };
  orders.unshift(newOrder);
  return newOrder;
}

export function updateOrderRating(id: string, rating?: number, feedback?: string): Order | null {
  const ord = orders.find((o) => o.id === id);
  if (!ord) return null;
  if (typeof rating === "number") ord.rating = rating;
  if (typeof feedback === "string") ord.feedback = feedback;
  return { ...ord };
}
