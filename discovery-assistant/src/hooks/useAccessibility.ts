import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Keyboard shortcuts mapping
const KEYBOARD_SHORTCUTS = {
  // Navigation
  'Alt+H': '/', // Home/Dashboard
  'Alt+1': '/module/overview',
  'Alt+2': '/module/leadsAndSales',
  'Alt+3': '/module/customerService',
  'Alt+4': '/module/operations',
  'Alt+5': '/module/reporting',
  'Alt+6': '/module/aiAgents',
  'Alt+7': '/module/systems',
  'Alt+8': '/module/roi',
  'Alt+9': '/module/planning',

  // Actions
  'Ctrl+S': 'save',
  'Ctrl+E': 'export',
  'Ctrl+N': 'new-meeting',
  'Ctrl+D': 'delete',
  'Ctrl+P': 'print',
  'Ctrl+/': 'help',
  Escape: 'close-modal',
  Tab: 'next-field',
  'Shift+Tab': 'previous-field',
  Enter: 'submit',
  Space: 'toggle',
  ArrowUp: 'previous-item',
  ArrowDown: 'next-item',
  ArrowLeft: 'previous-section',
  ArrowRight: 'next-section',
  Home: 'first-item',
  End: 'last-item',
  PageUp: 'previous-module',
  PageDown: 'next-module',
};

// Focus trap for modals and dropdowns
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const closeButton = container.querySelector<HTMLButtonElement>(
          '[data-close-button]'
        );
        closeButton?.click();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscape);

    // Focus first element when activated
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscape);
    };
  }, [isActive]);

  return containerRef;
};

// Skip to content link for screen readers
export const useSkipToContent = () => {
  useEffect(() => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className =
      'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-lg z-50';
    skipLink.textContent = 'דלג לתוכן הראשי';
    skipLink.setAttribute('aria-label', 'דלג לתוכן הראשי');

    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      document.body.removeChild(skipLink);
    };
  }, []);
};

// Announce messages to screen readers
export const useAnnounce = () => {
  const [announcement, setAnnouncement] = useState('');
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    if (announcement) {
      announcerRef.current.textContent = announcement;
      // Clear after announcement
      const timer = setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  return setAnnouncement;
};

// Keyboard navigation hook
export const useKeyboardNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const announce = useAnnounce();

  const handleKeyboardShortcut = useCallback(
    (e: KeyboardEvent) => {
      // Build key combination string
      let key = '';
      if (e.ctrlKey || e.metaKey) key += 'Ctrl+';
      if (e.altKey) key += 'Alt+';
      if (e.shiftKey) key += 'Shift+';

      // Special keys
      if (e.key === ' ') key += 'Space';
      else if (e.key === 'Escape') key += 'Escape';
      else if (e.key === 'Enter') key += 'Enter';
      else if (e.key === 'Tab') key += 'Tab';
      else if (e.key.startsWith('Arrow')) key += e.key;
      else if (e.key === 'Home' || e.key === 'End') key += e.key;
      else if (e.key.startsWith('Page')) key += e.key;
      else key += e.key.toUpperCase();

      const action = KEYBOARD_SHORTCUTS[key as keyof typeof KEYBOARD_SHORTCUTS];

      if (!action) return;

      // Navigation shortcuts
      if (action.startsWith('/')) {
        e.preventDefault();
        navigate(action);
        announce(`מעבר ל${getPageName(action)}`);
        return;
      }

      // Action shortcuts
      switch (action) {
        case 'save':
          e.preventDefault();
          document
            .querySelector<HTMLButtonElement>('[data-action="save"]')
            ?.click();
          announce('נשמר');
          break;

        case 'export':
          e.preventDefault();
          document
            .querySelector<HTMLButtonElement>('[data-action="export"]')
            ?.click();
          announce('מייצא');
          break;

        case 'new-meeting':
          e.preventDefault();
          if (location.pathname === '/') {
            document
              .querySelector<HTMLButtonElement>('[data-action="new-meeting"]')
              ?.click();
            announce('יצירת פגישה חדשה');
          }
          break;

        case 'help':
          e.preventDefault();
          showHelp();
          break;

        case 'close-modal':
          const modal = document.querySelector('[role="dialog"]');
          if (modal) {
            e.preventDefault();
            const closeButton = modal.querySelector<HTMLButtonElement>(
              '[data-close-button]'
            );
            closeButton?.click();
            announce('חלון נסגר');
          }
          break;

        case 'next-module':
          e.preventDefault();
          navigateToNextModule();
          break;

        case 'previous-module':
          e.preventDefault();
          navigateToPreviousModule();
          break;
      }
    },
    [navigate, location, announce]
  );

  // Module navigation helpers
  const navigateToNextModule = useCallback(() => {
    const modules = [
      '/module/overview',
      '/module/leadsAndSales',
      '/module/customerService',
      '/module/operations',
      '/module/reporting',
      '/module/aiAgents',
      '/module/systems',
      '/module/roi',
      '/module/planning',
    ];

    const currentIndex = modules.indexOf(location.pathname);
    if (currentIndex < modules.length - 1) {
      navigate(modules[currentIndex + 1]);
      announce(`מעבר למודול הבא`);
    }
  }, [location, navigate, announce]);

  const navigateToPreviousModule = useCallback(() => {
    const modules = [
      '/module/overview',
      '/module/leadsAndSales',
      '/module/customerService',
      '/module/operations',
      '/module/reporting',
      '/module/aiAgents',
      '/module/systems',
      '/module/roi',
      '/module/planning',
    ];

    const currentIndex = modules.indexOf(location.pathname);
    if (currentIndex > 0) {
      navigate(modules[currentIndex - 1]);
      announce(`מעבר למודול הקודם`);
    }
  }, [location, navigate, announce]);

  // Show help modal
  const showHelp = () => {
    const helpContent = `
      קיצורי מקלדת:

      ניווט:
      • Alt+H - מסך ראשי
      • Alt+1-9 - מעבר למודולים
      • PageUp/PageDown - מודול קודם/הבא
      • Tab/Shift+Tab - ניווט בין שדות

      פעולות:
      • Ctrl+S - שמירה
      • Ctrl+E - ייצוא
      • Ctrl+N - פגישה חדשה
      • Ctrl+/ - עזרה
      • Escape - סגירת חלון
      • Enter - אישור
      • Space - בחירה/ביטול
    `;

    alert(helpContent);
    announce('חלון עזרה נפתח');
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcut);
    return () =>
      document.removeEventListener('keydown', handleKeyboardShortcut);
  }, [handleKeyboardShortcut]);

  return {
    navigateToNextModule,
    navigateToPreviousModule,
    showHelp,
  };
};

