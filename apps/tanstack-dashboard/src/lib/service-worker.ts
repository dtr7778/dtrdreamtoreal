/**
 * Check if service worker is supported
 * @returns {boolean} True if service worker is supported, false otherwise
 */
export function isServiceWorkerSupported(): boolean {
  return "serviceWorker" in navigator;
}

/**
 * Register a service worker
 * @param scriptURL The URL of the service worker script
 * @param options The registration options
 * @returns {Promise<ServiceWorkerRegistration>} The service worker registration
 */
export async function registerServiceWorker(
  scriptURL: string | URL,
  options?: RegistrationOptions | undefined
): Promise<ServiceWorkerRegistration> {
  if (!isServiceWorkerSupported()) {
    throw new Error("Service Worker is not supported in this browser");
  }

  return await navigator.serviceWorker.register(scriptURL, options);
}

/**
 * Get the ready service worker registration
 * @returns {Promise<ServiceWorkerRegistration>} The service worker registration
 */
export async function getReadyServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!isServiceWorkerSupported()) {
    throw new Error("Service Worker is not supported in this browser");
  }

  return await navigator.serviceWorker.ready;
}

/**
 * Get the registered service worker
 * @param scriptURL The URL of the service worker script
 * @returns {Promise<ServiceWorkerRegistration | undefined>} The service worker registration if it exists
 */
export async function getRegisteredServiceWorker(
  scriptURL: string | URL = "/"
): Promise<ServiceWorkerRegistration | undefined> {
  if (!isServiceWorkerSupported()) {
    throw new Error("Service Worker is not supported in this browser");
  }

  return await navigator.serviceWorker.getRegistration(scriptURL);
}

/**
 * Unregister a service worker
 * @param scriptURL The URL of the service worker script
 * @returns {Promise<boolean>} True if the service worker was unregistered, false otherwise
 */
export async function unregisterServiceWorker(
  scriptURL: string | URL
): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    throw new Error("Service Worker is not supported in this browser");
  }

  const registration = await getRegisteredServiceWorker(scriptURL);
  if (registration) {
    return await registration.unregister();
  }
  return false;
}
