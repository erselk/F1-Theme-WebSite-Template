'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
};

const BackgroundAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { isDark } = useThemeLanguage();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };
    
    // Initialize particles
    const initParticles = () => {
      particles.current = [];
      const particleCount = Math.min(Math.floor(window.innerWidth * 0.05), 100); // Responsive particle count
      
      for (let i = 0; i < particleCount; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: Math.random() * 0.8 - 0.4,
          speedY: Math.random() * 0.8 - 0.4
        });
      }
    };
    
    // Track mouse position
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = {
        x: event.clientX,
        y: event.clientY
      };
    };
    
    // Draw particles and connections
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles and update positions
      particles.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Boundary check with bounce effect
        if (particle.x > canvas.width || particle.x < 0) {
          particle.speedX = -particle.speedX;
        }
        
        if (particle.y > canvas.height || particle.y < 0) {
          particle.speedY = -particle.speedY;
        }
        
        // Subtle orientation towards mouse direction without gathering
        const dx = mousePosition.current.x - particle.x;
        const dy = mousePosition.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          // Calculate angle towards mouse
          const angle = Math.atan2(dy, dx);
          // Very slight influence on direction
          particle.speedX += Math.cos(angle) * 0.001;
          particle.speedY += Math.sin(angle) * 0.001;
          
          // Normalize speed to keep particles moving at consistent speed
          const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
          if (speed > 1.0) {
            particle.speedX = (particle.speedX / speed) * 1.0;
            particle.speedY = (particle.speedY / speed) * 1.0;
          }
        }
        
        // Draw particle - different colors based on theme and homepage
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        // Choose particle color based on theme and whether it's homepage
        if (isDark) {
          // Dark theme colors
          ctx.fillStyle = isHomePage ? 'rgba(255, 255, 255, 0.7)' : 'rgba(200, 200, 200, 0.5)';
        } else {
          // Light theme colors - darker tone for better visibility
          ctx.fillStyle = isHomePage ? 'rgba(80, 80, 80, 0.7)' : 'rgba(100, 100, 100, 0.6)';
        }
        ctx.fill();
        
        // Connect particles that are close to each other
        let connectionCount = 0;
        const maxConnections = 6; // Limit to 6 connections per particle
        
        for (let j = index + 1; j < particles.current.length; j++) {
          // Stop connecting if we've reached the maximum number of connections
          if (connectionCount >= maxConnections) break;
          
          const otherParticle = particles.current[j];
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            connectionCount++;
            const opacity = 1 - distance / 100;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            
            // Line colors based on theme and homepage
            if (isDark) {
              // Dark theme line colors
              ctx.strokeStyle = isHomePage 
                ? `rgba(255, 255, 255, ${opacity * 0.6})` 
                : `rgba(200, 200, 200, ${opacity * 0.5})`;
            } else {
              // Light theme line colors - darker for better visibility
              ctx.strokeStyle = isHomePage 
                ? `rgba(80, 80, 80, ${opacity * 0.5})` 
                : `rgba(100, 100, 100, ${opacity * 0.4})`;
            }
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });
      
      animationFrameId.current = window.requestAnimationFrame(draw);
    };
    
    // Set up event listeners and start animation
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    resizeCanvas();
    draw();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        window.cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isHomePage, isDark, pathname]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none ${isHomePage ? 'z-0' : '-z-20'}`}
      style={{ 
        opacity: isHomePage ? 0.6 : 0.6
      }}
    />
  );
};

export default BackgroundAnimation;