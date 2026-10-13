import { useCallback } from "react";

import { useControllableState } from "@workspace/ui/hooks/use-controllable-state";
import {
  type PersistStorageType,
  usePersistStorage,
} from "@workspace/ui/hooks/use-persist-storage";

interface UseControllablePersistStorageParams<T> {
  key: string;
  defaultValue: T;
  type?: PersistStorageType;
  value?: T;
  onChange?: (value: T) => void;
}

export function useControllablePersistStorage<T>({
  key,
  defaultValue,
  type = "local",
  value: valueProp,
  onChange,
}: UseControllablePersistStorageParams<T>) {
  const [storedValue, setStoredValue, removeValue] = usePersistStorage(
    key,
    defaultValue,
    type
  );

  const handleChange = useCallback(
    (nextValue: T) => {
      onChange?.(nextValue);
      setStoredValue(nextValue);
    },
    [onChange, setStoredValue]
  );

  const [value, setValue] = useControllableState<T>({
    prop: valueProp,
    defaultProp: storedValue,
    onChange: handleChange,
  });

  return [value ?? defaultValue, setValue, removeValue] as const;
}
