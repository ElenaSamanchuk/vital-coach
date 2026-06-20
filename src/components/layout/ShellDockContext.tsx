"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ShellDockContextValue = {
  dock: ReactNode;
  setDock: (dock: ReactNode) => void;
};

const ShellDockContext = createContext<ShellDockContextValue | null>(null);

export function ShellDockProvider({ children }: { children: ReactNode }) {
  const [dock, setDockState] = useState<ReactNode>(null);
  const setDock = useCallback((next: ReactNode) => setDockState(next), []);

  return (
    <ShellDockContext.Provider value={{ dock, setDock }}>{children}</ShellDockContext.Provider>
  );
}

function useShellDockContext() {
  const ctx = useContext(ShellDockContext);
  if (!ctx) throw new Error("ShellDockProvider missing");
  return ctx;
}

/** Регистрирует кнопку в доке (только на «Сегодня») */
export function ShellDockSlot({ children }: { children: ReactNode }) {
  const { setDock } = useShellDockContext();

  useEffect(() => {
    setDock(children);
    return () => setDock(null);
  }, [children, setDock]);

  return null;
}

export function useShellDock() {
  return useShellDockContext().dock;
}
