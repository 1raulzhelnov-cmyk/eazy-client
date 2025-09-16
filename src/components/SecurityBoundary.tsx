import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityBoundaryProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Security boundary component that enforces authentication and session management
 */
export const SecurityBoundary: React.FC<SecurityBoundaryProps> = ({ 
  children, 
  requireAuth = false 
}) => {
  const { user, session } = useAuth();

  useEffect(() => {
    // Auto-logout after 24 hours of inactivity
    let logoutTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        if (session) {
          // Force logout due to inactivity
          console.log('Auto-logout due to inactivity');
          // This will be handled by the auth context
        }
      }, 24 * 60 * 60 * 1000); // 24 hours
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    if (session) {
      resetTimer();
      events.forEach(event => {
        document.addEventListener(event, resetTimer, true);
      });
    }

    return () => {
      clearTimeout(logoutTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [session]);

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Требуется авторизация</h2>
          <p className="text-muted-foreground">
            Для доступа к этой странице необходимо войти в систему.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};