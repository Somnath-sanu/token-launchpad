import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface StoreProps {
  count: number;
  setCount: (val: number) => void;
}

export const useLimit = create<StoreProps>()(
  persist(
    (set) => ({
      count: 0,
      setCount: (val: number) => set((state) => ({ count: state.count + val })),
    }),
    {
      name: "store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
