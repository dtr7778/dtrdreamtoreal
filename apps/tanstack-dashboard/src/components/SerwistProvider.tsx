import { useEffect } from "react";

export function SerwistProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    (async () => {
      if ("serviceWorker" in navigator) {
        const { getSerwist } = await import("virtual:serwist");
        const serwist = await getSerwist();

        serwist?.addEventListener("installed", () => {
          console.log("Serwist installed!");
        });

        void serwist?.register();
      }
    })();
  }, []);

  return children;
}
