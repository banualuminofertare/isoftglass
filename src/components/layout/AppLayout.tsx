import { ReactNode, useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { AnnouncementsBell } from '@/components/announcements/AnnouncementsBell';
import { ManualButton } from '@/components/manual/ManualButton';
import { useVersionAnnouncement } from '@/hooks/useVersionAnnouncement';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useCurrency } from '@/contexts/CurrencyContext';

import { ApprovalGate } from './ApprovalGate';
import { UserImpersonationBanner } from '@/components/admin/UserImpersonationBanner';
import { AccessRequestDialog } from '@/components/admin/AccessRequestDialog';
import { PendingInvitationBanner } from '@/components/team/PendingInvitationBanner';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { user, loading, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  useVersionAnnouncement();
  
  const { currency, setCurrency } = useCurrency();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowRecovery(true), 8000);
      return () => clearTimeout(timer);
    }
    setShowRecovery(false);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {showRecovery && (
          <div className="text-center space-y-3 animate-in fade-in duration-500">
            <p className="text-sm text-muted-foreground">{t('ui.loadingTooLong')}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/auth';
              }}
            >
              Șterge cache și re-autentifică
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background" translate="no" suppressHydrationWarning>
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="flex h-12 sm:h-14 shrink-0 items-center gap-1.5 sm:gap-2 border-b border-border/50 px-2 sm:px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-0.5" />
            <Separator orientation="vertical" className="mr-1 sm:mr-2 h-4" />
            {title && <h1 className="font-semibold text-foreground text-sm sm:text-base truncate">{title}</h1>}
            
            <div className="flex-1" />
            
            <AnnouncementsBell />
            <ManualButton />
            <ToggleGroup type="single" value={currency} onValueChange={(v) => v && setCurrency(v as 'RON' | 'EUR')} variant="outline" size="sm">
              <ToggleGroupItem value="RON" className="text-xs px-2 h-7">RON</ToggleGroupItem>
              <ToggleGroupItem value="EUR" className="text-xs px-2 h-7">EUR</ToggleGroupItem>
            </ToggleGroup>
            <LanguageSelector />
            
            <Button
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="gap-1 sm:gap-2 text-muted-foreground hover:text-foreground h-8 sm:h-9 px-2 sm:px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('common.logout')}</span>
            </Button>
          </header>
          <UserImpersonationBanner />
          <PendingInvitationBanner />
          <AccessRequestDialog />
          <main className="flex-1 p-2 sm:p-4 overflow-y-auto min-h-0 touch-scroll">
            <ApprovalGate>
                {children}
            </ApprovalGate>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
