"use client";

import { useCallback, useState } from "react";

import { getItem, removeItem, setItem } from "@/utils/sessionStorage";

export type DispatchAction<T> = T | ((prevState: T) => T);

export default function useSessionStorage<T>(key: string, initialData: T) {
  const [value, setValue] = useState(() => {
    const item = getItem<T>(key);
    return item || initialData;
  });

  const handleDispatch = useCallback(
    (action: DispatchAction<T>) => {
      if (typeof action === "function") {
        setValue((prevState) => {
          const newValue = (action as (prevState: T) => T)(prevState);
          setItem(key, newValue);
          return newValue;
        });
      } else {
        setValue(action);
        setItem(key, action);
      }
    },
    [key]
  );

  const handleRemove = useCallback(() => {
    removeItem(key);
    setValue(undefined as T);
  }, [key]);

  return [value, handleDispatch, handleRemove] as const;
}