// Get page name for announcements
const getPageName = (path: string): string => {
  const pageNames: { [key: string]: string } = {
    '/': 'מסך ראשי',
    '/module/overview': 'סקירה כללית',
    '/module/leadsAndSales': 'לידים ומכירות',
    '/module/customerService': 'שירות לקוחות',
    '/module/operations': 'תפעול פנימי',
    '/module/reporting': 'דוחות ומדדים',
    '/module/aiAgents': 'סוכני AI',
    '/module/systems': 'מערכות וכלים',
    '/module/roi': 'חישוב ROI',
    '/module/planning': 'תכנון יישום',
  };

  return pageNames[path] || 'עמוד לא ידוע';
};

// Focus management for forms
export const useFocusManagement = () => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const registerItem = useCallback(
    (index: number) => (ref: HTMLElement | null) => {
      itemRefs.current[index] = ref;
    },
    []
  );

  const focusItem = useCallback((index: number) => {
    const item = itemRefs.current[index];
    if (item) {
      item.focus();
      setFocusedIndex(index);
    }
  }, []);

  const focusNext = useCallback(() => {
    const nextIndex = Math.min(focusedIndex + 1, itemRefs.current.length - 1);
    focusItem(nextIndex);
  }, [focusedIndex, focusItem]);

  const focusPrevious = useCallback(() => {
    const prevIndex = Math.max(focusedIndex - 1, 0);
    focusItem(prevIndex);
  }, [focusedIndex, focusItem]);

  const focusFirst = useCallback(() => {
    focusItem(0);
  }, [focusItem]);

  const focusLast = useCallback(() => {
    focusItem(itemRefs.current.length - 1);
  }, [focusItem]);

  return {
    registerItem,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusedIndex,
  };
};

// ARIA labels provider
export const getAriaLabels = (type: string, context?: any) => {
  const labels: { [key: string]: any } = {
    button: {
      save: 'שמור נתונים',
      export: 'ייצא לקובץ',
      delete: 'מחק',
      close: 'סגור',
      next: 'הבא',
      previous: 'הקודם',
      add: 'הוסף פריט',
      remove: 'הסר פריט',
      expand: 'הרחב',
      collapse: 'כווץ',
    },
    input: {
      required: 'שדה חובה',
      optional: 'שדה אופציונלי',
      email: 'כתובת דואר אלקטרוני',
      phone: 'מספר טלפון',
      date: 'תאריך',
      number: 'מספר',
      text: 'טקסט',
      search: 'חיפוש',
    },
    section: {
      navigation: 'ניווט ראשי',
      content: 'תוכן ראשי',
      sidebar: 'סרגל צד',
      footer: 'כותרת תחתונה',
      header: 'כותרת עליונה',
    },
    status: {
      loading: 'טוען...',
      success: 'הפעולה הושלמה בהצלחה',
      error: 'אירעה שגיאה',
      warning: 'אזהרה',
      info: 'מידע',
    },
    progress: {
      value: (value: number) => `${value}% הושלם`,
      step: (current: number, total: number) => `שלב ${current} מתוך ${total}`,
    },
  };

  return context ? labels[type]?.[context] : labels[type];
};

// High contrast mode detection
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isHighContrast;
};

// Reduced motion detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

// Main accessibility hook
export const useAccessibility = () => {
  const keyboardNav = useKeyboardNavigation();
  const announce = useAnnounce();
  const isHighContrast = useHighContrast();
  const prefersReducedMotion = useReducedMotion();
  const focusManagement = useFocusManagement();

  // Set document language
  useEffect(() => {
    document.documentElement.lang = 'he';
    document.documentElement.dir = 'rtl';
  }, []);

  // Add accessibility classes based on preferences
  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    if (prefersReducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  }, [isHighContrast, prefersReducedMotion]);

  return {
    ...keyboardNav,
    ...focusManagement,
    announce,
    isHighContrast,
    prefersReducedMotion,
    getAriaLabels,
  };
};
