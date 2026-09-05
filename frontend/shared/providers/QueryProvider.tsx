'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default لكل بيانات الـ CRUD التشغيلية (vehicles/drivers/teams/managers).
            // الـ queries "التحليلية" (statics/dashboard) بتحدد staleTime أقصر بشكل صريح
            // بمكانها (راجع shared/constants/queryKeys.ts للتوثيق).
            staleTime: 1000 * 60 * 2, // 2 minutes
            // يفعّل تحديث صامت بالخلفية لما المستخدم يرجع لتاب الموقع بعد غيابه —
            // يعطي إحساس "بيانات حية" بدون أي تكلفة إضافية (بيصير بس عند تفاعل فعلي).
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
