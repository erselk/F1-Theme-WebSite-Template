'use client';

import { useState, useEffect } from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

interface NavItem {
  id: string;
  label: {
    en: string;
    tr: string;
  };
}

interface SmoothScrollNavProps {
  items: NavItem[];
}

export function SmoothScrollNav({ items }: SmoothScrollNavProps) {
  const [activeSection, setActiveSection] = useState<string>(items[0]?.id || '');
  const { isDark, language } = useThemeLanguage();

  useEffect(() => {
    // Create an observer to detect which section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px', // Element must be 20% from top to be considered active
        threshold: 0.1
      }
    );

    // Observe all sections
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      items.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Header height or any offset
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveSection(id);
    }
  };

  // Define inline styles to override any global CSS that might be interfering
  const navItemStyle = {
    color: isDark ? '#D0D0D0' : '#4D4D4D',  // Use hex values directly
  };
  
  const navItemHoverStyle = {
    backgroundColor: isDark ? '#2B2B2B' : '#F2F2F2',
    color: isDark ? '#CCCCCC' : '#222222',
  };
  
  const activeItemStyle = {
    backgroundColor: '#00CCFF',
    color: '#FFFFFF',
    boxShadow: '0 4px 6px rgba(0, 204, 255, 0.3)',
  };

  return (
    <nav 
      className={`sticky top-0 z-10 backdrop-blur-md rounded-b-lg shadow-lg border-b border-neon-green/30
        ${isDark ? 'bg-dark-grey/95' : 'bg-gray-100/95'}`}
    >
      <ul className="flex items-center overflow-x-auto scrollbar-hide whitespace-nowrap gap-2 px-3 py-3">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => scrollToSection(item.id)}
              style={activeSection === item.id ? activeItemStyle : navItemStyle}
              onMouseOver={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.backgroundColor = navItemHoverStyle.backgroundColor;
                  e.currentTarget.style.color = navItemHoverStyle.color;
                }
              }}
              onMouseOut={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = navItemStyle.color;
                }
              }}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors nav-item"
            >
              {item.label[language]}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}