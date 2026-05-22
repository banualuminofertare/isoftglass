import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const TermsConditions = () => {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-8">{t('legal.terms.title')}</h1>
        <p className="text-slate-500 text-sm mb-8">{t('legal.lastUpdate')}: {new Date().toLocaleDateString(i18n.language)}</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.terms.s1Title')}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.terms.s1Item1')}</li>
              <li>{t('legal.terms.s1Item2')}</li>
              <li>{t('legal.terms.s1Item3')}</li>
              <li>{t('legal.terms.s1Item4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.terms.s2Title')}</h2>
            <p>{t('legal.terms.s2Body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.terms.s3Title')}</h2>
            <p>{t('legal.terms.s3Intro')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.terms.s3Item1')}</li>
              <li>{t('legal.terms.s3Item2')}</li>
              <li>{t('legal.terms.s3Item3')}</li>
              <li>{t('legal.terms.s3Item4')}</li>
              <li>{t('legal.terms.s3Item5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.terms.s4Title')}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.terms.s4Item1')}</li>
              <li>{t('legal.terms.s4Item2')}</li>
              <li>{t('legal.terms.s4Item3')}</li>
              <li>{t('legal.terms.s4Item4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.terms.s5Title')}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.terms.s5Item1')}</li>
              <li>{t('legal.terms.s5Item2')}</li>
              <li>{t('legal.terms.s5Item3')}</li>
              <li>{t('legal.terms.s5Item4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.terms.s6Title')}</h2>
            <p>{t('legal.terms.s6Body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.terms.s7Title')}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('legal.terms.s7Item1')}</li>
              <li>{t('legal.terms.s7Item2')}</li>
              <li>{t('legal.terms.s7Item3')}</li>
              <li>{t('legal.terms.s7Item4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.terms.s8Title')}</h2>
            <p>{t('legal.terms.s8Body')} <Link to="/confidentialitate" className="text-blue-600 hover:underline">{t('legal.terms.s8Link')}</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.terms.s9Title')}</h2>
            <p>{t('legal.terms.s9Body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.terms.s10Title')}</h2>
            <p>{t('legal.terms.s10Body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{t('legal.terms.s11Title')}</h2>
            <p>{t('legal.terms.s11Email')} <a href="mailto:isoftplustech@gmail.com" className="text-blue-600 hover:underline">isoftplustech@gmail.com</a></p>
            <p>{t('legal.terms.s11Phone')} +40 754 028 009</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
