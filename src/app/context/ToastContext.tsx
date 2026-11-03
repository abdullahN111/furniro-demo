"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Link from "next/link";
import { FiCheckCircle, FiInfo, FiAlertCircle, FiX } from "react-icons/fi";

export type ToastType = "success" | "info" | "error";

export interface ToastOptions {
  message: string;
  type?: ToastType;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      message,
      type = "success",
      actionLabel,
      actionHref,
      onAction,
      duration = 3500,
    }: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [
        ...prev.slice(-2),
        { id, message, type, actionLabel, actionHref, onAction, duration },
      ]);

      setTimeout(() => {
        dismissToast(id);
      }, duration);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[3000] flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3.5 shadow-xl border border-gray-100 text-gray-800 transition-all duration-300"
          >
            <div className="flex items-center gap-3 min-w-0">
              {toast.type === "error" ? (
                <FiAlertCircle className="text-red-500 text-xl shrink-0" />
              ) : toast.type === "info" ? (
                <FiInfo className="text-[#B88E2F] text-xl shrink-0" />
              ) : (
                <FiCheckCircle className="text-emerald-600 text-xl shrink-0" />
              )}
              <p className="text-sm font-medium text-gray-800 leading-snug truncate">
                {toast.message}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.actionLabel && toast.actionHref && (
                <Link
                  href={toast.actionHref}
                  onClick={() => dismissToast(toast.id)}
                  className="text-xs font-semibold text-white bg-[#B88E2F] hover:bg-[#9f7924] px-3 py-1.5 rounded transition-colors"
                >
                  {toast.actionLabel}
                </Link>
              )}
              {toast.actionLabel && toast.onAction && !toast.actionHref && (
                <button
                  type="button"
                  onClick={() => {
                    toast.onAction?.();
                    dismissToast(toast.id);
                  }}
                  className="text-xs font-semibold text-white bg-[#B88E2F] hover:bg-[#9f7924] px-3 py-1.5 rounded transition-colors"
                >
                  {toast.actionLabel}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
              >
                <FiX className="text-base" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

