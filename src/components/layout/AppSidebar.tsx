import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Calculator, ClipboardList, Factory, Package, Users, 
  BarChart3, Settings, ChevronDown, Boxes, DoorOpen, Layers, 
  Circle, SquareStack, Grid3X3, Shield, AlertTriangle, ScanBarcode, Ruler, CreditCard, Scissors, Megaphone, BookOpen,
  Wrench, HardHat, Receipt,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import { APP_VERSION } from '@/config/version';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, SidebarHeader, useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user, role, hasProcessingAccess, hasCalculatorAccess, hasOperationalAccess } = useAuth();
  const { isAdmin } = usePermissions();
  const { t } = useTranslation();
  const [calculatorOpen, setCalculatorOpen] = useState(true);
  const [operationalOpen, setOperationalOpen] = useState(true);
  const [installationOpen, setInstallationOpen] = useState(true);

  const mainNavItems = [
    { title: t('nav.dashboard'), url: '/', icon: LayoutDashboard, permission: 'view_dashboard', color: 'text-blue-600' },
  ];

  const calculatorItems = [
    { title: t('nav.showerCabins'), url: '/calculator/cabine-dus', icon: Boxes, color: 'text-sky-500' },
    { title: t('nav.balustrades'), url: '/calculator/balustrade', icon: Layers, color: 'text-emerald-500' },
    { title: t('nav.glassDoors'), url: '/calculator/usi', icon: DoorOpen, color: 'text-amber-500' },
    { title: t('nav.panels'), url: '/calculator/panouri', icon: SquareStack, color: 'text-violet-500' },
    { title: t('nav.mirrors'), url: '/calculator/oglinzi', icon: Circle, color: 'text-rose-500' },
    { title: t('nav.kitchenFronts'), url: '/calculator/fronturi', icon: Grid3X3, color: 'text-teal-500' },
    { title: t('nav.settings'), url: '/setari', icon: Settings, color: 'text-gray-500' },
  ];

  const operationalItems = [
    { title: t('nav.orders'), url: '/comenzi', icon: ClipboardList, color: 'text-blue-500' },
    { title: t('nav.production'), url: '/productie', icon: Factory, color: 'text-emerald-500' },
    { title: t('nav.productionScanner'), url: '/productie/scanner', icon: ScanBarcode, color: 'text-cyan-500' },
    { title: t('nav.clients'), url: '/clienti', icon: Users, color: 'text-violet-500' },
    { title: t('nav.reports'), url: '/rapoarte', icon: BarChart3, color: 'text-amber-500' },
    { title: t('nav.installationReports'), url: '/rapoarte-montaj', icon: HardHat, color: 'text-lime-500' },
    { title: t('nav.operationalDashboard'), url: '/operational', icon: LayoutDashboard, color: 'text-indigo-500' },
    { title: 'Facturare', url: '/facturare', icon: Receipt, color: 'text-pink-500' },
    { title: t('nav.inventory'), url: '/inventar', icon: Package, color: 'text-orange-500' },
    { title: t('nav.complaints'), url: '/reclamatii', icon: AlertTriangle, color: 'text-red-500' },
  ];

  const installationItems = [
    { title: t('installation.calendar'), url: '/montaj', icon: Wrench, color: 'text-lime-600' },
  ];

  const processingItems = [
    { title: t('nav.processing'), url: '/prelucrari', icon: Ruler, color: 'text-orange-600' },
    { title: t('nav.cuttingOptimization'), url: '/optimizare-debitare', icon: Scissors, color: 'text-teal-600' },
  ];

  const adminItems = [
    { title: t('nav.users'), url: '/admin/utilizatori', icon: Shield, color: 'text-red-500' },
    { title: t('nav.crmSubscribers'), url: '/admin/crm', icon: CreditCard, color: 'text-emerald-500' },
    { title: t('nav.announcements'), url: '/admin/anunturi', icon: Megaphone, color: 'text-blue-500' },
    { title: t('nav.catalogs'), url: '/admin/cataloage', icon: BookOpen, color: 'text-orange-500' },
    { title: t('nav.clientErrors'), url: '/admin/erori', icon: AlertTriangle, color: 'text-yellow-500' },
    { title: 'Analytics intern', url: '/admin/analytics', icon: BarChart3, color: 'text-cyan-500' },
  ];

  const isActive = (path: string) => location.pathname === path;



  const getRoleLabel = (r: string | null) => {
    switch (r) {
      case 'admin': return t('roles.admin');
      case 'production_manager': return t('roles.production_manager');
      case 'sales': return t('roles.sales');
      case 'operator': return t('roles.operator');
      default: return t('roles.user');
    }
  };

  const visibleAdminItems = isAdmin ? adminItems : [];

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <a href="/" className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0 cursor-pointer">
            <span className="text-lg font-bold text-primary-foreground">iG</span>
          </a>
          {!collapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">IsoftGlass</span>
                {isAdmin && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/50 text-primary">
                    <Shield className="h-2.5 w-2.5 mr-0.5" />
                    Admin
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{t('nav.erpSystem')}</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            {t('nav.main')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <item.icon className={`h-4 w-4 flex-shrink-0 ${item.color}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(isAdmin || hasCalculatorAccess) && (
        <SidebarGroup>
          <Collapsible open={calculatorOpen} onOpenChange={setCalculatorOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 cursor-pointer hover:text-foreground flex items-center justify-between w-full pr-2">
                <div className="flex items-center gap-2">
                  <Calculator className="h-3 w-3" />
                  {!collapsed && <span>{t('nav.calculators3D')}</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={`h-3 w-3 transition-transform ${calculatorOpen ? 'rotate-180' : ''}`} />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {calculatorItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent ml-2" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                          <item.icon className={`h-4 w-4 flex-shrink-0 ${item.color}`} />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
        )}

        {(isAdmin || hasOperationalAccess) && (
        <SidebarGroup>
          <Collapsible open={operationalOpen} onOpenChange={setOperationalOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 cursor-pointer hover:text-foreground flex items-center justify-between w-full pr-2">
                <span>{t('nav.operational')}</span>
                {!collapsed && (
                  <ChevronDown className={`h-3 w-3 transition-transform ${operationalOpen ? 'rotate-180' : ''}`} />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {operationalItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                          <item.icon className={`h-4 w-4 flex-shrink-0 ${item.color}`} />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
        )}

        {(isAdmin || hasOperationalAccess) && (
          <SidebarGroup>
            <Collapsible open={installationOpen} onOpenChange={setInstallationOpen}>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 cursor-pointer hover:text-foreground flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-3 w-3" />
                    {!collapsed && <span>{t('installation.title')}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown className={`h-3 w-3 transition-transform ${installationOpen ? 'rotate-180' : ''}`} />
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {installationItems.map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                            <item.icon className={`h-4 w-4 flex-shrink-0 ${item.color}`} />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {(isAdmin || hasProcessingAccess) && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              {t('nav.processing')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {processingItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                        <item.icon className={`h-4 w-4 flex-shrink-0 ${item.color}`} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {t('nav.administration')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleAdminItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                        <item.icon className={`h-4 w-4 flex-shrink-0 ${item.color}`} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-muted-foreground">{getRoleLabel(role)}</p>
                <span className="text-[10px] text-muted-foreground/60">v{APP_VERSION}</span>
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
