import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SettingsState = {
  spanish: boolean;
  forceFreeForTesting: boolean;
  setSpanish: (value: boolean) => void;
  setForceFreeForTesting: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      spanish: false,
      forceFreeForTesting: false,
      setSpanish: (value) => set({ spanish: value }),
      setForceFreeForTesting: (value) => set({ forceFreeForTesting: value }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
