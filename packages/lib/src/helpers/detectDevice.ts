export type DevicePlatform = "ios" | "android" | "web" | "unknown";
export type DeviceType = "mobile" | "tablet" | "desktop" | "bot" | "unknown";
export type BrowserName =
  | "chrome"
  | "firefox"
  | "safari"
  | "edge"
  | "opera"
  | "ie"
  | "samsung"
  | "unknown";
export type OSName =
  "windows" | "macos" | "ios" | "android" | "linux" | "chromeos" | "unknown";

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isBot: boolean;
  platform: DevicePlatform;
  deviceType: DeviceType;
  browser: {
    name: BrowserName;
    version: string;
    majorVersion: number;
  };
  os: {
    name: OSName;
    version: string;
    majorVersion: number;
  };
  engine: {
    name: "webkit" | "blink" | "gecko" | "trident" | "unknown";
    version: string;
  };
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
    orientation: "portrait" | "landscape" | "unknown";
  };
  touch: boolean;
  language: string;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: false,
      isBot: false,
      platform: "unknown",
      deviceType: "unknown",
      browser: { name: "unknown", version: "0", majorVersion: 0 },
      os: { name: "unknown", version: "0", majorVersion: 0 },
      engine: { name: "unknown", version: "0" },
      screen: { width: 0, height: 0, pixelRatio: 0, orientation: "unknown" },
      touch: false,
      language: "",
    };
  }

  const userAgent = navigator.userAgent || "";

  // Parse browser
  const browser = parseBrowser(userAgent);

  // Parse OS
  const os = parseOS(userAgent);

  // Parse engine
  const engine = parseEngine(userAgent);

  // Parse device type
  const device = parseDevice(userAgent, os.name);

  // Get screen info
  const screen = getScreenInfo();

  // Check capabilities
  const touch = checkTouchSupport();
  const language = navigator.language || navigator.languages?.[0] || "";

  return {
    isMobile: device.type === "mobile",
    isTablet: device.type === "tablet",
    isDesktop: device.type === "desktop",
    isBot: device.type === "bot",
    platform: device.platform,
    deviceType: device.type,
    browser,
    os,
    engine,
    screen,
    touch,
    language,
  };
}

const browsers = [
  { name: "edge", regex: /Edg\/(\d+)/, versionRegex: /Edg\/([\d.]+)/ },
  {
    name: "chrome",
    regex: /Chrome\/(\d+)/,
    versionRegex: /Chrome\/([\d.]+)/,
    exclude: /Edg|OPR/,
  },
  {
    name: "safari",
    regex: /Version\/(\d+).*Safari/,
    versionRegex: /Version\/([\d.]+)/,
    exclude: /Chrome|Edg|OPR/,
  },
  {
    name: "firefox",
    regex: /Firefox\/(\d+)/,
    versionRegex: /Firefox\/([\d.]+)/,
  },
  { name: "opera", regex: /OPR\/(\d+)/, versionRegex: /OPR\/([\d.]+)/ },
  {
    name: "ie",
    regex: /MSIE (\d+)|Trident.*rv:(\d+)/,
    versionRegex: /MSIE ([\d.]+)|Trident.*rv:([\d.]+)/,
  },
  {
    name: "samsung",
    regex: /SamsungBrowser\/(\d+)/,
    versionRegex: /SamsungBrowser\/([\d.]+)/,
  },
];

// Browser parsers
function parseBrowser(ua: string): DeviceInfo["browser"] {
  for (const browser of browsers) {
    if (browser.exclude && browser.exclude.test(ua)) continue;

    const match = browser.regex.exec(ua);
    if (match) {
      const versionMatch = browser.versionRegex.exec(ua);
      const version = versionMatch
        ? versionMatch[1] || versionMatch[2] || "0"
        : "0";
      const majorVersion = parseInt(version.split(".")[0]!, 10);
      return {
        name: browser.name as DeviceInfo["browser"]["name"],
        version,
        majorVersion: isNaN(majorVersion) ? 0 : majorVersion,
      };
    }
  }

  return { name: "unknown", version: "0", majorVersion: 0 };
}

