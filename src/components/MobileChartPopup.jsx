import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Mobile dialogs escape dashboard clipping; desktop markup remains unchanged.
export default function MobileChartPopup({ children }) {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');
    const update = () => setMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  if (!mobile) return children;
  return createPortal(<div className="mobile-chart-popup">
    <style>{`
      .mobile-chart-popup > div {
        position: fixed !important; inset: 0 !important; z-index: 2000 !important;
        padding: max(8px, env(safe-area-inset-top)) 8px max(8px, env(safe-area-inset-bottom)) !important;
        align-items: stretch !important; overflow: auto;
      }
      .mobile-chart-popup > div > div {
        width: 100% !important; max-width: none !important; margin: 0 !important;
        height: 100% !important; max-height: none !important; min-height: 0;
        padding: 32px 8px 8px !important;
        background: #f8fafc !important; overflow: auto;
      }
      .mobile-chart-popup > div > div > div:last-child {
        min-height: 0; padding: 8px !important;
      }
      .mobile-chart-popup > div > div > div:last-child > div:first-child {
        flex-wrap: wrap; gap: 8px;
      }
      .mobile-chart-popup .mobile-popup-chart-grid {
        grid-template-columns: minmax(0, 1fr) !important;
        height: auto !important;
      }
      .mobile-chart-popup .mobile-popup-chart-grid > .card {
        height: 520px !important; min-height: 520px; padding: 12px;
      }
      .mobile-chart-popup .mobile-popup-chart-grid > .card > div:first-child {
        flex-wrap: wrap; gap: 8px;
      }
      .mobile-chart-popup .mobile-popup-chart-grid > .card > div:last-child {
        min-height: 0;
      }
      .mobile-chart-popup .recharts-label-list text,
      .mobile-chart-popup .recharts-xAxis text {
        font-size: 8px !important;
      }
      .mobile-chart-popup .recharts-cartesian-axis-label { font-size: 11px !important; }
      .mobile-chart-popup * { -webkit-text-size-adjust: none; text-size-adjust: none; }
    `}</style>
    {children}
  </div>, document.body);
}
