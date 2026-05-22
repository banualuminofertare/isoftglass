import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'update' | 'news' | 'feature' | 'general';
  is_pinned: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_read?: boolean;
  title_translations?: Record<string, string>;
  content_translations?: Record<string, string>;
}

function localize<T extends Announcement>(a: T, lang: string): T {
  // Source language is Romanian; for 'ro' (or unknown) keep originals.
  if (!lang || lang === 'ro') return a;
  const tt = (a.title_translations || {}) as Record<string, string>;
  const ct = (a.content_translations || {}) as Record<string, string>;
  return {
    ...a,
    title: tt[lang] || a.title,
    content: ct[lang] || a.content,
  };
}

export function useAnnouncements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'ro';

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements', user?.id, lang],
    queryFn: async () => {
      const { data: anns, error: annsError } = await supabase
        .from('admin_announcements')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (annsError) throw annsError;

      const { data: reads, error: readsError } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('user_id', user!.id);

      if (readsError) throw readsError;

      const readIds = new Set(reads?.map(r => r.announcement_id) || []);

      return (anns || []).map(a => {
        const base = {
          ...a,
          category: a.category as Announcement['category'],
          is_read: readIds.has(a.id),
          title_translations: (a as any).title_translations || {},
          content_translations: (a as any).content_translations || {},
        } as Announcement;
        return localize(base, lang);
      });
    },
    enabled: !!user,
    refetchInterval: 60000,
  });

  const unreadCount = announcements.filter(a => !a.is_read).length;

  const markAsRead = useMutation({
    mutationFn: async (announcementIds: string[]) => {
      if (!user || announcementIds.length === 0) return;
      const rows = announcementIds.map(id => ({
        user_id: user.id,
        announcement_id: id,
      }));
      const { error } = await supabase
        .from('announcement_reads')
        .upsert(rows, { onConflict: 'user_id,announcement_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const markAllAsRead = () => {
    const unreadIds = announcements.filter(a => !a.is_read).map(a => a.id);
    if (unreadIds.length > 0) markAsRead.mutate(unreadIds);
  };

  return { announcements, unreadCount, isLoading, markAsRead, markAllAsRead };
}

async function translateAndStore(id: string, title: string, content: string) {
  try {
    const { data, error } = await supabase.functions.invoke('translate-announcement', {
      body: { title, content },
    });
    if (error || !data?.title_translations) {
      console.error('Translation failed:', error || data);
      return false;
    }
    const { error: updErr } = await supabase
      .from('admin_announcements')
      .update({
        title_translations: data.title_translations,
        content_translations: data.content_translations,
      } as any)
      .eq('id', id);
    if (updErr) {
      console.error('Translation update failed:', updErr);
      return false;
    }
    return true;
  } catch (e) {
    console.error('translateAndStore error:', e);
    return false;
  }
}

export function useAdminAnnouncements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Announcement[];
    },
    enabled: !!user,
  });

  const createAnnouncement = useMutation({
    mutationFn: async (values: { title: string; content: string; category: string; is_pinned: boolean }) => {
      const { data: inserted, error } = await supabase
        .from('admin_announcements')
        .insert({
          title: values.title,
          content: values.content,
          category: values.category as any,
          is_pinned: values.is_pinned,
          created_by: user!.id,
        })
        .select('id')
        .single();
      if (error) throw error;
      // Fire-and-await translation so it appears immediately
      if (inserted?.id) {
        await translateAndStore(inserted.id, values.title, values.content);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('admin_announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const publishAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_announcements')
        .update({ is_published: true } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const updateAnnouncement = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const { error } = await supabase
        .from('admin_announcements')
        .update({
          title,
          content,
          // reset translations so new content gets re-translated
          title_translations: {},
          content_translations: {},
        } as any)
        .eq('id', id);
      if (error) throw error;
      await translateAndStore(id, title, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const translateAnnouncement = useMutation({
    mutationFn: async (a: Announcement) => {
      const ok = await translateAndStore(a.id, a.title, a.content);
      if (!ok) throw new Error('Traducerea a eșuat');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  return {
    announcements,
    isLoading,
    createAnnouncement,
    deleteAnnouncement,
    publishAnnouncement,
    updateAnnouncement,
    translateAnnouncement,
  };
}