const osList = [
  {
    name: "windows",
    regex: /Windows NT ([\d.]+)/,
    versionRegex: /Windows NT ([\d.]+)/,
  },
  {
    name: "macos",
    regex: /Mac OS X ([\d_]+)/,
    versionRegex: /Mac OS X ([\d_]+)/,
    transform: (v: string) => v.replace(/_/g, "."),
  },
  {
    name: "ios",
    regex: /iPhone OS ([\d_]+)|iPad; CPU OS ([\d_]+)/,
    versionRegex: /iPhone OS ([\d_]+)|iPad; CPU OS ([\d_]+)/,
    transform: (v: string) => v.replace(/_/g, "."),
  },
  {
    name: "android",
    regex: /Android ([\d.]+)/,
    versionRegex: /Android ([\d.]+)/,
  },
  { name: "linux", regex: /Linux/, versionRegex: null },
  { name: "chromeos", regex: /CrOS/, versionRegex: /CrOS x86_64 ([\d.]+)/ },
];

// OS parsers
function parseOS(ua: string): DeviceInfo["os"] {
  for (const os of osList) {
    const match = os.regex.exec(ua);
    if (match) {
      if (os.versionRegex) {
        const versionMatch = os.versionRegex.exec(ua);
        let version = versionMatch
          ? versionMatch[1] || versionMatch[2] || "0"
          : "0";
        if (os.transform) version = os.transform(version);
        const majorVersion = parseInt(version.split(".")[0]!, 10);
        return {
          name: os.name as DeviceInfo["os"]["name"],
          version,
          majorVersion: isNaN(majorVersion) ? 0 : majorVersion,
        };
      }
      return {
        name: os.name as DeviceInfo["os"]["name"],
        version: "0",
        majorVersion: 0,
      };
    }
  }

  return { name: "unknown", version: "0", majorVersion: 0 };
}

// Engine parser
function parseEngine(ua: string): DeviceInfo["engine"] {
  if (/AppleWebKit\/(\d+)/.test(ua)) {
    const version = /AppleWebKit\/([\d.]+)/.exec(ua)?.[1] || "0";
    return { name: "webkit", version };
  }
  if (/Chrome\//.test(ua)) {
    const version = /Chrome\/([\d.]+)/.exec(ua)?.[1] || "0";
    return { name: "blink", version };
  }
  if (/Gecko\//.test(ua)) {
    const version = /Gecko\/([\d.]+)/.exec(ua)?.[1] || "0";
    return { name: "gecko", version };
  }
  if (/Trident\//.test(ua)) {
    const version = /Trident\/([\d.]+)/.exec(ua)?.[1] || "0";
    return { name: "trident", version };
  }
  return { name: "unknown", version: "0" };
}

// Device parser
function parseDevice(
  ua: string,
  osName: OSName
): { type: DeviceType; platform: DevicePlatform } {
  // Bot detection
  if (
    /bot|crawler|spider|scraper|googlebot|bingbot|yandexbot|slurp|duckduckbot/i.test(
      ua
    )
  ) {
    return { type: "bot", platform: "unknown" };
  }

  // Tablet detection
  if (
    /iPad|PlayBook|Kindle|Silk/i.test(ua) ||
    (/Android/i.test(ua) && !/Mobile/i.test(ua)) ||
    (/Macintosh/i.test(ua) &&
      navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 2)
  ) {
    return {
      type: "tablet",
      platform:
        osName === "ios" ? "ios" : osName === "android" ? "android" : "web",
    };
  }

  // Mobile detection
  if (
    /iPhone|iPod|Android|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/i.test(
      ua
    )
  ) {
    const platform =
      osName === "ios" ? "ios" : osName === "android" ? "android" : "web";
    return { type: "mobile", platform };
  }

  return { type: "desktop", platform: "web" };
}

// Screen information
function getScreenInfo() {
  const screenInfo = {
    width: window.screen.width,
    height: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1,
    orientation: "unknown" as "portrait" | "landscape" | "unknown",
  };

  if (screen.orientation && screen.orientation.type) {
    screenInfo.orientation = screen.orientation.type.includes("portrait")
      ? "portrait"
      : "landscape";
  } else if (window.innerHeight > window.innerWidth) {
    screenInfo.orientation = "portrait";
  } else if (window.innerWidth > window.innerHeight) {
    screenInfo.orientation = "landscape";
  }

  return screenInfo;
}

// Touch feature detection
function checkTouchSupport(): boolean {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
