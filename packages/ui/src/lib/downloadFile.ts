/**
 * Triggers a file download in the browser.
 * This function should only be called on the client side.
 */
export function downloadFile(
  content: string | Blob,
  filename: string,
  mimeType: string
) {
  if (typeof window === "undefined") return;

  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
