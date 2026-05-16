import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SettingsState = {
  IS_PREMIUM: boolean;
  spanish: boolean;
  setSpanish: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      IS_PREMIUM: false,
      spanish: false,
      setSpanish: (value) => set({ spanish: value }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);