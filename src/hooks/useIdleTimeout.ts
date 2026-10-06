"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseIdleTimeoutOptions {
  timeoutMinutes: number;
  warningMinutes?: number;
  onLogout: () => void;
  onWarning?: () => void;
  enabled?: boolean;
}

export function useIdleTimeout({
  timeoutMinutes,
  warningMinutes = 2,
  onLogout,
  onWarning,
  enabled = true,
}: UseIdleTimeoutOptions) {
  const [isWarning, setIsWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(warningMinutes * 60);

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;
  
  const lastActivity = useRef<number>(Date.now());
  const warningInterval = useRef<NodeJS.Timeout | null>(null);
  const activityCheckInterval = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    lastActivity.current = Date.now();
    if (isWarning) {
      setIsWarning(false);
      setRemainingSeconds(warningMinutes * 60);
      if (warningInterval.current) {
        clearInterval(warningInterval.current);
      }
    }
  }, [isWarning, warningMinutes]);

  const dismissWarning = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled) return;

    // Track activity with throttling
    let rafId: number;
    const handleActivity = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        // Only update if not in warning state
        if (!isWarning) {
          lastActivity.current = Date.now();
        }
      });
    };

    // Listen to events
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check for idle state periodically
    activityCheckInterval.current = setInterval(() => {
      const now = Date.now();
      const timeElapsed = now - lastActivity.current;

      // If we've passed the threshold to show warning but not yet fully timed out
      if (timeElapsed >= (timeoutMs - warningMs) && timeElapsed < timeoutMs) {
        if (!isWarning) {
          setIsWarning(true);
          onWarning?.();
          
          // Start countdown
          let secondsLeft = Math.floor((timeoutMs - timeElapsed) / 1000);
          setRemainingSeconds(secondsLeft);
          
          warningInterval.current = setInterval(() => {
            secondsLeft -= 1;
            setRemainingSeconds(secondsLeft);
            
            if (secondsLeft <= 0) {
              clearInterval(warningInterval.current!);
              onLogout();
            }
          }, 1000);
        }
      } 
      // If we've completely timed out (e.g. computer went to sleep and woke up past timeout)
      else if (timeElapsed >= timeoutMs) {
        if (warningInterval.current) clearInterval(warningInterval.current);
        onLogout();
      }
    }, 1000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      cancelAnimationFrame(rafId);
      if (activityCheckInterval.current) clearInterval(activityCheckInterval.current);
      if (warningInterval.current) clearInterval(warningInterval.current);
    };
  }, [enabled, isWarning, timeoutMs, warningMs, onLogout, onWarning]);

  return { isWarning, remainingSeconds, resetTimer, dismissWarning };
}
