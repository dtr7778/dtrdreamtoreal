import { useCallback, useState } from "react";

import * as local from "@workspace/ui/lib/localStorage";
import * as session from "@workspace/ui/lib/sessionStorage";

export type DispatchAction<T> = T | ((prevState: T) => T);

export type PersistStorageType = "local" | "session";

interface WebStorage {
  getItem<T>(key: string): T | undefined;
  setItem(key: string, value: unknown): void;
  removeItem(key: string): void;
}

const storages: Record<PersistStorageType, WebStorage> = {
  local,
  session,
};

export function usePersistStorage<T>(
  key: string,
  initialData: T,
  type: PersistStorageType = "local"
) {
  const storage = storages[type];

  const [value, setValue] = useState(() => {
    const item = storage.getItem<T>(key);
    return item ?? initialData;
  });

  const handleDispatch = useCallback(
    (action: DispatchAction<T>) => {
      if (typeof action === "function") {
        setValue((prevState) => {
          const newValue = (action as (prevState: T) => T)(prevState);
          storage.setItem(key, newValue);
          return newValue;
        });
      } else {
        setValue(action);
        storage.setItem(key, action);
      }
    },
    [key, storage]
  );

  const handleRemove = useCallback(() => {
    storage.removeItem(key);
    setValue(undefined as T);
  }, [key, storage]);

  return [value, handleDispatch, handleRemove] as const;
}
