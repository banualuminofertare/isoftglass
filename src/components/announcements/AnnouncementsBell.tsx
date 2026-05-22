import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { useAnnouncements, Announcement } from '@/hooks/useAnnouncements';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const categoryConfig: Record<Announcement['category'], { label: string; className: string }> = {
  update: { label: 'Update', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  feature: { label: 'Funcție nouă', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  news: { label: 'Noutăți', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  general: { label: 'General', className: 'bg-muted text-muted-foreground' },
};

export function AnnouncementsBell() {
  const { announcements, unreadCount, markAllAsRead } = useAnnouncements();
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const locale = i18n.language === 'ro' ? ro : enUS;

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-amber-50 dark:hover:bg-amber-950/40">
          <Bell className="h-4 w-4 text-amber-500 hover:text-amber-600 dark:text-amber-400" fill="currentColor" fillOpacity={0.15} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm">{t('ui.announcements')}</h4>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {announcements.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              Niciun anunț momentan
            </div>
          ) : (
            <div className="divide-y divide-border">
              {announcements.map((a) => {
                const cat = categoryConfig[a.category];
                return (
                  <div
                    key={a.id}
                    className={cn(
                      'p-3 hover:bg-muted/50 transition-colors cursor-pointer',
                      !a.is_read && 'bg-primary/5'
                    )}
                    onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', cat.className)}>
                        {cat.label}
                      </span>
                      {a.is_pinned && (
                        <span className="text-[10px] text-muted-foreground">📌</span>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale })}
                      </span>
                    </div>
                    <h5 className="text-sm font-medium text-foreground">{a.title}</h5>
                    <p className={cn('text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap', expandedId !== a.id && 'line-clamp-2')}>{a.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
