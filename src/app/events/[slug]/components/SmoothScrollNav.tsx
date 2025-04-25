'use client';

import { useState, useEffect } from 'react';
import { LanguageType } from '@/lib/ThemeLanguageContext';

interface NavItem {
  id: string;
  label: {
    en: string;
    tr: string;
  };
}

interface SmoothScrollNavProps {
  items: NavItem[];
  locale: LanguageType;
}

export function SmoothScrollNav({ items, locale }: SmoothScrollNavProps) {
  const [activeSection, setActiveSection] = useState<string>(items[0]?.id || '');

  useEffect(() => {
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
        threshold: 0
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

  return (
    <nav className="sticky top-20 z-10 bg-dark-grey/80 backdrop-blur-md rounded-lg p-2 shadow-lg">
      <ul className="flex items-center overflow-x-auto whitespace-nowrap gap-2 px-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => scrollToSection(item.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeSection === item.id
                  ? 'bg-electric-blue/20 text-electric-blue'
                  : 'text-light-grey hover:bg-carbon-grey/30 hover:text-white'
                }`}
            >
              {item.label[locale]}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}