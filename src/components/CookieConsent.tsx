import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-900 text-white p-4 shadow-2xl border-t border-slate-700">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-slate-300 flex-1">
          {t('cookies.bannerText')}{' '}
          {t('cookies.bannerDetails').split(t('cookies.bannerLink')).length > 1 ? (
            <>
              <Link to="/cookies" className="text-blue-400 hover:underline">{t('cookies.bannerLink')}</Link>{' '}
              {t('cookies.bannerDetails')}
            </>
          ) : (
            <>
              <Link to="/cookies" className="text-blue-400 hover:underline">{t('cookies.bannerLink')}</Link>{' '}
              {t('cookies.bannerDetails')}
            </>
          )}
        </p>
        <div className="flex gap-3 shrink-0">
          <button onClick={decline} className="px-4 py-2 text-sm border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors">
            {t('cookies.essentialOnly')}
          </button>
          <button onClick={accept} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
            {t('cookies.acceptAll')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;