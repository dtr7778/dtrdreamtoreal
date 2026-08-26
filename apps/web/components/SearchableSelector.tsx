import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { ChevronDownIcon } from "lucide-react";

import { Button, ButtonProps } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { useControllableState } from "@workspace/ui/hooks/use-controllable-state";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { cn } from "@workspace/ui/lib/utils";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

interface SearchableSelectorContextProps {
  isMobile: boolean;
  open: boolean | undefined;
  setOpen: (nextValue: boolean | ((prev: boolean) => boolean)) => void;
  handleSelect: (itemId: string) => void;
  searchValue: string;
  handleSearchChange: (searchValue: string) => void;
  value: string | undefined;
  disabled?: boolean;
}

const SearchableSelectorContext =
  createContext<SearchableSelectorContextProps | null>(null);

function useSearchableSelectorContext() {
  const context = useContext(SearchableSelectorContext);
  if (!context) {
    throw new Error(
      "SearchableSelector components must be used within a SearchableSelector"
    );
  }
  return context;
}

interface SearchableSelectorProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  onSearch: (searchValue: string) => void;
  searchDebounceMs?: number;
  disabled?: boolean;
}

export function SearchableSelector({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
  value,
  onChange,
  onSearch,
  searchDebounceMs = 500,
  disabled = false,
}: SearchableSelectorProps) {
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState("");

  const [open, setOpen] = useControllableState<boolean>({
    prop: controlledOpen,
    defaultProp: false,
    onChange: controlledOnOpenChange,
  });

  const handleSetOpen = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) => {
      if (disabled) return;
      setOpen(val);
    },
    [setOpen, disabled]
  );

  const debouncedSearch = useDebouncedCallback(
    (searchValue: string) => onSearch(searchValue),
    searchDebounceMs
  );

  const handleSelect = useCallback(
    (itemId: string) => {
      onChange(itemId === value ? undefined : itemId);
      handleSetOpen(false);
    },
    [value, onChange, handleSetOpen]
  );

  const handleSearchChange = useCallback(
    (searchValue: string) => {
      setSearchValue(searchValue);
      debouncedSearch(searchValue);
    },
    [debouncedSearch, setSearchValue]
  );

  const contextValue = useMemo<SearchableSelectorContextProps>(
    () => ({
      isMobile,
      open,
      setOpen: handleSetOpen,
      handleSelect,
      searchValue,
      handleSearchChange,
      value,
      disabled,
    }),
    [
      isMobile,
      open,
      handleSetOpen,
      handleSelect,
      searchValue,
      handleSearchChange,
      value,
      disabled,
    ]
  );

  const WrapperComp = isMobile ? Drawer : Popover;

  return (
    <SearchableSelectorContext.Provider value={contextValue}>
      <WrapperComp open={open} onOpenChange={handleSetOpen}>
        {children}
      </WrapperComp>
    </SearchableSelectorContext.Provider>
  );
}

type SearchableSelectorTriggerProps = ButtonProps;

export function SearchableSelectorTrigger({
  className,
  type = "button",
  variant = "outline",
  children,
  ...props
}: SearchableSelectorTriggerProps) {
  const { open, isMobile, disabled } = useSearchableSelectorContext();

  const trigger = (
    <Button
      variant={variant}
      type={type}
      className={cn(
        "justify-start w-full group/searchable-selector-trigger border-input",
        className
      )}
      aria-expanded={open}
      data-open={open ? "true" : undefined}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none ml-auto size-4 text-muted-foreground transition-transform group-data-open/searchable-selector-trigger:rotate-180" />
    </Button>
  );

  if (isMobile) {
    return <DrawerTrigger render={trigger} />;
  }

  return <PopoverTrigger render={trigger} />;
}

interface SearchableSelectorContentProps<T> {
  title: string;
  description: string;
  className?: string;
  loadingFallback: React.ReactNode;
  emptyFallback: React.ReactNode;
  children: (item: T) => React.ReactNode;
  data: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function SearchableSelectorContent<T>({
  children,
  title,
  description,
  className,
  loadingFallback,
  emptyFallback,
  data,
  isLoading,
  isError,
  error,
}: SearchableSelectorContentProps<T>) {
  const { isMobile, handleSearchChange, searchValue } =
    useSearchableSelectorContext();

  const commandContent = (
    <Command shouldFilter={false} className={className}>
      <CommandInput
        placeholder="Search..."
        value={searchValue}
        onValueChange={handleSearchChange}
        inputMode="search"
        autoCapitalize="none"
      />
      <QueryStateBoundary
        data={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={(d) => d.length === 0}
        loadingFallback={loadingFallback}
        emptyFallback={emptyFallback}
      >
        {(items) => (
          <CommandList className="max-h-75 overflow-y-auto">
            <CommandGroup>
              {items.map((item, idx) => (
                <Fragment key={idx}>{children(item)}</Fragment>
              ))}
            </CommandGroup>
          </CommandList>
        )}
      </QueryStateBoundary>
    </Command>
  );

  if (isMobile) {
    return (
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="border-t flex flex-col gap-2">{commandContent}</div>
      </DrawerContent>
    );
  }

  return (
    <PopoverContent className="w-72 p-0" align="start">
      {commandContent}
    </PopoverContent>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

interface SearchableSelectorLoadingSkeletonProps {
  count?: number;
  children: React.ReactNode;
}

export function SearchableSelectorLoadingSkeleton({
  count = 3,
  children,
}: SearchableSelectorLoadingSkeletonProps) {
  return (
    <div className="p-2 space-y-2">
      {Array.from({ length: count }).map((_, idx) => (
        <Fragment key={idx}>{children}</Fragment>
      ))}
    </div>
  );
}

// ─── Empty ───────────────────────────────────────────────────────────────────

interface SearchableSelectorEmptyProps {
  icon: React.ReactNode;
  message: string;
}

export function SearchableSelectorEmpty({
  icon,
  message,
}: SearchableSelectorEmptyProps) {
  return (
    <CommandEmpty className="py-10 flex flex-col items-center justify-center text-muted-foreground gap-2">
      {icon}
      <span>{message}</span>
    </CommandEmpty>
  );
}

// ─── Item ────────────────────────────────────────────────────────────────────

interface SearchableSelectorItemProps<T> extends React.ComponentProps<
  typeof CommandItem
> {
  item: T;
  getItemId: (item: T) => string;
}

export function SearchableSelectorItem<T>({
  children,
  item,
  getItemId,
  ...props
}: SearchableSelectorItemProps<T>) {
  const { handleSelect, value } = useSearchableSelectorContext();
  const itemId = getItemId(item);

  return (
    <CommandItem
      onSelect={() => handleSelect(itemId)}
      data-checked={itemId === value}
      {...props}
    >
      {children}
    </CommandItem>
  );
}
