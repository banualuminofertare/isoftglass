import { AppLayout } from '@/components/layout/AppLayout';
import { ResizableContent } from '@/components/layout/ResizableContent';
import { useAdminAnnouncements } from '@/hooks/useAnnouncements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Megaphone, Pin, Send, Pencil, Check, X, Globe, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import i18next from 'i18next';
import { format } from 'date-fns';
import { getDateLocale } from '@/lib/dateLocale';
import { cn } from '@/lib/utils';

const categoryOptions = [
  { value: 'update', label: 'Update Software', color: 'bg-blue-100 text-blue-700' },
  { value: 'feature', label: 'Funcție Nouă', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'news', label: 'Noutăți', color: 'bg-amber-100 text-amber-700' },
  { value: 'general', label: 'General', color: 'bg-muted text-muted-foreground' },
];

export default function AdminAnnouncements() {
  const { announcements, isLoading, createAnnouncement, deleteAnnouncement, publishAnnouncement, updateAnnouncement, translateAnnouncement } = useAdminAnnouncements();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isPinned, setIsPinned] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error(i18next.t('toasts.announcements.titleContentRequired'));
      return;
    }
    try {
      await createAnnouncement.mutateAsync({ title: title.trim(), content: content.trim(), category, is_pinned: isPinned });
      toast.success(i18next.t('toasts.announcements.published'));
      setTitle('');
      setContent('');
      setCategory('general');
      setIsPinned(false);
    } catch {
      toast.error(i18next.t('toasts.announcements.publishError'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement.mutateAsync(id);
      toast.success(i18next.t('toasts.announcements.deleted'));
    } catch {
      toast.error(i18next.t('toasts.announcements.deleteError'));
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishAnnouncement.mutateAsync(id);
      toast.success(i18next.t('toasts.announcements.publishedAll'));
    } catch {
      toast.error(i18next.t('toasts.announcements.publishError'));
    }
  };

  const startEdit = (a: any) => {
    setEditingId(a.id);
    setEditTitle(a.title);
    setEditContent(a.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await updateAnnouncement.mutateAsync({ id: editingId, title: editTitle, content: editContent });
      toast.success(i18next.t('toasts.announcements.updated'));
      setEditingId(null);
    } catch {
      toast.error(i18next.t('toasts.announcements.updateError'));
    }
  };

  const handleTranslate = async (a: any) => {
    try {
      await translateAnnouncement.mutateAsync(a);
      toast.success('Anunț tradus în 8 limbi');
    } catch {
      toast.error('Traducerea a eșuat');
    }
  };

  const isTranslated = (a: any) =>
    a.title_translations && Object.keys(a.title_translations).length > 0;

  const drafts = announcements.filter(a => !(a as any).is_published);
  const published = announcements.filter(a => (a as any).is_published);

  return (
    <AppLayout>
      <ResizableContent>
        <div className="space-y-6 w-full pr-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Megaphone className="h-7 w-7 text-primary" />
              Anunțuri Platform
            </h1>
            <p className="text-muted-foreground">Publică mesaje vizibile tuturor utilizatorilor</p>
          </div>

          {/* Create form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Anunț Nou
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Titlu</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="ex: Versiune 2.5 lansată" />
                </div>
                <div>
                  <Label>Conținut</Label>
                  <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder={i18next.t("ui.placeholderDetailedDescription")} rows={4} />
                </div>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-1">
                    <Label>Categorie</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={isPinned} onCheckedChange={setIsPinned} id="pinned" />
                    <Label htmlFor="pinned" className="flex items-center gap-1">
                      <Pin className="h-3 w-3" /> Fixat sus
                    </Label>
                  </div>
                  <Button type="submit" disabled={createAnnouncement.isPending}>
                    {createAnnouncement.isPending ? 'Se publică...' : 'Publică anunț'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Drafts */}
          {drafts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Ciorne ({drafts.length})
                <Badge variant="outline" className="bg-amber-100 text-amber-700 text-[10px]">Nepublicate</Badge>
              </h2>
              {drafts.map(a => {
                const cat = categoryOptions.find(c => c.value === a.category);
                const isEditing = editingId === a.id;
                return (
                  <Card key={a.id} className="border-amber-300 border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="outline" className="bg-amber-100 text-amber-700 text-[10px]">Ciornă</Badge>
                            <Badge variant="outline" className={cn('text-[10px]', cat?.color)}>{cat?.label}</Badge>
                            {isTranslated(a) ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-[10px] gap-1">
                                <Globe className="h-2.5 w-2.5" /> 9 limbi
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">Doar RO</Badge>
                            )}
                            {a.is_pinned && <span className="text-xs">📌</span>}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(a.created_at), 'dd MMM yyyy, HH:mm', { locale: getDateLocale() })}
                            </span>
                          </div>
                          {isEditing ? (
                            <div className="space-y-2 mt-2">
                              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-sm" />
                              <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} className="text-xs" />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSaveEdit} disabled={updateAnnouncement.isPending}>
                                  <Check className="h-3 w-3 mr-1" /> Salvează
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                  <X className="h-3 w-3 mr-1" /> Anulează
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-medium text-sm">{a.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{a.content}</p>
                            </>
                          )}
                        </div>
                        {!isEditing && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(a)} title="Editează">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleTranslate(a)}
                              disabled={translateAnnouncement.isPending}
                              title={isTranslated(a) ? 'Re-traduce' : 'Traduce în 8 limbi'}
                            >
                              {translateAnnouncement.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Globe className="h-4 w-4 text-blue-600" />
                              )}
                            </Button>
                            <Button size="sm" className="gap-1" onClick={() => handlePublish(a.id)} disabled={publishAnnouncement.isPending}>
                              <Send className="h-3 w-3" /> Publică
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(a.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Published list */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Anunțuri ({published.length})</h2>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">{i18next.t('ui.loading')}</p>
            ) : published.length === 0 ? (
              <p className="text-muted-foreground text-sm">{i18next.t('ui.noAnnouncements')}</p>
            ) : (
              published.map(a => {
                const cat = categoryOptions.find(c => c.value === a.category);
                return (
                  <Card key={a.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="outline" className={cn('text-[10px]', cat?.color)}>
                              {cat?.label}
                            </Badge>
                            {isTranslated(a) && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-[10px] gap-1">
                                <Globe className="h-2.5 w-2.5" /> 9 limbi
                              </Badge>
                            )}
                            {a.is_pinned && <span className="text-xs">📌</span>}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(a.created_at), 'dd MMM yyyy, HH:mm', { locale: getDateLocale() })}
                            </span>
                          </div>
                          <h3 className="font-medium text-sm">{a.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{a.content}</p>
                        </div>
                        <div className="flex gap-1">
                          {!isTranslated(a) && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleTranslate(a)}
                              disabled={translateAnnouncement.isPending}
                              title="Traduce în 8 limbi"
                            >
                              {translateAnnouncement.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Globe className="h-4 w-4 text-blue-600" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(a.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </ResizableContent>
    </AppLayout>
  );
}
