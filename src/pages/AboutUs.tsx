import { ArrowLeft, Factory, Cpu, Users, TrendingUp, Handshake, CheckCircle, Zap, BarChart3, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/layout/LanguageSelector";

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm">iG</div>
            <span className="text-slate-900 font-semibold text-lg tracking-tight">iSoftGlass</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm transition-colors">
              <ArrowLeft size={16} />
              {t('aboutUs.back')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-cyan-400 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white blur-2xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-blue-200 text-sm font-semibold mb-6 border border-white/10">
            {t('aboutUs.badge')}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-8">
            {t('aboutUs.heroTitle')}
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            {t('aboutUs.heroDesc')}
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Cpu size={28} className="text-blue-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('aboutUs.section1Title')}</h2>
          </div>
          <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
            <p>{t('aboutUs.section1P1')}</p>
            <p>{t('aboutUs.section1P2')}</p>
          </div>
        </div>
      </section>

      {/* Realitatea din fabrici */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <Factory size={28} className="text-orange-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('aboutUs.section2Title')}</h2>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">{t('aboutUs.section2P1')}</p>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">{t('aboutUs.section2P2')}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Zap, text: t('aboutUs.section2B1') },
              { icon: BarChart3, text: t('aboutUs.section2B2') },
              { icon: CheckCircle, text: t('aboutUs.section2B3') },
              { icon: Factory, text: t('aboutUs.section2B4') },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <Icon size={22} className="text-blue-600 shrink-0" />
                <span className="text-slate-700 font-medium">{text}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-base mt-8 italic">{t('aboutUs.section2Note')}</p>
        </div>
      </section>

      {/* Tehnologie */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Clock size={28} className="text-blue-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('aboutUs.section3Title')}</h2>
          </div>
          <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
            <p>{t('aboutUs.section3P1')}</p>
            <p>{t('aboutUs.section3P2')}</p>
          </div>
        </div>
      </section>

      {/* Echipa */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Users size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('aboutUs.section4Title')}</h2>
          </div>
          <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
            <p>{t('aboutUs.section4P1')}</p>
            <p>{t('aboutUs.section4P2')}</p>
          </div>
        </div>
      </section>

      {/* Eficiență */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <TrendingUp size={28} className="text-blue-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('aboutUs.section5Title')}</h2>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">{t('aboutUs.section5P1')}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[t('aboutUs.section5B1'), t('aboutUs.section5B2'), t('aboutUs.section5B3'), t('aboutUs.section5B4')].map((text) => (
              <div key={text} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-emerald-200">
                <CheckCircle size={20} className="text-emerald-600 shrink-0" />
                <span className="text-slate-700 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partener digital */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-80 h-80 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-cyan-400 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <Handshake size={28} className="text-blue-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{t('aboutUs.section6Title')}</h2>
          </div>
          <div className="space-y-6 text-blue-100 text-lg leading-relaxed mb-10">
            <p>{t('aboutUs.section6P1')}</p>
            <p>{t('aboutUs.section6P2')}</p>
          </div>
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-xl sm:text-2xl font-bold text-white mt-8">{t('aboutUs.tagline')}</p>
            <div className="mt-10">
              <Link to="/" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-10 py-4 rounded-xl transition-colors shadow-lg shadow-orange-500/25 inline-block">
                {t('aboutUs.ctaDiscover')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs">iG</div>
              <span className="text-slate-400 text-sm">{t('aboutUs.footer.rights', { year: new Date().getFullYear() })}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link to="/" className="text-slate-400 hover:text-white text-sm transition-colors">{t('aboutUs.home')}</Link>
              <Link to="/auth" className="text-slate-400 hover:text-white text-sm transition-colors">{t('aboutUs.auth')}</Link>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-4 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <Link to="/confidentialitate" className="hover:text-white transition-colors">{t('aboutUs.footer.privacy')}</Link>
            <span className="hidden sm:inline text-slate-700">|</span>
            <Link to="/cookies" className="hover:text-white transition-colors">{t('aboutUs.footer.cookies')}</Link>
            <span className="hidden sm:inline text-slate-700">|</span>
            <Link to="/termeni" className="hover:text-white transition-colors">{t('aboutUs.footer.terms')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;