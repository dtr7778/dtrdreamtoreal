"use client";

import { useCallback, useEffect, useState } from "react";

type VisibilityState = "visible" | "hidden" | "prerender" | "unloaded";

interface UsePageVisibility {
  isVisible: boolean;
  visibilityState: VisibilityState;
}

function getVisibilityProps(): {
  hidden: boolean;
  visibilityState: VisibilityState;
} {
  if (typeof document === "undefined") {
    return { hidden: false, visibilityState: "visible" as VisibilityState };
  }

  // Standard properties
  if (document.hidden !== undefined) {
    return {
      hidden: document.hidden,
      visibilityState: document.visibilityState as VisibilityState,
    };
  }

  // Webkit prefix
  if (
    (document as unknown as Document & { webkitHidden?: boolean })
      ?.webkitHidden !== undefined
  ) {
    return {
      hidden: (document as unknown as Document & { webkitHidden: boolean })
        .webkitHidden,
      visibilityState: (
        document as unknown as Document & {
          webkitVisibilityState: VisibilityState;
        }
      ).webkitVisibilityState,
    };
  }

  // Mozilla prefix (older versions)
  if (
    (document as unknown as Document & { mozHidden?: boolean })?.mozHidden !==
    undefined
  ) {
    return {
      hidden: (document as unknown as Document & { mozHidden: boolean })
        .mozHidden,
      visibilityState: (
        document as unknown as Document & {
          mozVisibilityState: VisibilityState;
        }
      ).mozVisibilityState,
    };
  }

  // MS prefix
  if (
    (document as unknown as Document & { msHidden?: boolean })?.msHidden !==
    undefined
  ) {
    return {
      hidden: (document as unknown as Document & { msHidden: boolean })
        .msHidden,
      visibilityState: (
        document as unknown as Document & {
          msVisibilityState: VisibilityState;
        }
      ).msVisibilityState,
    };
  }

  // Fallback for very old browsers - assume page is always visible
  return {
    hidden: false,
    visibilityState: "visible" as VisibilityState,
  };
}

// Get vendor-prefixed visibility change event name
function getVisibilityChangeEvent(): string {
  if (typeof document === "undefined") return "visibilitychange";

  if (
    (
      document as unknown as Document & {
        visibilityChange?: VisibilityState;
      }
    )?.visibilityChange !== undefined
  ) {
    return "visibilitychange";
  }
  if (
    (
      document as unknown as Document & {
        webkitVisibilityChange?: VisibilityState;
      }
    )?.webkitVisibilityChange !== undefined
  ) {
    return "webkitvisibilitychange";
  }
  if (
    (
      document as unknown as Document & {
        mozVisibilityChange?: VisibilityState;
      }
    )?.mozVisibilityChange !== undefined
  ) {
    return "mozvisibilitychange";
  }
  if (
    (
      document as unknown as Document & {
        msVisibilityChange?: VisibilityState;
      }
    )?.msVisibilityChange !== undefined
  ) {
    return "msvisibilitychange";
  }

  return "visibilitychange"; // Default
}

// Check if browser supports Page Visibility API
const isVisibilityAPISupported = (): boolean => {
  if (typeof document === "undefined") return false;

  return !!(
    (
      document as unknown as Document & {
        hidden?: boolean;
      }
    )?.hidden !== undefined ||
    (
      document as unknown as Document & {
        webkitHidden?: boolean;
      }
    )?.webkitHidden !== undefined ||
    (
      document as unknown as Document & {
        mozHidden?: boolean;
      }
    )?.mozHidden !== undefined ||
    (
      document as unknown as Document & {
        msHidden?: boolean;
      }
    )?.msHidden !== undefined
  );
};

export function usePageVisibility(): UsePageVisibility {
  const [state, setState] = useState<UsePageVisibility>(() => {
    const { hidden, visibilityState } = getVisibilityProps();
    return {
      isVisible: !hidden,
      visibilityState,
    };
  });

  const handleVisibilityChange = useCallback(() => {
    const { hidden, visibilityState: newState } = getVisibilityProps();

    setState((prev) => ({
      ...prev,
      isVisible: !hidden,
      visibilityState: newState,
    }));
  }, []);

  useEffect(() => {
    // SSR check - no window/document available
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    // Check if API is supported
    if (!isVisibilityAPISupported()) {
      console.warn(
        "Page Visibility API is not supported in this browser. Falling back to always visible."
      );
      return;
    }

    const eventName = getVisibilityChangeEvent();

    // Use capture phase to ensure we catch all events
    document.addEventListener(eventName, handleVisibilityChange, false);

    // Also listen to pagehide and pageshow for additional reliability
    const handlePageHide = () => {
      setState((prev) => ({
        ...prev,
        isVisible: false,
        visibilityState: "hidden",
        hiddenTime: Date.now(),
      }));
    };

    const handlePageShow = () => {
      setState((prev) => ({
        ...prev,
        isVisible: true,
        visibilityState: "visible",
        visibleTime: Date.now(),
      }));
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    // Initial check (in case tab was already hidden when component mounted)
    queueMicrotask(() => {
      handleVisibilityChange();
    });

    return () => {
      document.removeEventListener(eventName, handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [handleVisibilityChange]);

  return state;
}
