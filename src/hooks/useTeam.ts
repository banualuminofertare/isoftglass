import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import i18next from 'i18next';

export interface TeamMember {
  user_id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  company_name: string | null;
  has_calculator_access: boolean;
  has_operational_access: boolean;
  has_processing_access: boolean;
  is_approved: boolean;
  role: string;
  is_owner: boolean;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  has_calculator_access: boolean;
  has_operational_access: boolean;
  has_processing_access: boolean;
  status: string;
  created_at: string;
}

export function useTeam() {
  const { user, companyId, isCompanyOwner } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [company, setCompany] = useState<{ id: string; name: string; max_members: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch company info
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, max_members, owner_id')
        .eq('id', companyId)
        .single();

      if (companyData) {
        setCompany({ id: companyData.id, name: companyData.name, max_members: companyData.max_members });
      }

      // Fetch team members (profiles in same company)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone, company_name, has_calculator_access, has_operational_access, has_processing_access, is_approved')
        .eq('company_id', companyId);

      if (profiles) {
        // Fetch roles for all members
        const userIds = profiles.map(p => p.user_id);
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);

        const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));

        // Fetch emails via edge function (owner only)
        let emailMap: Record<string, string> = {};
        if (isCompanyOwner) {
          try {
            const { data: emailData } = await supabase.functions.invoke('get-team-emails');
            if (emailData?.emails) {
              emailMap = emailData.emails;
            }
          } catch (e) {
            console.error('Failed to fetch team emails:', e);
          }
        }

        const teamMembers: TeamMember[] = profiles.map(p => ({
          user_id: p.user_id,
          full_name: p.full_name,
          email: emailMap[p.user_id] || '',
          phone: p.phone,
          company_name: p.company_name,
          has_calculator_access: p.has_calculator_access,
          has_operational_access: p.has_operational_access,
          has_processing_access: p.has_processing_access,
          is_approved: p.is_approved,
          role: roleMap.get(p.user_id) || 'operator',
          is_owner: companyData?.owner_id === p.user_id,
        }));

        setMembers(teamMembers);
      }

      // Fetch pending invitations
      if (isCompanyOwner) {
        const { data: invites } = await supabase
          .from('company_invitations')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        setInvitations((invites || []) as TeamInvitation[]);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, isCompanyOwner]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const inviteMember = useCallback(async (params: {
    email: string;
    role: string;
    has_calculator_access: boolean;
    has_operational_access: boolean;
    has_processing_access: boolean;
  }) => {
    if (!companyId || !user) return false;

    // Check member limit (include pending invitations)
    const pendingCount = invitations.filter(i => i.status === 'pending').length;
    const totalSlots = members.length + pendingCount;
    if (totalSlots >= (company?.max_members || 5)) {
      toast.error(i18next.t('settings.team.memberLimitReached', { max: company?.max_members || 5, active: members.length, pending: pendingCount }));
      return false;
    }

    try {
      const { error } = await supabase
        .from('company_invitations')
        .insert({
          company_id: companyId,
          email: params.email,
          invited_by: user.id,
          role: params.role,
          has_calculator_access: params.has_calculator_access,
          has_operational_access: params.has_operational_access,
          has_processing_access: params.has_processing_access,
        } as any);

      if (error) throw error;

      toast.success(i18next.t('settings.team.invitationSent', { email: params.email }));
      await fetchTeam();
      return true;
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        toast.error(i18next.t('settings.team.emailAlreadyInvited'));
      } else {
        toast.error(i18next.t('settings.team.inviteError', { message: error.message }));
      }
      return false;
    }
  }, [companyId, user, members.length, invitations, company?.max_members, fetchTeam]);

  const cancelInvitation = useCallback(async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('company_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
      toast.success(i18next.t('settings.team.invitationCancelled'));
      await fetchTeam();
    } catch (error: any) {
      toast.error(i18next.t('settings.team.error', { message: error.message }));
    }
  }, [fetchTeam]);

  const updateMemberPermissions = useCallback(async (userId: string, permissions: {
    has_calculator_access?: boolean;
    has_operational_access?: boolean;
    has_processing_access?: boolean;
  }) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(permissions)
        .eq('user_id', userId);

      if (error) throw error;
      toast.success(i18next.t('settings.team.permissionsUpdated'));
      await fetchTeam();
    } catch (error: any) {
      toast.error(i18next.t('settings.team.error', { message: error.message }));
    }
  }, [fetchTeam]);

  const removeMember = useCallback(async (userId: string) => {
    try {
      // Remove company_id from profile (detach from company)
      const { error } = await supabase
        .from('profiles')
        .update({ company_id: null } as any)
        .eq('user_id', userId);

      if (error) throw error;
      toast.success(i18next.t('settings.team.memberRemoved'));
      await fetchTeam();
    } catch (error: any) {
      toast.error(i18next.t('settings.team.error', { message: error.message }));
    }
  }, [fetchTeam]);

  const createCompany = useCallback(async () => {
    if (!user) return false;
    try {
      // Fetch user's profile name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, company_name')
        .eq('user_id', user.id)
        .single();

      const companyName = profile?.company_name || profile?.full_name || 'Compania mea';

      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({ name: companyName, owner_id: user.id })
        .select('id')
        .single();

      if (companyError) throw companyError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ company_id: newCompany.id } as any)
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast.success(i18next.t('settings.team.teamCreated'));
      return true;
    } catch (error: any) {
      toast.error(i18next.t('settings.team.teamCreateError', { message: error.message }));
      return false;
    }
  }, [user]);

  return {
    members,
    invitations,
    company,
    isLoading,
    isCompanyOwner,
    inviteMember,
    cancelInvitation,
    updateMemberPermissions,
    removeMember,
    createCompany,
    refetch: fetchTeam,
  };
}
