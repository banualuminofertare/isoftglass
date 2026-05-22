import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSlidingMechanisms, type SlidingMechanism } from '@/hooks/useSlidingMechanisms';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Pencil, Trash2, SlidersHorizontal, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MechForm {
  name: string;
  code: string;
  door_height_deduction: number;
  fixed_panel_height_deduction: number;
  width_overlap: number;
  is_active: boolean;
}

const DEFAULT_FORM: MechForm = {
  name: '',
  code: '',
  door_height_deduction: 40,
  fixed_panel_height_deduction: 46,
  width_overlap: 40,
  is_active: true,
};

/**
 * Ensures a pricing_config entry exists for the given mechanism code.
 * Creates one in category 'accessories' if it doesn't exist yet.
 */
async function ensurePricingEntry(code: string, name: string, userId: string) {
  if (!code.trim()) return;
  
  // Check if code already exists in pricing_config (base or user)
  const { data: existing } = await supabase
    .from('pricing_config')
    .select('id')
    .eq('code', code)
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .limit(1);

  if (existing && existing.length > 0) return; // already exists

  // Create new entry
  const { error } = await supabase
    .from('pricing_config')
    .insert({
      category: 'accessories' as any,
      code,
      name: `Mecanism: ${name}`,
      description: 'Mecanism glisant - creat automat',
      unit: 'RON/buc',
      price: 0,
      is_multiplier: false,
      is_active: true,
      sort_order: 9000,
      user_id: userId,
    });

  if (error) {
    console.error('Error creating pricing entry for mechanism:', error);
  }
}

export function SlidingMechanismManager() {
  const { mechanisms, isLoading, addMechanism, updateMechanism, deleteMechanism } = useSlidingMechanisms();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MechForm>(DEFAULT_FORM);
  const [isAdding, setIsAdding] = useState(false);

  const startAdd = () => {
    setForm(DEFAULT_FORM);
    setIsAdding(true);
    setEditingId(null);
  };

  const startEdit = (m: SlidingMechanism) => {
    setForm({
      name: m.name,
      code: m.code || '',
      door_height_deduction: m.door_height_deduction,
      fixed_panel_height_deduction: m.fixed_panel_height_deduction,
      width_overlap: m.width_overlap,
      is_active: m.is_active,
    });
    setEditingId(m.id);
    setIsAdding(false);
  };

  const cancel = () => { setEditingId(null); setIsAdding(false); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error(t('toasts.mechanisms.nameRequired')); return; }
    let ok = false;
    if (isAdding) {
      ok = await addMechanism(form as any);
      if (ok) { setIsAdding(false); setForm(DEFAULT_FORM); }
    } else if (editingId) {
      ok = await updateMechanism(editingId, form);
      if (ok) { setEditingId(null); }
    }
    // Auto-create pricing_config entry for the code
    if (ok && form.code.trim() && user?.id) {
      await ensurePricingEntry(form.code.trim(), form.name.trim(), user.id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('ui.confirmDeleteMechanism'))) return;
    await deleteMechanism(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const renderForm = () => (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Cod produs</Label>
          <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder={t("ui.placeholderExampleCode")} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Nume mecanism</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t("ui.placeholderMechanismName")} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">{t('ui.doorHeightDeduction')}</Label>
          <Input type="number" value={form.door_height_deduction} onChange={e => setForm(f => ({ ...f, door_height_deduction: Number(e.target.value) }))} min={0} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Deducere H fix (mm)</Label>
          <Input type="number" value={form.fixed_panel_height_deduction} onChange={e => setForm(f => ({ ...f, fixed_panel_height_deduction: Number(e.target.value) }))} min={0} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Suprapunere W (mm)</Label>
          <Input type="number" value={form.width_overlap} onChange={e => setForm(f => ({ ...f, width_overlap: Number(e.target.value) }))} min={0} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
        <Label className="text-xs">Activ</Label>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>
          <Save className="h-3.5 w-3.5 mr-1" /> Salvează
        </Button>
        <Button size="sm" variant="outline" onClick={cancel}>
          <X className="h-3.5 w-3.5 mr-1" /> Anulează
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Mecanisme Glisante
        </CardTitle>
        <CardDescription>
          Definește mecanismele de glisare cu deducerile lor specifice de înălțime și suprapunere lățime.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mechanisms.map(m => (
          editingId === m.id ? (
            <div key={m.id}>{renderForm()}</div>
          ) : (
            <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{m.code ? `[${m.code}] ` : ''}{m.name}</span>
                  {!m.is_active && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">Inactiv</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  H ușă: -{m.door_height_deduction}mm · H fix: -{m.fixed_panel_height_deduction}mm · Suprapunere: {m.width_overlap}mm
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(m)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(m.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        ))}

        {isAdding && renderForm()}

        {!isAdding && !editingId && (
          <Button variant="outline" size="sm" onClick={startAdd}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Adaugă mecanism
          </Button>
        )}

        {mechanisms.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nu ai definit niciun mecanism. Adaugă primul mecanism pentru a configura deducerile de sticlă la sistemele glisante.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
