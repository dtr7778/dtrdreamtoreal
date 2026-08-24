"use client";

import { useEffect, useRef, useState } from "react";

import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { createQueryClient } from "@/lib/tanstack/query/query-client";

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: QueryClient;
  }
}

export function TanstackQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => createQueryClient());
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    window.__TANSTACK_QUERY_CLIENT__ = queryClient;
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
