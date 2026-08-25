"use client";

import { useState } from "react";

import { X } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { RefreshButton } from "@workspace/ui/components/refresh-button";

interface DataTableGlobalSearchProps {
  searchValue?: string | null | undefined;
  setSearchValue: (value: string | null) => void;
  refresh: () => void;
  children?: React.ReactNode;
}

export function DataTableGlobalSearch({
  searchValue,
  setSearchValue,
  refresh,
  children,
}: DataTableGlobalSearchProps) {
  const [inputValue, setInputValue] = useState<string>(searchValue ?? "");

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setInputValue(value);
  };

  const handleReset = () => {
    setSearchValue(null);
    setInputValue("");
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2">
        <Input
          name="search"
          placeholder="Search...."
          className="w-37.5 lg:w-62.5"
          value={inputValue}
          onChange={handleOnChange}
        />
        {!!inputValue && (
          <Button variant="ghost" onClick={handleReset}>
            <span>Reset</span>
            <X />
          </Button>
        )}
      </div>
      {children}
      <RefreshButton isLoading={false} onButtonClick={refresh} />
    </div>
  );
}
