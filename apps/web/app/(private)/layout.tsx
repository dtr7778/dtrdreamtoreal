import { AuthStoreProvider } from "@/stores/zustand/auth/AuthStoreContext";

export default function PrivateLayout({ children }: LayoutProps<"/">) {
  return <AuthStoreProvider>{children}</AuthStoreProvider>;
}
