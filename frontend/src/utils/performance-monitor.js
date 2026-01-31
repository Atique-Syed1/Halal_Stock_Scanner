/**
 * Performance Monitoring Utility
 * Tracks Web Vitals and custom metrics
 */

// Web Vitals thresholds
const THRESHOLDS = {
  LCP: 2500,  // Largest Contentful Paint
  FID: 100,   // First Input Delay
  CLS: 0.1,   // Cumulative Layout Shift
  FCP: 1800,  // First Contentful Paint
  TTFB: 600,  // Time to First Byte
};

const IS_DEV = import.meta.env.DEV;

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.initialized = false;
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    
    this.initialized = true;
    
    // Monitor Web Vitals
    if ('PerformanceObserver' in window) {
      this.observeLCP();
      this.observeFID();
      this.observeCLS();
    }
    
    // Monitor page load
    this.observePageLoad();
    
    // Monitor navigation timing
    this.observeNavigationTiming();
  }

  observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.metrics.LCP = lastEntry.renderTime || lastEntry.loadTime;
        this.logMetric('LCP', this.metrics.LCP, THRESHOLDS.LCP);
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      // Silent fail in production
      if (IS_DEV) console.warn('LCP observation failed:', error);
    }
  }

  observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.FID = entry.processingStart - entry.startTime;
          this.logMetric('FID', this.metrics.FID, THRESHOLDS.FID);
        });
      });
      
      observer.observe({ type: 'first-input', buffered: true });
    } catch (error) {
      // Silent fail in production
      if (IS_DEV) console.warn('FID observation failed:', error);
    }
  }

  observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.CLS = clsValue;
          }
        });
        
        this.logMetric('CLS', this.metrics.CLS, THRESHOLDS.CLS);
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      // Silent fail in production
      if (IS_DEV) console.warn('CLS observation failed:', error);
    }
  }

  observePageLoad() {
    if (document.readyState === 'complete') {
      this.recordPageLoad();
    } else {
      window.addEventListener('load', () => this.recordPageLoad());
    }
  }

  recordPageLoad() {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    if (navigation) {
      this.metrics.TTFB = navigation.responseStart - navigation.requestStart;
      this.metrics.domLoad = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      this.metrics.windowLoad = navigation.loadEventEnd - navigation.fetchStart;
      
      this.logMetric('TTFB', this.metrics.TTFB, THRESHOLDS.TTFB);
    }
  }

  observeNavigationTiming() {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    if (navigation) {
      const timing = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      };
      
      this.metrics.timing = timing;
    }
  }

  logMetric(name, value, threshold) {
    // Only log in development mode
    if (IS_DEV) {
      const status = value <= threshold ? '✅' : '⚠️';
      const unit = name === 'CLS' ? '' : 'ms';
      console.log(`${status} ${name}: ${value.toFixed(name === 'CLS' ? 3 : 0)}${unit} (threshold: ${threshold}${unit})`);
    }
  }

  // Track custom events
  trackEvent(name, data = {}) {
    const timestamp = performance.now();
    if (IS_DEV) {
      console.log(`📌 Event: ${name}`, { timestamp: timestamp.toFixed(0), ...data });
    }
  }

  // Track API calls
  trackAPI(endpoint, duration, success = true) {
    if (IS_DEV) {
      const status = success ? '✅' : '❌';
      console.log(`${status} API: ${endpoint} - ${duration.toFixed(0)}ms`);
    }
  }

  // Get all metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Report metrics (can be sent to analytics service)
  report() {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: this.getMetrics(),
      connection: this.getConnectionInfo(),
    };
    
    // Send to analytics service in production
    // if (!IS_DEV) this.sendToAnalytics(report);
    
    return report;
  }

  getConnectionInfo() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData,
      };
    }
    return null;
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-initialize
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceMonitor.init();
    });
  } else {
    performanceMonitor.init();
  }
  
  // Report on page visibility change (when user switches tabs)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      performanceMonitor.report();
    }
  });
}

export default performanceMonitor;
