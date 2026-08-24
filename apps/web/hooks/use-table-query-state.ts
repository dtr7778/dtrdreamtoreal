"use client";

import {
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
  UseQueryStatesKeysMap,
} from "nuqs";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";

export function useTableQueryState<KeyMap extends UseQueryStatesKeysMap>({
  additionalKeys,
}: {
  additionalKeys?: KeyMap;
}) {
  const baseKeys = {
    page: parseAsIndex.withDefault(DEFAULT_PAGE_INDEX).withOptions({
      clearOnDefault: true,
    }),
    limit: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE).withOptions({
      clearOnDefault: true,
    }),
    search: parseAsString.withOptions({
      clearOnDefault: true,
    }),
    order: parseAsStringEnum(["asc", "desc"]).withOptions({
      clearOnDefault: true,
    }),
    orderField: parseAsString.withOptions({
      clearOnDefault: true,
    }),
  };

  const [filters, setFilters] = useQueryStates(
    {
      ...baseKeys,
      ...(additionalKeys ?? {}),
    } as unknown as typeof baseKeys & KeyMap,
    {
      history: "push",
    }
  );

  return {
    filters,
    setFilters: (
      updates: Partial<
        Omit<
          {
            [K in keyof typeof filters]: (typeof filters)[K] | null;
          },
          "search"
        >
      >
    ) => setFilters(updates as Parameters<typeof setFilters>[0]),
    setSearchFilter: (searchValue: string | null) =>
      setFilters({
        search: searchValue,
        page: DEFAULT_PAGE_INDEX,
      } as Parameters<typeof setFilters>[0]),
  };
}
