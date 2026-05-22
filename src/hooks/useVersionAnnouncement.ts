import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { APP_VERSION, VERSION_DATE, VERSION_NOTES } from '@/config/version';

export function useVersionAnnouncement() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user || !isAdmin || hasRun.current) return;
    hasRun.current = true;

    const checkAndAnnounce = async () => {
      // Find the latest update announcement (including drafts)
      const { data } = await supabase
        .from('admin_announcements')
        .select('title')
        .eq('category', 'update')
        .order('created_at', { ascending: false })
        .limit(1);

      const lastTitle = data?.[0]?.title || '';
      const expectedTitle = `Versiunea ${APP_VERSION}`;

      if (lastTitle === expectedTitle) return;

      // Create new version announcement as draft
      await supabase.from('admin_announcements').insert({
        title: expectedTitle,
        content: `**${VERSION_DATE}**\n\n${VERSION_NOTES}`,
        category: 'update' as const,
        is_pinned: true,
        created_by: user.id,
        is_published: false,
      } as any);
    };

    checkAndAnnounce();
  }, [user, isAdmin]);
}
