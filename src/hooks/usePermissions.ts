import { useAuth } from './useAuth';

type Permission = 
  | 'view_dashboard'
  | 'view_calculators'
  | 'view_orders'
  | 'view_production'
  | 'view_inventory'
  | 'view_clients'
  | 'view_reports'
  | 'view_settings'
  | 'view_installation'
  | 'manage_users'
  | 'full_access';

const rolePermissions: Record<string, Permission[]> = {
  admin: ['full_access'],
  production_manager: [
    'view_dashboard',
    'view_calculators',
    'view_orders',
    'view_production',
    'view_inventory',
    'view_installation',
  ],
  sales: [
    'view_dashboard',
    'view_calculators',
    'view_orders',
    'view_production',
    'view_inventory',
    'view_installation',
  ],
  operator: [
    'view_dashboard',
    'view_calculators',
    'view_orders',
    'view_production',
    'view_inventory',
    'view_installation',
  ],
};

export function usePermissions() {
  const { role } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!role) return false;
    
    const permissions = rolePermissions[role] || [];
    
    // Admin has full access
    if (permissions.includes('full_access')) return true;
    
    return permissions.includes(permission);
  };

  const isAdmin = role === 'admin';

  const canAccess = (route: string): boolean => {
    if (isAdmin) return true;

    const routePermissionMap: Record<string, Permission> = {
      '/': 'view_dashboard',
      '/calculator': 'view_calculators',
      '/comenzi': 'view_orders',
      '/productie': 'view_production',
      '/inventar': 'view_inventory',
      '/clienti': 'view_clients',
      '/rapoarte': 'view_reports',
      '/setari': 'view_settings',
    };

    // Check exact match first
    if (routePermissionMap[route]) {
      return hasPermission(routePermissionMap[route]);
    }

    // Check prefix match for calculator routes
    if (route.startsWith('/calculator')) {
      return hasPermission('view_calculators');
    }

    return false;
  };

  return {
    hasPermission,
    isAdmin,
    canAccess,
    role,
  };
}
