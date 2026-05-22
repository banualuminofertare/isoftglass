import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, GlassWater } from 'lucide-react';

interface GlassSheet {
  id: string;
  name: string;
  width: number;
  height: number;
  is_active: boolean;
}

const DEFAULT_SHEETS = [
  { name: 'Standard 2550×3210', width: 2550, height: 3210 },
  { name: 'Standard 2250×3210', width: 2250, height: 3210 },
  { name: 'Jumbo 6000×3210', width: 6000, height: 3210 },
];

export function GlassSheetSettings() {
  const { t } = useTranslation();
  const { user, companyId } = useAuth();
  const [sheets, setSheets] = useState<GlassSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSheet, setNewSheet] = useState({ name: '', width: 0, height: 0 });

  useEffect(() => { loadSheets(); }, []);

  const loadSheets = async () => {
    const { data, error } = await supabase
      .from('glass_sheets')
      .select('*')
      .order('created_at');

    if (error) { toast.error(t('glassSheets.loadError')); return; }

    if (!data || data.length === 0) {
      await seedDefaults();
    } else {
      setSheets(data as GlassSheet[]);
    }
    setLoading(false);
  };

  const seedDefaults = async () => {
    if (!user) return;
    const inserts = DEFAULT_SHEETS.map(s => ({
      ...s,
      user_id: user.id,
      company_id: companyId || null,
    }));

    const { data, error } = await supabase
      .from('glass_sheets')
      .insert(inserts as any)
      .select();

    if (error) { console.error(error); return; }
    setSheets((data || []) as GlassSheet[]);
  };

  const handleAdd = async () => {
    if (!newSheet.name || !newSheet.width || !newSheet.height || !user) {
      toast.error(t('glassSheets.fillAllFields'));
      return;
    }

    const { data, error } = await supabase
      .from('glass_sheets')
      .insert({
        name: newSheet.name,
        width: newSheet.width,
        height: newSheet.height,
        user_id: user.id,
        company_id: companyId || null,
      } as any)
      .select()
      .single();

    if (error) { toast.error(t('glassSheets.addError')); return; }
    setSheets(prev => [...prev, data as GlassSheet]);
    setNewSheet({ name: '', width: 0, height: 0 });
    toast.success(t('glassSheets.added'));
  };

  const handleToggle = async (id: string, active: boolean) => {
    await supabase.from('glass_sheets').update({ is_active: active } as any).eq('id', id);
    setSheets(prev => prev.map(s => s.id === id ? { ...s, is_active: active } : s));
  };

  const handleDelete = async (id: string) => {
    await supabase.from('glass_sheets').delete().eq('id', id);
    setSheets(prev => prev.filter(s => s.id !== id));
    toast.success(t('glassSheets.deleted'));
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GlassWater className="h-5 w-5" />
          {t('glassSheets.title')}
        </CardTitle>
        <CardDescription>
          {t('glassSheets.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing sheets */}
        <div className="space-y-2">
          {sheets.map(sheet => (
            <div key={sheet.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
              <Switch checked={sheet.is_active} onCheckedChange={(v) => handleToggle(sheet.id, v)} />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm">{sheet.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {sheet.width} × {sheet.height} mm
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(sheet.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new */}
        <div className="flex items-end gap-3 pt-2 border-t">
          <div className="space-y-1 flex-1">
            <Label className="text-xs">{t('glassSheets.name')}</Label>
            <Input placeholder={t('glassSheets.namePlaceholder')} value={newSheet.name}
              onChange={e => setNewSheet(p => ({ ...p, name: e.target.value }))} className="h-9" />
          </div>
          <div className="space-y-1 w-24">
            <Label className="text-xs">{t('glassSheets.widthMm')}</Label>
            <Input type="number" value={newSheet.width || ''} onChange={e => setNewSheet(p => ({ ...p, width: Number(e.target.value) }))} className="h-9" />
          </div>
          <div className="space-y-1 w-24">
            <Label className="text-xs">{t('glassSheets.heightMm')}</Label>
            <Input type="number" value={newSheet.height || ''} onChange={e => setNewSheet(p => ({ ...p, height: Number(e.target.value) }))} className="h-9" />
          </div>
          <Button size="sm" onClick={handleAdd} className="h-9">
            <Plus className="h-4 w-4 mr-1" /> {t('glassSheets.add')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
