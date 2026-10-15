import { useEffect } from 'react';

export function usePortalPresence(user, apiBase) {
  useEffect(() => {
    if (user?.role !== 'CENTRE' || !user.portalSessionId) return;
    let lastActivity = Date.now();
    let stopped = false;
    let pending = false;
    const controller = new AbortController();
    const activity = () => { lastActivity = Date.now(); };
    const pulse = async () => {
      if (pending || stopped || !navigator.onLine) return;
      // Another tab may have logged out or signed in as someone else.
      if (localStorage.getItem('csrl_token') !== user.token) { stopped = true; return; }
      pending = true;
      try {
        const res = await fetch(`${apiBase}/portal-login-tracking/heartbeat`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({ active: document.visibilityState === 'visible' && Date.now() - lastActivity < 300000 }),
          signal: controller.signal,
        });
        if ([401, 403, 404, 410].includes(res.status)) stopped = true;
      } catch { /* Retry at the next interval without interrupting portal use. */ }
      finally { pending = false; }
    };
    const onVisibility = () => { if (document.visibilityState === 'visible') activity(); pulse(); };
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, activity, { passive: true }));
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', pulse);
    pulse();
    const timer = window.setInterval(pulse, 30000);
    return () => {
      stopped = true; controller.abort(); clearInterval(timer);
      events.forEach(event => window.removeEventListener(event, activity));
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', pulse);
    };
  }, [user?.token, user?.portalSessionId, user?.role, apiBase]);
}
