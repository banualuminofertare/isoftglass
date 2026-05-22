import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const CookiePolicy = () => {
  const { t, i18n } = useTranslation();
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
            <ArrowLeft size={18} /> {t('legal.back')}
          </Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">{t('legal.cookies.title')}</h1>
        <p className="text-slate-500 text-sm mb-8">{t('legal.lastUpdate')}: {new Date().toLocaleDateString(i18n.language)}</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.cookies.s1Title')}</h2>
            <p>{t('legal.cookies.s1Body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.cookies.s2Title')}</h2>

            <h3 className="text-lg font-medium text-slate-800 mt-4 mb-2">{t('legal.cookies.s2aTitle')}</h3>
            <p>{t('legal.cookies.s2aIntro')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.cookies.s2aItem1')}</li>
              <li>{t('legal.cookies.s2aItem2')}</li>
              <li>{t('legal.cookies.s2aItem3')}</li>
            </ul>
            <p className="mt-1 text-slate-500 italic">{t('legal.cookies.s2aNote')}</p>

            <h3 className="text-lg font-medium text-slate-800 mt-4 mb-2">{t('legal.cookies.s2bTitle')}</h3>
            <p>{t('legal.cookies.s2bIntro')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.cookies.s2bItem1')}</li>
              <li>{t('legal.cookies.s2bItem2')}</li>
            </ul>

            <h3 className="text-lg font-medium text-slate-800 mt-4 mb-2">{t('legal.cookies.s2cTitle')}</h3>
            <p>{t('legal.cookies.s2cBody')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.cookies.s3Title')}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.cookies.s3Item1')}</li>
              <li>{t('legal.cookies.s3Item2')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.cookies.s4Title')}</h2>
            <p>{t('legal.cookies.s4Intro')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.cookies.s4Item1')}</li>
              <li>{t('legal.cookies.s4Item2')}</li>
            </ul>
            <p className="mt-2">{t('legal.cookies.s4Note')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.cookies.s5Title')}</h2>
            <p>{t('legal.cookies.s5Intro')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.cookies.s5Item1')}</li>
              <li>{t('legal.cookies.s5Item2')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.cookies.s6Title')}</h2>
            <p>{t('legal.cookies.s6Body')} <a href="mailto:isoftplustech@gmail.com" className="text-blue-600 hover:underline">isoftplustech@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
