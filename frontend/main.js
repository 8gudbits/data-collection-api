// Default API URLs - can be modified after script loads
window.API_URLS = ["http://127.0.0.1:5000/metrics", "http://localhost:5000/metrics"];

const CONFIG = {
  timeout: 3000,
  enableLocation: true,
  enableHardware: true,
  enablePerformance: true,
};

async function collectDeviceInfo() {
  const info = {
    ip: await getIP(),
    connection: getConnectionInfo(),
    browser: getBrowserInfo(),
    device: getDeviceInfo(),
    hardware: CONFIG.enableHardware ? await getHardwareInfo() : {},
    location: {},
    performance: CONFIG.enablePerformance ? getPerformanceInfo() : {},
    timestamp: new Date().toISOString(),
    url: window.location.href,
    referrer: document.referrer,
  };

  if (CONFIG.enableLocation && info.ip && info.ip !== "Unknown") {
    try {
      info.location = await getLocationFromIP(info.ip);
    } catch (e) {}
  }

  return info;
}

async function getIP() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    try {
      const response = await fetch("https://api64.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (e) {
      return "Unknown";
    }
  }
}

function getConnectionInfo() {
  const connection = navigator.connection || {};
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
    type: connection.type,
  };
}

function getBrowserInfo() {
  const ua = navigator.userAgent;
  return {
    userAgent: ua,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    vendor: navigator.vendor,
    cookieEnabled: navigator.cookieEnabled,
    javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
    pdfViewerEnabled: navigator.pdfViewerEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
    webdriver: navigator.webdriver,
  };
}

function getDeviceInfo() {
  const ua = navigator.userAgent;

  const screenInfo = {
    width: screen.width,
    height: screen.height,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
  };

  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const isMobile =
    /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android|Tablet/i.test(ua) && !/Mobile/i.test(ua);
  const isDesktop = !isMobile && !isTablet;

  return {
    screen: screenInfo,
    viewport,
    type: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
    touchSupport: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    orientation: screen.orientation ? screen.orientation.type : "unknown",
  };
}

function getCPUInfo() {
  const cpuInfo = {
    cores: navigator.hardwareConcurrency,
    architecture: "unknown",
    model: "unknown",
    features: {},
  };

  const platform = navigator.platform.toLowerCase();
  const ua = navigator.userAgent.toLowerCase();

  if (platform.includes("win")) {
    cpuInfo.architecture = "Windows";
  } else if (platform.includes("mac")) {
    cpuInfo.architecture = "macOS";
    if (ua.includes("arm") || ua.includes("apple")) {
      cpuInfo.architecture = "macOS (Apple Silicon)";
      cpuInfo.model = "Apple M-series";
    } else {
      cpuInfo.architecture = "macOS (Intel)";
      cpuInfo.model = "Intel";
    }
  } else if (platform.includes("linux")) {
    cpuInfo.architecture = "Linux";
  } else if (platform.includes("android")) {
    cpuInfo.architecture = "Android";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    cpuInfo.architecture = "iOS";
    cpuInfo.model = "Apple A-series";
  }

  if (
    navigator.userAgent.includes("WOW64") ||
    navigator.userAgent.includes("Win64")
  ) {
    cpuInfo.architecture += " (64-bit)";
  } else if (navigator.userAgent.includes("Windows NT")) {
    cpuInfo.architecture += " (32-bit)";
  }

  try {
    cpuInfo.features.simd =
      typeof WebAssembly !== "undefined" && WebAssembly.Simd !== undefined;
    cpuInfo.features.multithreading = navigator.hardwareConcurrency > 1;

    const start = performance.now();
    const testArray = new Float64Array(1000);
    for (let i = 0; i < testArray.length; i++) {
      testArray[i] = Math.sqrt(i) * Math.random();
    }
    const end = performance.now();
    cpuInfo.features.performanceTest = (end - start).toFixed(2) + "ms";
  } catch (e) {
    cpuInfo.features.error = "Feature detection failed";
  }

  if (cpuInfo.cores <= 2) {
    cpuInfo.model = "Low-end CPU (2 cores or less)";
  } else if (cpuInfo.cores <= 4) {
    cpuInfo.model = "Mid-range CPU (3-4 cores)";
  } else if (cpuInfo.cores <= 8) {
    cpuInfo.model = "High-end CPU (5-8 cores)";
  } else {
    cpuInfo.model = "Workstation CPU (8+ cores)";
  }

  return cpuInfo;
}

