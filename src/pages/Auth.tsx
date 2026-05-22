import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Globe, Loader2, Mail, Phone } from 'lucide-react';
import heroImage from '@/assets/hero-glass-products.jpg';
import logoImage from '@/assets/logo-isoftglass.png';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import SplashScreen from '@/components/SplashScreen';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { supabase } from '@/integrations/supabase/client';
import i18next from 'i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showSplash, setShowSplash] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCompanyName, setSignupCompanyName] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (user && !showSplash) navigate('/dashboard');
  }, [user, navigate]);

  const loginSchema = z.object({
    email: z.string().email(t('auth.invalidEmail')),
    password: z.string().min(6, t('auth.passwordMin')),
  });

  const signupSchema = z.object({
    fullName: z.string().min(2, t('auth.nameMin')),
    email: z.string().email(t('auth.invalidEmail')),
    password: z.string().min(6, t('auth.passwordMin')),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.passwordsMismatch'),
    path: ['confirmPassword'],
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      loginSchema.parse({ email: loginEmail, password: loginPassword });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: t('auth.validationError'), description: err.errors[0].message, variant: 'destructive' });
        return;
      }
    }
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    if (error) {
      toast({
        title: t('auth.loginError'),
        description: error.message === 'Invalid login credentials' ? t('auth.invalidCredentials') : error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: t('auth.welcomeBack'), description: t('auth.loginSuccess') });
      setShowSplash(true);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      signupSchema.parse({ fullName: signupFullName, email: signupEmail, password: signupPassword, confirmPassword: signupConfirmPassword });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: t('auth.validationError'), description: err.errors[0].message, variant: 'destructive' });
        return;
      }
    }
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupFullName, signupPhone, signupCompanyName);
    setIsLoading(false);
    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) message = t('auth.alreadyRegistered');
      toast({ title: t('auth.signupError'), description: message, variant: 'destructive' });
    } else {
      toast({ title: t('auth.accountCreated'), description: t('auth.signupSuccess') });
      setShowSplash(true);
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => navigate('/dashboard')} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative p-4 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" />
      
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <LanguageSelector />
        <a
          href="https://isoftglass.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/90 text-slate-800 text-sm font-medium hover:bg-white transition-colors shadow-sm"
        >
          <Globe className="h-4 w-4" />
          Website
        </a>
      </div>
      
      {/* Logo & tagline */}
      <div className="relative z-10 text-center mb-6">
        <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">iSoft<span className="text-blue-300">Glass</span></h1>
        <p className="text-white mt-2 text-sm">{t('auth.subtitle')}</p>
      </div>

      {/* Auth buttons */}
      <div className="relative z-10 flex items-center gap-3 mb-8">
        <Button
          variant={activeTab === 'login' ? 'default' : 'outline'}
          onClick={() => setActiveTab('login')}
          className={activeTab === 'login' ? '' : 'bg-white/80 text-slate-800 border-white/50 hover:bg-white'}
        >
          {t('auth.login')}
        </Button>
        <span className="text-white/80 text-sm">{t('auth.noAccount') || 'Nu ai cont?'}</span>
        <Button
          variant={activeTab === 'signup' ? 'default' : 'outline'}
          onClick={() => setActiveTab('signup')}
          className={activeTab === 'signup' ? '' : 'bg-white/80 text-slate-800 border-white/50 hover:bg-white'}
        >
          {t('auth.signup')}
        </Button>
      </div>

      {/* Forms */}
      {activeTab === 'login' && (
        <div className="w-full max-w-md relative z-10">
          <div className="pt-2">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-white">{t('auth.emailLabel')}</Label>
                <Input id="login-email" type="email" placeholder={t('auth.emailPlaceholder')} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required disabled={isLoading} className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-white">{t('auth.passwordLabel')}</Label>
                <div className="relative">
                  <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder={t('auth.passwordPlaceholder')} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required disabled={isLoading} className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/60" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4 text-white/80" /> : <Eye className="h-4 w-4 text-white/80" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('auth.loginButton')}
              </Button>
              <div className="text-center">
                <button type="button" onClick={() => setForgotOpen(true)} className="text-sm text-white/80 hover:text-white underline transition-colors">
                  {t('auth.forgotPassword')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'signup' && (
        <div className="w-full max-w-md relative z-10">
          <div className="pt-2">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-white">{t('auth.fullNameLabel')}</Label>
                  <Input id="signup-name" type="text" placeholder={t('auth.fullNamePlaceholder')} value={signupFullName} onChange={(e) => setSignupFullName(e.target.value)} required disabled={isLoading} className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/60" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="signup-phone" className="text-white">{t('auth.phoneLabel')}</Label>
                  <Input id="signup-phone" type="tel" placeholder={t('auth.phonePlaceholder')} value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} disabled={isLoading} className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/60" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="signup-company" className="text-white">{t('auth.companyLabel')}</Label>
                  <Input id="signup-company" type="text" placeholder={t('auth.companyPlaceholder')} value={signupCompanyName} onChange={(e) => setSignupCompanyName(e.target.value)} disabled={isLoading} className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/60" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">{t('auth.emailLabel')}</Label>
                  <Input id="signup-email" type="email" placeholder={t('auth.emailPlaceholder')} value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required disabled={isLoading} className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/60" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">{t('auth.passwordLabel')}</Label>
                <div className="relative">
                    <Input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder={t('auth.minCharsPassword')} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required disabled={isLoading} className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/60" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-white/80" /> : <Eye className="h-4 w-4 text-white/80" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="text-white">{t('auth.confirmPasswordLabel')}</Label>
                  <Input id="signup-confirm" type="password" placeholder={t('auth.passwordPlaceholder')} value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} required disabled={isLoading} className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/60" />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('auth.signupButton')}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Support footer */}
      <div className="relative z-10 mt-8 text-center">
        <div className="w-64 mx-auto border-t border-white/30 mb-4" />
        <p className="text-white/80 text-xs font-semibold tracking-widest uppercase mb-2">SUPORT</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-white/90 text-sm">
          <a href="mailto:contact@isoftglass.com" className="flex items-center gap-1 hover:text-white transition-colors">
            <Mail className="h-3.5 w-3.5" />
            contact@isoftglass.com
          </a>
          <a href="tel:+40754028009" className="flex items-center gap-1 hover:text-white transition-colors">
            <Phone className="h-3.5 w-3.5" />
            +40 754 028 009
          </a>
        </div>
        <p className="text-white/60 text-xs mt-3">{t('auth.copyright')}</p>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('auth.resetPassword')}</DialogTitle>
            <DialogDescription>{t('auth.resetPasswordDesc')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setForgotLoading(true);
            const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            setForgotLoading(false);
            if (error) {
              toast({ title: i18next.t('toasts.error'), description: error.message, variant: 'destructive' });
            } else {
              toast({ title: t('auth.emailSent'), description: t('auth.checkInbox') });
              setForgotOpen(false);
              setForgotEmail('');
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">{t('auth.emailLabel')}</Label>
              <Input id="forgot-email" type="email" placeholder={t('auth.emailPlaceholder')} value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required disabled={forgotLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={forgotLoading}>
              {forgotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.sendResetLink')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
