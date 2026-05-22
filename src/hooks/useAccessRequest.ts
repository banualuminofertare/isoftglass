import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AccessRequest {
  id: string;
  requester_id: string;
  target_user_id: string;
  status: string;
  created_at: string;
  responded_at: string | null;
}

export function useAccessRequest() {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';

  // Admin: request access to a user
  const requestAccess = useCallback(async (targetUserId: string) => {
    if (!user || !isAdmin) return null;

    // Cancel any existing pending requests from this admin to this user
    await supabase
      .from('admin_access_requests')
      .update({ status: 'rejected', responded_at: new Date().toISOString() })
      .eq('requester_id', user.id)
      .eq('target_user_id', targetUserId)
      .eq('status', 'pending');

    const { data, error } = await supabase
      .from('admin_access_requests')
      .insert({
        requester_id: user.id,
        target_user_id: targetUserId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data as AccessRequest;
  }, [user, isAdmin]);

  // Admin: watch for status change on a request
  const watchRequest = useCallback((requestId: string, onStatusChange: (status: string) => void) => {
    const channel = supabase
      .channel(`access-request-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_access_requests',
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          const newStatus = (payload.new as any).status;
          onStatusChange(newStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { requestAccess, watchRequest };
}

// Hook for subscribers to listen for incoming access requests
export function useIncomingAccessRequests() {
  const { user, role } = useAuth();
  const [pendingRequest, setPendingRequest] = useState<AccessRequest | null>(null);
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!user || isAdmin) return;

    // Check for existing pending requests
    const fetchPending = async () => {
      const { data } = await supabase
        .from('admin_access_requests')
        .select('*')
        .eq('target_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setPendingRequest(data[0] as AccessRequest);
      }
    };

    fetchPending();

    // Listen for new requests in realtime
    const channel = supabase
      .channel(`incoming-access-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_access_requests',
          filter: `target_user_id=eq.${user.id}`,
        },
        (payload) => {
          const req = payload.new as AccessRequest;
          if (req.status === 'pending') {
            setPendingRequest(req);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_access_requests',
          filter: `target_user_id=eq.${user.id}`,
        },
        (payload) => {
          const req = payload.new as AccessRequest;
          if (req.status !== 'pending') {
            setPendingRequest(prev => prev?.id === req.id ? null : prev);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  const respondToRequest = useCallback(async (requestId: string, accept: boolean) => {
    const { error } = await supabase
      .from('admin_access_requests')
      .update({
        status: accept ? 'accepted' : 'rejected',
        responded_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
    setPendingRequest(null);
  }, []);

  return { pendingRequest, respondToRequest };
}
