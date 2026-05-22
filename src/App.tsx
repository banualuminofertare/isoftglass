import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminImpersonationProvider } from "@/contexts/AdminImpersonationContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Loader2 } from "lucide-react";


// Landing is now just a redirect
const Landing = React.lazy(() => import("./pages/Landing"));
import CookieConsent from "./components/CookieConsent";
import { reportError, setupGlobalErrorHandlers } from "./lib/errorReporter";
import { useActivityTracker } from "@/hooks/useActivityTracker";

function ActivityTracker() {
  useActivityTracker();
  return null;
}

// Lazy-loaded pages
const Index = React.lazy(() => import("./pages/Index"));
const Auth = React.lazy(() => import("./pages/Auth"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Orders = React.lazy(() => import("./pages/Orders"));
const Production = React.lazy(() => import("./pages/Production"));
const Inventory = React.lazy(() => import("./pages/Inventory"));
const Clients = React.lazy(() => import("./pages/Clients"));
const Reports = React.lazy(() => import("./pages/Reports"));
const Settings = React.lazy(() => import("./pages/Settings"));
const AdminUsers = React.lazy(() => import("./pages/AdminUsers"));
const AdminSubscriptions = React.lazy(() => import("./pages/AdminSubscriptions"));
const AdminAnnouncements = React.lazy(() => import("./pages/AdminAnnouncements"));
const AdminCatalogs = React.lazy(() => import("./pages/AdminCatalogs"));
const ShowerCalculator = React.lazy(() => import("./pages/calculators/ShowerCalculator"));
const BalustradeCalculator = React.lazy(() => import("./pages/calculators/BalustradeCalculator"));
const DoorCalculator = React.lazy(() => import("./pages/calculators/DoorCalculator"));
const PanelCalculator = React.lazy(() => import("./pages/calculators/PanelCalculator"));
const MirrorCalculator = React.lazy(() => import("./pages/calculators/MirrorCalculator"));
const KitchenFrontCalculator = React.lazy(() => import("./pages/calculators/KitchenFrontCalculator"));
const ServiceTickets = React.lazy(() => import("./pages/ServiceTickets"));
const ProductionScanner = React.lazy(() => import("./pages/ProductionScanner"));
const Processing = React.lazy(() => import("./pages/Processing"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = React.lazy(() => import("./pages/CookiePolicy"));
const TermsConditions = React.lazy(() => import("./pages/TermsConditions"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const CuttingOptimization = React.lazy(() => import("./pages/CuttingOptimization"));
const AboutUs = React.lazy(() => import("./pages/AboutUs"));
const AdminErrorLogs = React.lazy(() => import("./pages/AdminErrorLogs"));
const AdminAnalytics = React.lazy(() => import("./pages/AdminAnalytics"));
const OperationalDashboard = React.lazy(() => import("./pages/OperationalDashboard"));
const Installation = React.lazy(() => import("./pages/Installation"));
const Invoicing = React.lazy(() => import("./pages/Invoicing"));
const InstallationReportsPage = React.lazy(() => import("./pages/InstallationReportsPage"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Global Error Boundary
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AppErrorBoundary] Uncaught error:', error, info.componentStack);
    reportError(error, { componentStack: info.componentStack ?? undefined });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleClearAndReauth = () => {
    // Clear all localStorage (removes stale Supabase tokens)
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/auth';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="text-6xl">⚠️</div>
            <h1 className="text-2xl font-bold text-foreground">
              A apărut o eroare neașteptată
            </h1>
            <p className="text-muted-foreground text-sm">
              {this.state.error?.message || 'Aplicația a întâmpinat o problemă.'}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Reîncearcă
              </button>
              <button
                onClick={this.handleClearAndReauth}
                className="w-full px-4 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Șterge cache și re-autentifică
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
});

// Setup global JS error handlers for error reporting
setupGlobalErrorHandlers();

const App = () => {
  return (
  <>
    <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminImpersonationProvider>
        <CurrencyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ActivityTracker />
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/confidentialitate" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/termeni" element={<TermsConditions />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/despre-noi" element={<AboutUs />} />
              
              {/* Calculator routes */}
              <Route path="/calculator/cabine-dus" element={<ShowerCalculator />} />
              <Route path="/calculator/balustrade" element={<BalustradeCalculator />} />
              <Route path="/calculator/usi" element={<DoorCalculator />} />
              <Route path="/calculator/panouri" element={<PanelCalculator />} />
              <Route path="/calculator/oglinzi" element={<MirrorCalculator />} />
              <Route path="/calculator/fronturi" element={<KitchenFrontCalculator />} />
              
              {/* Operational routes */}
              <Route path="/operational" element={<OperationalDashboard />} />
              <Route path="/comenzi" element={<Orders />} />
              <Route path="/facturare" element={<Invoicing />} />
              <Route path="/productie" element={<Production />} />
              <Route path="/productie/scanner" element={<ProductionScanner />} />
              <Route path="/inventar" element={<Inventory />} />
              <Route path="/optimizare-debitare" element={<CuttingOptimization />} />
              <Route path="/montaj" element={<Installation />} />
              <Route path="/rapoarte-montaj" element={<InstallationReportsPage />} />
              <Route path="/prelucrari" element={
                <ProtectedRoute>
                  <Processing />
                </ProtectedRoute>
              } />

              {/* Management routes */}
              <Route path="/clienti" element={<Clients />} />
              <Route path="/reclamatii" element={<ServiceTickets />} />
              <Route path="/rapoarte" element={<Reports />} />
              <Route path="/setari" element={<Settings />} />
              <Route path="/admin/utilizatori" element={
                <ProtectedRoute adminOnly>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/crm" element={
                <ProtectedRoute adminOnly>
                  <AdminSubscriptions />
                </ProtectedRoute>
              } />
              <Route path="/admin/anunturi" element={
                <ProtectedRoute adminOnly>
                  <AdminAnnouncements />
                </ProtectedRoute>
              } />
              <Route path="/admin/cataloage" element={<AdminCatalogs />} />
              <Route path="/admin/erori" element={
                <ProtectedRoute adminOnly>
                  <AdminErrorLogs />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute adminOnly>
                  <AdminAnalytics />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
            <CookieConsent />
          </BrowserRouter>
        </TooltipProvider>
        </CurrencyProvider>
        </AdminImpersonationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
  </>
  );
};

export default App;
