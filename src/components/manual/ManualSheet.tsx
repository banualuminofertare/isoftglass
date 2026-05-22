import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ChevronLeft, ChevronRight, BookOpen, Maximize2, Minimize2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { getManualData, type ManualSection } from '@/content/manual';

interface ManualSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualSheet({ open, onOpenChange }: ManualSheetProps) {
  const { i18n, t } = useTranslation();
  const { role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('manual:expanded') === '1';
  });

  useEffect(() => {
    try { localStorage.setItem('manual:expanded', expanded ? '1' : '0'); } catch {}
  }, [expanded]);

  const { sections, categories } = useMemo(
    () => getManualData(i18n.language),
    [i18n.language]
  );

  const isAdmin = role === 'admin';

  const visibleSections = useMemo(() => {
    return sections
      .filter((s) => s.roles.includes('all') || (isAdmin && s.roles.includes('admin')) || s.roles.includes('subscriber'))
      .filter((s) => isAdmin || !s.roles.includes('admin') || s.roles.includes('all'))
      .sort((a, b) => a.order - b.order);
  }, [sections, isAdmin]);

  const filteredSections = useMemo(() => {
    if (!query.trim()) return visibleSections;
    const q = query.toLowerCase();
    return visibleSections.filter(
      (s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
    );
  }, [visibleSections, query]);

  // Deep-link via ?manual=section-id
  useEffect(() => {
    if (!open) return;
    const paramId = searchParams.get('manual');
    if (paramId && visibleSections.some((s) => s.id === paramId)) {
      setActiveId(paramId);
    } else if (!activeId && visibleSections.length > 0) {
      setActiveId(visibleSections[0].id);
    }
  }, [open, searchParams, visibleSections, activeId]);

  const handleSelect = (id: string) => {
    setActiveId(id);
    const next = new URLSearchParams(searchParams);
    next.set('manual', id);
    setSearchParams(next, { replace: true });
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      const params = new URLSearchParams(searchParams);
      if (params.has('manual')) {
        params.delete('manual');
        setSearchParams(params, { replace: true });
      }
    }
    onOpenChange(next);
  };

  const active = visibleSections.find((s) => s.id === activeId) ?? visibleSections[0];
  const activeIndex = active ? visibleSections.findIndex((s) => s.id === active.id) : -1;
  const prev = activeIndex > 0 ? visibleSections[activeIndex - 1] : null;
  const next = activeIndex >= 0 && activeIndex < visibleSections.length - 1 ? visibleSections[activeIndex + 1] : null;

  // Group by category for sidebar
  const grouped = useMemo(() => {
    const map = new Map<string, ManualSection[]>();
    for (const s of filteredSections) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return categories
      .filter((c) => map.has(c.id))
      .sort((a, b) => a.order - b.order)
      .map((c) => ({ category: c, items: map.get(c.id)! }));
  }, [filteredSections, categories]);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className={cn(
          'w-full p-0 flex flex-col transition-[max-width] duration-300',
          expanded
            ? 'sm:max-w-[100vw] md:max-w-[95vw] lg:max-w-[1200px]'
            : 'sm:max-w-[720px]'
        )}
      >
        <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
          <SheetTitle className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <BookOpen className="h-5 w-5" />
            <span className="flex-1">{t('manual.title', { defaultValue: 'Manual de utilizare' })}</span>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded((v) => !v)}
                    className="hidden md:inline-flex h-8 w-8 p-0 mr-6 text-muted-foreground hover:text-teal-600"
                    aria-label={expanded ? t('manual.collapse', { defaultValue: 'Restabilește' }) : t('manual.expand', { defaultValue: 'Maximizează' })}
                  >
                    {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {expanded ? t('manual.collapse', { defaultValue: 'Restabilește' }) : t('manual.expand', { defaultValue: 'Maximizează' })}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SheetTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('manual.search', { defaultValue: 'Caută în manual...' })}
              className="pl-8 h-9"
            />
          </div>
        </SheetHeader>

        <div className="flex-1 flex min-h-0">
          <aside className="w-56 border-r border-border shrink-0 hidden md:block">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-3">
                {grouped.length === 0 && (
                  <p className="text-xs text-muted-foreground p-2">
                    {t('manual.noResults', { defaultValue: 'Nimic găsit' })}
                  </p>
                )}
                {grouped.map(({ category, items }) => (
                  <div key={category.id}>
                    <h4 className="text-[11px] uppercase tracking-wide text-teal-600 dark:text-teal-400 font-semibold px-2 mb-1">
                      {category.label}
                    </h4>
                    <ul className="space-y-0.5">
                      {items.map((s) => {
                        const isGreen = s.accent === 'green';
                        return (
                          <li key={s.id}>
                            <button
                              onClick={() => handleSelect(s.id)}
                              className={cn(
                                'w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors flex items-center gap-2',
                                active?.id === s.id
                                  ? isGreen
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium'
                                    : 'bg-teal-500/10 text-teal-700 dark:text-teal-300 font-medium'
                                  : isGreen
                                    ? 'hover:bg-muted text-emerald-700 dark:text-emerald-400 font-medium'
                                    : 'hover:bg-muted text-foreground/80'
                              )}
                            >
                              {isGreen && <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                              <span className="flex-1">{s.title}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </aside>

          <div className="flex-1 flex flex-col min-w-0">
            <ScrollArea className="flex-1">
              <div className="p-5 prose prose-sm dark:prose-invert max-w-none prose-headings:scroll-m-20 prose-h1:text-2xl prose-h1:font-bold prose-h2:text-lg prose-a:text-teal-600">
                {active ? (
                  <>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{active.content}</ReactMarkdown>
                    {active.image && (
                      <figure className="not-prose my-4 rounded-lg overflow-hidden border border-teal-500/30 shadow-md bg-muted/30">
                        <img
                          src={active.image}
                          alt={active.imageAlt ?? active.title}
                          loading="lazy"
                          className="w-full h-auto block"
                          onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                        />
                      </figure>
                    )}
                    {active.tips && active.tips.length > 0 && (
                      <div className="not-prose my-4 rounded-md border border-teal-500/40 bg-teal-500/5 p-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400 mb-2">
                          {t('manual.tips', { defaultValue: 'Sfaturi' })}
                        </div>
                        <ul className="space-y-1 text-sm text-foreground/90 list-disc pl-5">
                          {active.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}
                    {active.warnings && active.warnings.length > 0 && (
                      <div className="not-prose my-4 rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-2">
                          {t('manual.warnings', { defaultValue: 'Atenție' })}
                        </div>
                        <ul className="space-y-1 text-sm text-foreground/90 list-disc pl-5">
                          {active.warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    {t('manual.empty', { defaultValue: 'Selectează o secțiune din meniul lateral.' })}
                  </p>
                )}
              </div>
            </ScrollArea>

            {active && (
              <div className="border-t border-border p-3 flex items-center justify-between gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!prev}
                  onClick={() => prev && handleSelect(prev.id)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {prev?.title ?? t('common.previous', { defaultValue: 'Anterior' })}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!next}
                  onClick={() => next && handleSelect(next.id)}
                >
                  {next?.title ?? t('common.next', { defaultValue: 'Următor' })}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
