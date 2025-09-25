'use client';

import { useEffect, useRef } from 'react';

export default function CursorEffect() {
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Check if it's a touch device
    if ('ontouchstart' in window) {
      const cursorEffect = document.querySelector('.cursor-effect');
      if (cursorEffect) {
        (cursorEffect as HTMLElement).style.display = 'none';
      }
      return;
    }

    const cursorGlow = document.getElementById('cursor-glow');
    const cursorTrail = document.getElementById('cursor-trail');
    
    if (!cursorGlow || !cursorTrail) return;

    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;
    let trailX = 0;
    let trailY = 0;
    let isAnimating = false;

    // Throttle mouse move events
    let lastMouseMoveTime = 0;
    const throttleDelay = 16; // ~60fps

    // Track mouse movement with throttling
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMoveTime < throttleDelay) return;
      
      lastMouseMoveTime = now;
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (!isAnimating) {
        isAnimating = true;
        animate();
      }
    };

    // Optimized animation loop that stops when cursor stops moving
    function animate() {
      const prevGlowX = glowX;
      const prevGlowY = glowY;
      const prevTrailX = trailX;
      const prevTrailY = trailY;

      // Smooth glow movement with easing
      glowX += (mouseX - glowX) * 0.1;
      glowY += (mouseY - glowY) * 0.1;

      // Faster trail movement
      trailX += (mouseX - trailX) * 0.3;
      trailY += (mouseY - trailY) * 0.3;

      // Use transform instead of left/top for better performance
      if (cursorGlow) {
        cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px)`;
      }

      if (cursorTrail) {
        cursorTrail.style.transform = `translate(${trailX}px, ${trailY}px)`;
        cursorTrail.style.opacity = '0.6';
      }

      // Continue animation only if elements are still moving significantly
      const threshold = 0.5;
      const stillMoving = 
        Math.abs(glowX - prevGlowX) > threshold ||
        Math.abs(glowY - prevGlowY) > threshold ||
        Math.abs(trailX - prevTrailX) > threshold ||
        Math.abs(trailY - prevTrailY) > threshold;

      if (stillMoving) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        isAnimating = false;
      }
    }

    // Add hover effects for interactive elements
    const addHoverEffects = () => {
      const interactiveElements = document.querySelectorAll('button, a, input, .group');
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
          if (cursorGlow) {
            cursorGlow.classList.add('hover');
          }
        });

        el.addEventListener('mouseleave', () => {
          if (cursorGlow) {
            cursorGlow.classList.remove('hover');
          }
        });
      });
    };

    // Add click effect
    const handleMouseDown = () => {
      if (cursorGlow) {
        cursorGlow.classList.add('active');
      }
    };

    const handleMouseUp = () => {
      if (cursorGlow) {
        setTimeout(() => {
          cursorGlow.classList.remove('active');
        }, 150);
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Add hover effects with a slight delay to ensure DOM is ready
    setTimeout(addHoverEffects, 100);

    // Start animation
    animate();

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Clean up hover effect listeners
      const interactiveElements = document.querySelectorAll('button, a, input, .group');
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', () => {});
        el.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  return (
    <div className="cursor-effect">
      <div className="cursor-glow" id="cursor-glow"></div>
      <div className="cursor-trail" id="cursor-trail"></div>
    </div>
  );
}