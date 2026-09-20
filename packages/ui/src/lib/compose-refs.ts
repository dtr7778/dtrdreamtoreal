import * as React from "react";

type RefCleanup = () => void;
export type PossibleRef<T> = React.Ref<T> | undefined;

/**
 * Set a given ref to a given value.
 * Returns the cleanup function if the ref callback produced one (React 19),
 * otherwise undefined.
 */
function setRef<T>(ref: PossibleRef<T>, value: T): RefCleanup | void {
  if (typeof ref === "function") {
    // In React 19 a ref callback may return a cleanup — propagate it upward
    // so composeRefs can aggregate it. In React <=18 this is always undefined.
    return ref(value);
  }

  if (ref !== null && ref !== undefined) {
    (ref as React.RefObject<T | null>).current = value;
  }
}

/**
 * Compose multiple refs into a single callback ref with correct
 * React 19 cleanup semantics.
 */
function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => {
    const cleanups: Array<RefCleanup | void> = [];
    let hasCleanup = false;

    for (const ref of refs) {
      const cleanup = setRef(ref, node);
      cleanups.push(cleanup);
      if (typeof cleanup === "function") hasCleanup = true;
    }

    // If NO ref returned a cleanup, return undefined. This matters twice:
    //  - React <=18 logs "unexpected return value" if a callback ref returns
    //    anything (even a function), so we must not return a combined cleanup.
    //  - It lets React's default behavior (calling the ref with null) happen.
    if (!hasCleanup) return;

    // If ANY ref returned a cleanup, React 19 will call ONLY this cleanup on
    // detach — it will NOT also call ref(null). So we are responsible for:
    //  - running each real cleanup, and
    //  - manually passing null to refs that had none (object refs, and
    //    function refs that returned undefined).
    return () => {
      for (let i = 0; i < refs.length; i++) {
        const cleanup = cleanups[i];
        if (typeof cleanup === "function") {
          cleanup();
        } else {
          setRef(refs[i], null);
        }
      }
    };
  };
}

export { composeRefs };
