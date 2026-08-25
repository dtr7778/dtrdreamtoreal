export default function OfflineFallbackPage() {
  return (
    <main className="px-6 py-12 text-center">
      <h1>You&apos;re offline</h1>
      <p>
        This page hasn&apos;t been cached yet, so it can&apos;t be shown without
        a connection. Anything you&apos;ve already visited will still work.
      </p>
    </main>
  );
}
