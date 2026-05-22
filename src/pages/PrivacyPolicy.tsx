import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-8">{t('legal.privacy.title')}</h1>
        <p className="text-slate-500 text-sm mb-8">{t('legal.lastUpdate')}: {new Date().toLocaleDateString(i18n.language)}</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.privacy.s1Title')}</h2>
            <p>{t('legal.privacy.s1Body')} <a href="mailto:isoftplustech@gmail.com" className="text-blue-600 hover:underline">isoftplustech@gmail.com</a>, +40 754 028 009.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.privacy.s2Title')}</h2>
            <p>{t('legal.privacy.s2Intro')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.privacy.s2Item1')}</li>
              <li>{t('legal.privacy.s2Item2')}</li>
              <li>{t('legal.privacy.s2Item3')}</li>
              <li>{t('legal.privacy.s2Item4')}</li>
              <li>{t('legal.privacy.s2Item5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.privacy.s3Title')}</h2>
            <p>{t('legal.privacy.s3Intro')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.privacy.s3Item1')}</li>
              <li>{t('legal.privacy.s3Item2')}</li>
              <li>{t('legal.privacy.s3Item3')}</li>
              <li>{t('legal.privacy.s3Item4')}</li>
              <li>{t('legal.privacy.s3Item5')}</li>
              <li>{t('legal.privacy.s3Item6')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.privacy.s4Title')}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.privacy.s4Item1')}</li>
              <li>{t('legal.privacy.s4Item2')}</li>
              <li>{t('legal.privacy.s4Item3')}</li>
              <li>{t('legal.privacy.s4Item4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.privacy.s5Title')}</h2>
            <p>{t('legal.privacy.s5Intro')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.privacy.s5Item1')}</li>
              <li>{t('legal.privacy.s5Item2')}</li>
              <li>{t('legal.privacy.s5Item3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.privacy.s6Title')}</h2>
            <p>{t('legal.privacy.s6Intro')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.privacy.s6Item1')}</li>
              <li>{t('legal.privacy.s6Item2')}</li>
              <li>{t('legal.privacy.s6Item3')}</li>
              <li>{t('legal.privacy.s6Item4')}</li>
              <li>{t('legal.privacy.s6Item5')}</li>
              <li>{t('legal.privacy.s6Item6')}</li>
              <li>{t('legal.privacy.s6Item7')}</li>
            </ul>
            <p className="mt-2">{t('legal.privacy.s6Note')} <a href="mailto:isoftplustech@gmail.com" className="text-blue-600 hover:underline">isoftplustech@gmail.com</a></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.privacy.s7Title')}</h2>
            <p>{t('legal.privacy.s7Intro')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.privacy.s7Item1')}</li>
              <li>{t('legal.privacy.s7Item2')}</li>
              <li>{t('legal.privacy.s7Item3')}</li>
            </ul>
            <p className="mt-2">{t('legal.privacy.s7Note')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.privacy.s8Title')}</h2>
            <p>{t('legal.privacy.s8Body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.privacy.s9Title')}</h2>
            <p>{t('legal.privacy.s9Intro')}</p>
            <p>{t('legal.privacy.s9Email')} <a href="mailto:isoftplustech@gmail.com" className="text-blue-600 hover:underline">isoftplustech@gmail.com</a></p>
            <p>{t('legal.privacy.s9Phone')} +40 754 028 009</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
