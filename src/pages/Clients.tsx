import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Plus, Search, Building2, User, Truck, Phone, Mail, MapPin, Percent, Edit, Trash2 } from 'lucide-react';
import { useClients, type Client, type ClientType } from '@/hooks/useClients';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function Clients() {
  const { t } = useTranslation();
  const { clients, isLoading, createClient, updateClient, deleteClient } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ClientType | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const CLIENT_TYPE_LABELS: Record<ClientType, { label: string; icon: typeof User }> = {
    person: { label: t('clients.person'), icon: User },
    company: { label: t('clients.company'), icon: Building2 },
    distributor: { label: t('clients.distributor'), icon: Truck },
  };

  const [formData, setFormData] = useState({
    client_type: 'person' as ClientType, name: '', company_name: '', cui: '', reg_com: '',
    email: '', phone: '', address: '', city: '', county: '', postal_code: '', country_code: 'RO',
    vat_id: '', codice_destinatario: '', discount_percent: 0, notes: '',
  });
  const [lookingUpClientCui, setLookingUpClientCui] = useState(false);

  const handleClientAnafLookup = async () => {
    if (!formData.cui) return;
    setLookingUpClientCui(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { toast } = await import('sonner');
      const { data, error } = await supabase.functions.invoke('validate-anaf-vat', { body: { cui: formData.cui } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setFormData(prev => ({
        ...prev,
        company_name: prev.company_name || data.name || '',
        address: prev.address || data.address || '',
        city: prev.city || data.city || '',
        county: prev.county || data.county || '',
        postal_code: prev.postal_code || data.postal_code || '',
        reg_com: prev.reg_com || data.reg_com || '',
        country_code: 'RO',
        vat_id: prev.vat_id || data.vat_id || ('RO' + String(formData.cui).replace(/^RO/i, '').replace(/\D/g, '')),
      }));
      toast.success('Date completate de la ANAF');
    } catch (e: any) {
      const { toast } = await import('sonner');
      toast.error(e.message || 'Nu am găsit CUI-ul la ANAF');
    } finally {
      setLookingUpClientCui(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) || client.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) || client.email?.toLowerCase().includes(searchQuery.toLowerCase()) || client.phone?.includes(searchQuery);
    const matchesType = typeFilter === 'all' || client.client_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) { await updateClient.mutateAsync({ id: editingClient.id, ...formData }); }
    else { await createClient.mutateAsync(formData); }
    setIsDialogOpen(false); resetForm();
  };

  const resetForm = () => {
    setFormData({ client_type: 'person', name: '', company_name: '', cui: '', reg_com: '', email: '', phone: '', address: '', city: '', county: '', postal_code: '', country_code: 'RO', vat_id: '', codice_destinatario: '', discount_percent: 0, notes: '' });
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({ client_type: client.client_type, name: client.name, company_name: client.company_name || '', cui: client.cui || '', reg_com: client.reg_com || '', email: client.email || '', phone: client.phone || '', address: client.address || '', city: client.city || '', county: client.county || '', postal_code: (client as any).postal_code || '', country_code: (client as any).country_code || 'RO', vat_id: (client as any).vat_id || '', codice_destinatario: (client as any).codice_destinatario || '', discount_percent: client.discount_percent || 0, notes: client.notes || '' });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('clients.deleteConfirm'))) { await deleteClient.mutateAsync(id); }
  };

  return (
    <AppLayout title={t('clients.title')}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('clients.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ClientType | 'all')}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('clients.clientType')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('clients.allClients')}</SelectItem>
                <SelectItem value="person">{t('clients.persons')}</SelectItem>
                <SelectItem value="company">{t('clients.companies')}</SelectItem>
                <SelectItem value="distributor">{t('clients.distributors')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />{t('clients.newClient')}</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingClient ? t('clients.editClient') : t('clients.newClient')}</DialogTitle>
                <DialogDescription className="sr-only">Completează detaliile clientului</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {(['person', 'company', 'distributor'] as ClientType[]).map((type) => {
                    const { label, icon: Icon } = CLIENT_TYPE_LABELS[type];
                    return (<Button key={type} type="button" variant={formData.client_type === type ? 'default' : 'outline'} onClick={() => setFormData(prev => ({ ...prev, client_type: type }))} className="h-auto py-3 flex-col gap-1"><Icon className="h-5 w-5" /><span className="text-xs">{label}</span></Button>);
                  })}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>{t('clients.nameRequired')}</Label><Input required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder={formData.client_type === 'person' ? t('clients.namePlaceholderPerson') : t('clients.namePlaceholderCompany')} /></div>
                  {formData.client_type !== 'person' && (<>
                    <div className="space-y-2"><Label>{t('clients.tradeName')}</Label><Input value={formData.company_name} onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))} /></div>
                    <div className="space-y-2">
                      <Label>{t('clients.cui')}</Label>
                      <div className="flex gap-2">
                        <Input value={formData.cui} onChange={(e) => setFormData(prev => ({ ...prev, cui: e.target.value }))} />
                        {formData.country_code === 'RO' && (
                          <Button type="button" variant="outline" size="sm" onClick={handleClientAnafLookup} disabled={lookingUpClientCui || !formData.cui}>ANAF</Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2"><Label>{t('clients.regCom')}</Label><Input value={formData.reg_com} onChange={(e) => setFormData(prev => ({ ...prev, reg_com: e.target.value }))} /></div>
                    <div className="space-y-2">
                      <Label>Țară</Label>
                      <Select value={formData.country_code} onValueChange={(v) => setFormData(prev => ({ ...prev, country_code: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RO">România</SelectItem>
                          <SelectItem value="IT">Italia</SelectItem>
                          <SelectItem value="DE">Germania</SelectItem>
                          <SelectItem value="FR">Franța</SelectItem>
                          <SelectItem value="PL">Polonia</SelectItem>
                          <SelectItem value="ES">Spania</SelectItem>
                          <SelectItem value="AT">Austria</SelectItem>
                          <SelectItem value="HU">Ungaria</SelectItem>
                          <SelectItem value="BG">Bulgaria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>VAT ID (cu prefix)</Label><Input value={formData.vat_id} onChange={(e) => setFormData(prev => ({ ...prev, vat_id: e.target.value }))} placeholder="RO12345678" /></div>
                    {formData.country_code === 'IT' && (
                      <div className="space-y-2"><Label>Codice Destinatario (SDI)</Label><Input value={formData.codice_destinatario} onChange={(e) => setFormData(prev => ({ ...prev, codice_destinatario: e.target.value }))} placeholder="0000000" /></div>
                    )}
                  </>)}
                  <div className="space-y-2"><Label>{t('common.email')}</Label><Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>{t('common.phone')}</Label><Input value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} /></div>
                  <div className="space-y-2 col-span-2"><Label>{t('common.address')}</Label><Input value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>{t('clients.city')}</Label><Input value={formData.city} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>{t('clients.county')}</Label><Input value={formData.county} onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Cod poștal</Label><Input value={formData.postal_code} onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>{t('clients.discountPercent')}</Label><Input type="number" min="0" max="100" value={formData.discount_percent} onChange={(e) => setFormData(prev => ({ ...prev, discount_percent: Number(e.target.value) }))} /></div>
                </div>
                <div className="space-y-2"><Label>{t('common.notes')}</Label><Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={3} /></div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>{t('common.cancel')}</Button>
                  <Button type="submit" disabled={createClient.isPending || updateClient.isPending}>{editingClient ? t('common.save') : t('clients.createClient')}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className={cn("border-2 border-blue-500 cursor-pointer transition-all", typeFilter === 'all' && "ring-2 ring-blue-500 ring-offset-2 shadow-lg scale-[1.02]")} onClick={() => setTypeFilter('all')}>
            <CardContent className="pt-4"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-bold">{clients.length}</p><p className="text-xs text-muted-foreground">{t('clients.totalClients')}</p></div></div></CardContent>
          </Card>
          <Card className={cn("border-2 border-blue-500 cursor-pointer transition-all", typeFilter === 'person' && "ring-2 ring-blue-500 ring-offset-2 shadow-lg scale-[1.02]")} onClick={() => setTypeFilter(typeFilter === 'person' ? 'all' : 'person')}>
            <CardContent className="pt-4"><div className="flex items-center gap-2"><User className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-bold">{clients.filter(c => c.client_type === 'person').length}</p><p className="text-xs text-muted-foreground">{t('clients.persons')}</p></div></div></CardContent>
          </Card>
          <Card className={cn("border-2 border-green-500 cursor-pointer transition-all", typeFilter === 'company' && "ring-2 ring-green-500 ring-offset-2 shadow-lg scale-[1.02]")} onClick={() => setTypeFilter(typeFilter === 'company' ? 'all' : 'company')}>
            <CardContent className="pt-4"><div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-bold">{clients.filter(c => c.client_type === 'company').length}</p><p className="text-xs text-muted-foreground">{t('clients.companies')}</p></div></div></CardContent>
          </Card>
          <Card className={cn("border-2 border-orange-500 cursor-pointer transition-all", typeFilter === 'distributor' && "ring-2 ring-orange-500 ring-offset-2 shadow-lg scale-[1.02]")} onClick={() => setTypeFilter(typeFilter === 'distributor' ? 'all' : 'distributor')}>
            <CardContent className="pt-4"><div className="flex items-center gap-2"><Truck className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-bold">{clients.filter(c => c.client_type === 'distributor').length}</p><p className="text-xs text-muted-foreground">{t('clients.distributors')}</p></div></div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>{t('clients.clientList')}</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{clients.length === 0 ? t('clients.noClientsYet') : t('common.noResults')}</div>
            ) : (
              <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">{t('common.type')}</TableHead>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('clients.contact')}</TableHead>
                    <TableHead className="hidden lg:table-cell">{t('common.location')}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('common.discount')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
                    const { label, icon: Icon } = CLIENT_TYPE_LABELS[client.client_type];
                    return (
                      <TableRow key={client.id}>
                        <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="gap-1"><Icon className="h-3 w-3" />{label}</Badge></TableCell>
                        <TableCell><div><p className="font-medium">{client.name}</p>{client.company_name && <p className="text-sm text-muted-foreground">{client.company_name}</p>}{client.cui && <p className="text-xs text-muted-foreground">CUI: {client.cui}</p>}<p className="text-xs text-muted-foreground sm:hidden">{client.phone}</p></div></TableCell>
                        <TableCell className="hidden md:table-cell"><div className="space-y-1">{client.phone && <div className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3" />{client.phone}</div>}{client.email && <div className="flex items-center gap-1 text-sm text-muted-foreground"><Mail className="h-3 w-3" />{client.email}</div>}</div></TableCell>
                        <TableCell className="hidden lg:table-cell">{(client.city || client.county) && <div className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3" />{[client.city, client.county].filter(Boolean).join(', ')}</div>}</TableCell>
                        <TableCell className="hidden sm:table-cell">{client.discount_percent ? <Badge variant="secondary" className="gap-1"><Percent className="h-3 w-3" />{client.discount_percent}%</Badge> : '-'}</TableCell>
                        <TableCell className="text-right"><div className="flex gap-1 justify-end"><Button variant="ghost" size="icon" onClick={() => handleEdit(client)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
