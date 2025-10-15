// discovery-assistant/src/hooks/useMobileDetection.ts

import { useState, useEffect } from 'react';

/**
 * Hook לזיהוי מובייל אוטומטי
 * בודק user agent וviewport size
 */
export function useMobileDetection(): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
} {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    deviceType: 'desktop' as 'mobile' | 'tablet' | 'desktop'
  });

  useEffect(() => {
    const detectDevice = () => {
      // בדיקת user agent
      const userAgent = navigator.userAgent.toLowerCase();
      
      // בדיקת viewport width
      const viewportWidth = window.innerWidth;
      
      // זיהוי מובייל לפי user agent
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // זיהוי לפי viewport
      const isMobileViewport = viewportWidth <= 768;
      const isTabletViewport = viewportWidth > 768 && viewportWidth <= 1024;
      
      // החלטה סופית
      const isMobile = isMobileUA && isMobileViewport;
      const isTablet = isMobileUA && isTabletViewport;
      const isDesktop = !isMobile && !isTablet;
      
      let deviceType: 'mobile' | 'tablet' | 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';
      else deviceType = 'desktop';
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        deviceType
      });
    };

    // בדיקה ראשונית
    detectDevice();
    
    // מאזין לשינויי viewport
    const handleResize = () => {
      detectDevice();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return deviceInfo;
}

/**
 * Hook פשוט יותר - רק מובייל או לא
 */
export function useIsMobile(): boolean {
  const { isMobile } = useMobileDetection();
  return isMobile;
}
