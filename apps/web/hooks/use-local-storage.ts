"use client";

import { useEffect, useState } from "react";

import { getItem, setItem } from "@/utils/localStorage";

export default function useLocalStorage<T>(key: string, initialData: T) {
  const [value, setValue] = useState(() => {
    const item = getItem(key);
    return (item as T) || initialData;
  });

  useEffect(() => {
    setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
