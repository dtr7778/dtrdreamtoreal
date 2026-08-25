"use client";

import { useCallback, useState } from "react";

interface UseControllableStateParams<T> {
  prop?: T;
  defaultProp?: T;
  onChange?: (value: T) => void;
}

export function useControllableState<T>({
  prop,
  defaultProp,
  onChange = () => {},
}: UseControllableStateParams<T>) {
  const [uncontrolledProp, setUncontrolledProp] = useState(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledProp;

  const setValue = useCallback(
    (nextValue: T | ((prev: T) => T)) => {
      if (isControlled) {
        const newValue =
          nextValue instanceof Function ? nextValue(value as T) : nextValue;
        if (newValue !== value) {
          onChange(newValue);
        }
      } else {
        setUncontrolledProp((prevState) => {
          const newValue =
            nextValue instanceof Function
              ? nextValue(prevState as T)
              : nextValue;
          onChange(newValue);
          return newValue;
        });
      }
    },
    [isControlled, value, onChange]
  );

  return [value, setValue] as const;
}