async function getHardwareInfo() {
  const hardware = {
    cpu: getCPUInfo(),
    deviceMemory: navigator.deviceMemory || "unknown",
    storage: await getStorageInfo(),
  };

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        hardware.gpu = {
          vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
          renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
        };

        const renderer = hardware.gpu.renderer.toLowerCase();
        if (renderer.includes("nvidia") || renderer.includes("geforce")) {
          hardware.gpu.brand = "NVIDIA";
        } else if (renderer.includes("amd") || renderer.includes("radeon")) {
          hardware.gpu.brand = "AMD";
        } else if (renderer.includes("intel")) {
          hardware.gpu.brand = "Intel";
        } else if (renderer.includes("apple") || renderer.includes("metal")) {
          hardware.gpu.brand = "Apple";
        } else if (renderer.includes("adreno")) {
          hardware.gpu.brand = "Qualcomm Adreno";
        } else if (renderer.includes("mali")) {
          hardware.gpu.brand = "ARM Mali";
        } else if (renderer.includes("powervr")) {
          hardware.gpu.brand = "PowerVR";
        }
      } else {
        hardware.gpu = { error: "WEBGL_debug_renderer_info not available" };
      }
    } else {
      hardware.gpu = { error: "WebGL not supported" };
    }
  } catch (e) {
    hardware.gpu = { error: "Unable to detect GPU" };
  }

  return hardware;
}

async function getStorageInfo() {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        usagePercentage: estimate.quota
          ? ((estimate.usage / estimate.quota) * 100).toFixed(2) + "%"
          : "unknown",
      };
    } catch (e) {
      return { error: "Storage estimation failed" };
    }
  }
  return { error: "Storage API not supported" };
}

function getPerformanceInfo() {
  if (!window.performance) return { error: "Performance API not available" };

  const perf = performance.timing;

  return {
    timing: {
      loadTime: perf.loadEventEnd - perf.navigationStart,
      domReady: perf.domContentLoadedEventEnd - perf.navigationStart,
      redirectCount: performance.navigation.redirectCount,
      type: performance.navigation.type,
    },
    memory: performance.memory
      ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
        }
      : "Memory API not available",
  };
}

async function getLocationFromIP(ip) {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return {
      ip: ip,
      country: data.country_name,
      countryCode: data.country_code,
      region: data.region,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      org: data.org,
      postal: data.postal,
    };
  } catch (error) {
    return { error: "Location lookup failed" };
  }
}

async function sendDataToAPI(data) {
  const apiUrls = window.API_URLS;

  for (const endpoint of apiUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        mode: "cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return { success: true, endpoint: endpoint };
    } catch (error) {
      try {
        const dataStr = btoa(JSON.stringify(data));
        new Image().src =
          endpoint +
          "?data=" +
          encodeURIComponent(dataStr) +
          "&fallback=true&source=mainjs";
        return { success: true, endpoint: endpoint, method: "fallback" };
      } catch (fallbackError) {
        console.warn(`Failed to send to ${endpoint}:`, fallbackError);
      }
    }
  }
  throw new Error("All API endpoints failed");
}

async function dropClientInfo() {
  try {
    const deviceInfo = await collectDeviceInfo();
    const result = await sendDataToAPI(deviceInfo);
    return { success: true, data: deviceInfo, sendResult: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

window.dropClientInfo = dropClientInfo;
window.collectDeviceInfo = collectDeviceInfo;

window.setApiUrls = function (urls) {
  if (Array.isArray(urls)) {
    window.API_URLS = urls;
  } else if (typeof urls === "string") {
    window.API_URLS = [urls];
  }
};

window.addApiUrl = function (url) {
  if (!window.API_URLS.includes(url)) {
    window.API_URLS.push(url);
  }
};

window.getApiUrls = function () {
  return [...window.API_URLS];
};

