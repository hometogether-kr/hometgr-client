"use client";

import type { ReactNode } from "react";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ToastVariant } from "./toast";
import { Toast } from "./toast";
import { ToastViewport } from "./toast-viewport";

export interface ShowToastOptions {
  variant?: ToastVariant;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  /** 지정 시 우측 닫기 버튼을 표시합니다. */
  showCloseButton?: boolean;
  /** 자동 닫힘까지의 시간(ms). 0이면 자동으로 닫히지 않습니다. */
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: ReactNode, options?: ShowToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastState extends ShowToastOptions {
  message: ReactNode;
}

const DEFAULT_DURATION = 3000;

/**
 * 토스트 표시 컨텍스트
 *
 * 화면 상단 중앙에 한 번에 하나의 토스트만 띄웁니다. 새 토스트가 오면
 * 이전 토스트를 대체하고 타이머를 다시 시작합니다.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearTimer();
    setToast(null);
  }, [clearTimer]);

  const showToast = useCallback(
    (message: ReactNode, options: ShowToastOptions = {}) => {
      clearTimer();
      setToast({ message, ...options });

      const duration = options.duration ?? (options.showCloseButton ? 0 : DEFAULT_DURATION);
      if (duration > 0) {
        timerRef.current = setTimeout(() => setToast(null), duration);
      }
    },
    [clearTimer],
  );

  useEffect(() => clearTimer, [clearTimer]);

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

  return (
    <ToastContext value={value}>
      {children}
      {toast && (
        <ToastViewport>
          <Toast
            variant={toast.variant}
            description={toast.description}
            actionLabel={toast.actionLabel}
            onAction={toast.onAction}
            onClose={toast.showCloseButton && !toast.actionLabel ? hideToast : undefined}
          >
            {toast.message}
          </Toast>
        </ToastViewport>
      )}
    </ToastContext>
  );
}

export function useToast(): ToastContextValue {
  const context = use(ToastContext);

  if (!context) {
    throw new Error("useToast는 ToastProvider 안에서만 사용할 수 있습니다.");
  }

  return context;
}
