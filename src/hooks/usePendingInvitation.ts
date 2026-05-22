import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import i18next from 'i18next';

interface PendingInvitation {
  id: string;
  company_id: string;
  company_name: string;
  role: string;
  has_calculator_access: boolean;
  has_operational_access: boolean;
  has_processing_access: boolean;
}

export function usePendingInvitation() {
  const { user, refetchProfile } = useAuth();
  const [invitation, setInvitation] = useState<PendingInvitation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    
    const fetchInvitation = async () => {
      const { data, error } = await supabase
        .from('company_invitations')
        .select('id, company_id, role, has_calculator_access, has_operational_access, has_processing_access')
        .eq('email', user.email!)
        .eq('status', 'pending')
        .limit(1)
        .maybeSingle();

      if (error || !data) return;

      // Get company name
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', data.company_id)
        .single();

      setInvitation({
        ...data,
        company_name: company?.name || 'Necunoscut',
      });
    };

    fetchInvitation();
  }, [user?.email]);

  const acceptInvitation = async () => {
    if (!invitation || !user) return;
    setLoading(true);
    try {
      // Update profile: set company_id and permissions
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          company_id: invitation.company_id,
          has_calculator_access: invitation.has_calculator_access,
          has_operational_access: invitation.has_operational_access,
          has_processing_access: invitation.has_processing_access,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: invitation.role as any })
        .eq('user_id', user.id);

      if (roleError) throw roleError;

      // Mark invitation as accepted
      const { error: invError } = await supabase
        .from('company_invitations')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', invitation.id);

      if (invError) throw invError;

      setInvitation(null);
      refetchProfile();
      toast({ title: i18next.t('toasts.invitationAccepted'), description: i18next.t('toasts.invitationAcceptedDesc', { team: invitation.company_name }) });
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      toast({ title: i18next.t('toasts.error'), description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const declineInvitation = async () => {
    if (!invitation) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('company_invitations')
        .update({ status: 'declined', responded_at: new Date().toISOString() })
        .eq('id', invitation.id);

      if (error) throw error;

      setInvitation(null);
      toast({ title: i18next.t('toasts.invitationDeclined') });
    } catch (err: any) {
      toast({ title: i18next.t('toasts.error'), description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return { invitation, loading, acceptInvitation, declineInvitation };
}
