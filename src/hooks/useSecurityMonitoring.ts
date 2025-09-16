import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityEvent {
  type: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  title?: string;
  description?: string;
  metadata?: any;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();

  const logSecurityEvent = async (event: SecurityEvent) => {
    if (!user) return;

    try {
      await supabase.rpc('log_suspicious_activity', {
        activity_type: event.type,
        severity_level: event.severity || 'medium',
        title_text: event.title || 'Подозрительная активность',
        description_text: event.description || '',
        metadata_json: event.metadata || {}
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const auditDataAccess = async (
    action: string,
    resource: string,
    resourceId?: string,
    details?: any
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('audit_data_access', {
        action_name: action,
        resource_name: resource,
        resource_identifier: resourceId || '',
        additional_details: details || {}
      });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  };

  // Monitor for suspicious patterns
  useEffect(() => {
    if (!user) return;

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        auditDataAccess('page_hidden', 'session', '', {
          timestamp: new Date().toISOString(),
          url: window.location.href
        });
      } else {
        auditDataAccess('page_visible', 'session', '', {
          timestamp: new Date().toISOString(),
          url: window.location.href
        });
      }
    };

    // Track navigation
    const handleBeforeUnload = () => {
      auditDataAccess('page_unload', 'session', '', {
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    };

    // Monitor for rapid API calls (potential abuse)
    let apiCallCount = 0;
    let apiCallTimer: NodeJS.Timeout;

    const monitorApiCalls = () => {
      apiCallCount++;
      clearTimeout(apiCallTimer);
      
      apiCallTimer = setTimeout(() => {
        if (apiCallCount > 50) { // More than 50 calls in 10 seconds
          logSecurityEvent({
            type: 'rapid_api_calls',
            severity: 'high',
            title: 'Подозрительно частые API вызовы',
            description: `Обнаружено ${apiCallCount} API вызовов за 10 секунд`,
            metadata: { call_count: apiCallCount, window_seconds: 10 }
          });
        }
        apiCallCount = 0;
      }, 10000);
    };

    // Hook into fetch to monitor API calls
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      monitorApiCalls();
      return originalFetch.apply(this, args);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.fetch = originalFetch;
      clearTimeout(apiCallTimer);
    };
  }, [user]);

  return {
    logSecurityEvent,
    auditDataAccess
  };
};