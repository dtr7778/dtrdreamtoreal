import { useCallback } from "react";

import { composeRefs, type PossibleRef } from "@workspace/ui/lib/compose-refs";

/**
 * Hook version. Recreates the composed callback only when one of the
 * incoming refs changes identity, so React can detach/reattach correctly:
 * old cleanup (or null-call) runs with the OLD refs closure, then the new
 * callback runs with the new node.
 */
export function useComposedRefs<T>(
  ...refs: PossibleRef<T>[]
): React.RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo -- refs spread IS the dep list
  return useCallback(composeRefs(...refs), refs);
}
