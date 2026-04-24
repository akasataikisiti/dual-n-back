const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
type AnalyticsParamValue = string | number | boolean | undefined;

type AnalyticsParams = Record<string, AnalyticsParamValue>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function loadGoogleAnalyticsScript(measurementId: string): void {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

export function initializeAnalytics(): void {
  if (!import.meta.env.PROD || !GA_MEASUREMENT_ID) {
    return;
  }

  if (window.gtag) {
    return;
  }

  loadGoogleAnalyticsScript(GA_MEASUREMENT_ID);

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    page_path: window.location.pathname + window.location.search,
  });
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}): void {
  if (!import.meta.env.PROD || !window.gtag) {
    return;
  }

  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );
  window.gtag('event', eventName, filteredParams);
}
