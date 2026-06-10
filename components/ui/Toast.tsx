"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Info, XCircle } from "lucide-react";
import * as React from "react";

type Toast = {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "info";
};

type ToastContextValue = {
  toast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((input: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, ...input }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed right-4 top-24 z-[100] grid w-[min(380px,calc(100vw-32px))] gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((item) => {
            const Icon = item.type === "error" ? XCircle : item.type === "info" ? Info : CheckCircle;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                className="rounded-md border border-[#DAE2EA] bg-white p-4 text-slate-950 shadow-[0_10px_32px_rgba(15,45,78,0.12)]"
              >
                <div className="flex gap-3">
                  <Icon className="mt-0.5 h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    {item.description ? <p className="mt-1 text-sm text-slate-600">{item.description}</p> : null}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
