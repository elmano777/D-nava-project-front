import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price_in_cents: number;
  quantity: number;
  image_url: string;
}

export type DeliveryType = "recojo_tienda" | "delivery";

export const MINIMUM_ORDER_AMOUNT = 2; // 2 soles
export const DELIVERY_COST = 5; // 5 soles

interface CartState {
  items: CartItem[];
  deliveryType: DeliveryType;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setDeliveryType: (type: DeliveryType) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDeliveryCost: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryType: "recojo_tienda" as DeliveryType,

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === item.id);

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += 1;
            return { items: newItems };
          }

          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== id) };
          }

          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item,
            ),
          };
        });
      },

      setDeliveryType: (type) => {
        set({ deliveryType: type });
      },

      clearCart: () => {
        set({ items: [], deliveryType: "recojo_tienda" });
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + (item.price_in_cents * item.quantity) / 100,
          0,
        );
      },

      getDeliveryCost: () => {
        return get().deliveryType === "delivery" ? DELIVERY_COST : 0;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getDeliveryCost();
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);
