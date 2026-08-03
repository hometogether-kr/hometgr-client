"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { userQueryKeys } from "@/domains/user";
import { ApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config";

const MAX_RETRY_COUNT = 2;

function createQueryClient(onUnauthorized: () => void): QueryClient {
  /*
   * 세션이 끊긴 상태의 요청은 어느 화면에서 나갔든 결론이 같습니다.
   * 화면마다 401을 따로 처리하면 빠뜨리기 쉬워 여기서 한 번에 받습니다.
   */
  const handleError = (error: unknown) => {
    if (error instanceof ApiError && error.isUnauthorized) onUnauthorized();
  };

  return new QueryClient({
    queryCache: new QueryCache({ onError: handleError }),
    mutationCache: new MutationCache({ onError: handleError }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        /*
         * 권한·검증 오류는 다시 보내도 결과가 같으므로 재시도하지 않고,
         * 네트워크·서버 오류만 짧게 재시도합니다.
         */
        retry: (failureCount, error) =>
          error instanceof ApiError
            ? error.isRetryable && failureCount < MAX_RETRY_COUNT
            : failureCount < MAX_RETRY_COUNT,
      },
      mutations: { retry: false },
    },
  });
}

/**
 * 서버 상태 캐시 provider
 *
 * `QueryClient`를 모듈 최상단에서 만들면 서버에서 여러 사용자의 요청이 같은 캐시를
 * 공유하게 되므로, 클라이언트 렌더마다 한 번만 생성되도록 state에 담습니다.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [queryClient] = useState(() => {
    // 핸들러가 자기 자신이 붙을 client를 참조해야 해서 한 단계 감쌉니다.
    const created: { client?: QueryClient } = {};

    created.client = createQueryClient(() => {
      // 헤더가 곧바로 비로그인으로 돌아오도록 세션 캐시를 비웁니다.
      created.client?.removeQueries({ queryKey: userQueryKeys.me() });
      router.replace(`${ROUTES.auth.login}?error=session_expired`);
    });

    return created.client;
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
