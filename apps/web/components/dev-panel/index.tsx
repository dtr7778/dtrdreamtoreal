"use client";

import { NODE_ENV_TYPE } from "@workspace/lib/types";
import { cn } from "@workspace/ui/lib/utils";

import { DEFAULT_AUTH_PATH } from "@/constants";

import { DevPanelBody } from "./DevPanelBody";
import {
  DevPanelContextProvider,
  EnvVarType,
  useDevPanelContext,
} from "./DevPanelContext";

export function DevPanel({
  currentEnv,
  envVars,
}: {
  envVars: Array<EnvVarType>;
  currentEnv: NODE_ENV_TYPE;
}) {
  if (typeof window === "undefined") return null;
  if (currentEnv === "production") return null;
  return (
    <DevPanelContextProvider
      redirectUrl={DEFAULT_AUTH_PATH}
      currentEnv={currentEnv}
      envVars={envVars}
    >
      <DevPanelOpener />

      <DevPanelBody />
    </DevPanelContextProvider>
  );
}

function DevPanelOpener() {
  const { isOpen, openOrClosePanel } = useDevPanelContext();
  return (
    <button
      type="button"
      onClick={openOrClosePanel}
      className={cn(
        "fixed font-mono top-1/2 z-1000 -translate-y-1/2 flex flex-col justify-center items-center gap-1 bg-neutral-950 border border-r-0 p-2 text-xs font-bold tracking-widest text-neutral-400 transition-all duration-300 ease-in-out hover:bg-neutral-900 hover:text-neutral-200",
        isOpen ? "right-100" : "right-0"
      )}
      style={{ writingMode: "vertical-rl" }}
      aria-label="Toggle Dev Panel"
    >
      <span className="size-1.5 rounded-full bg-emerald-400 shadow-md shrink-0" />
      <span>DEV</span>
    </button>
  );
}
