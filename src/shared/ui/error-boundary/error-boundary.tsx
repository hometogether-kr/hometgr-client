"use client";

import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Component, type ReactNode } from "react";

export interface ErrorFallbackProps {
  error: Error;
  /** 폴백을 벗어나 다시 렌더를 시도합니다. 쿼리 리셋과 함께 실제 refetch로 이어집니다. */
  reset: () => void;
}

interface BoundaryProps {
  fallback: (props: ErrorFallbackProps) => ReactNode;
  /** QueryErrorResetBoundary가 주는 리셋 — 캐시된 에러 상태를 비웁니다 */
  onReset: () => void;
  children: ReactNode;
}

interface BoundaryState {
  error: Error | null;
}

/**
 * 렌더 중 발생한 에러를 잡아 폴백으로 대체하는 클래스 컴포넌트.
 * 에러 경계는 클래스에서만 구현할 수 있어 이 부분만 클래스로 둡니다.
 */
class Boundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  private handleReset = () => {
    this.props.onReset();
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error) {
      return this.props.fallback({ error, reset: this.handleReset });
    }
    return this.props.children;
  }
}

interface QueryErrorBoundaryProps {
  fallback: (props: ErrorFallbackProps) => ReactNode;
  children: ReactNode;
}

/**
 * react-query와 엮인 에러 경계
 *
 * `QueryErrorResetBoundary`의 `reset`을 폴백의 "다시 시도"에 연결해, 폴백을 벗어나면
 * Suspense 훅이 다시 걸리며 실제 refetch가 일어나도록 합니다. 표시할 수 있는 가장 작은
 * 영역을 감싸세요(AGENTS.md Suspense And Error Handling).
 */
export function QueryErrorBoundary({ fallback, children }: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <Boundary fallback={fallback} onReset={reset}>
          {children}
        </Boundary>
      )}
    </QueryErrorResetBoundary>
  );
}
