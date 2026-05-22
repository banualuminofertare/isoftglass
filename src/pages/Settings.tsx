import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/settings/RichTextEditor';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Building2, Save, Loader2, DollarSign, Upload, X, Image, Users, Lock, Database, Receipt } from 'lucide-react';
import { InvoiceSeriesManager } from '@/components/invoicing/InvoiceSeriesManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PricingManager } from '@/components/settings/PricingManager';
import { ClientTypePricingManager } from '@/components/settings/ClientTypePricingManager';
import { useQuoteSettings } from '@/hooks/useTVA';

import { TeamManager } from '@/components/settings/TeamManager';
import { DataExportSection } from '@/components/settings/DataExportSection';

interface CompanySettings {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  cui: string;
  bank_account: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  presentation_text: string;
  quote_footer_text: string;
  pdf_logo_size: 'small' | 'medium' | 'large' | 'xlarge';
  pdf_logo_position: 'left' | 'center' | 'right';
  // e-Factura fields
  country_code: string;
  vat_id: string;
  caen_code: string;
  iban: string;
  bic: string;
  trade_register: string;
  share_capital: string;
  city: string;
  county: string;
  postal_code: string;
  codice_fiscale: string;
  regime_fiscale: string;
  leitweg_id: string;
  siret: string;
  peppol_id: string;
}

function QuoteSettingsCard() {
  const { t } = useTranslation();
  const { tvaPercent, euroRate, preferredCurrency, saveSettings, isSaving: isSavingQuote } = useQuoteSettings();
  const [localTva, setLocalTva] = useState(tvaPercent);
  const [localEuro, setLocalEuro] = useState(euroRate);

  useEffect(() => {
    setLocalTva(tvaPercent);
    setLocalEuro(euroRate);
  }, [tvaPercent, euroRate]);

  const handleSaveQuoteSettings = async () => {
    try {
      await saveSettings({ tvaPercent: localTva, euroRate: localEuro, preferredCurrency });
      toast.success(t('settings.quoteSaved'));
    } catch {
      toast.error(t('settings.quoteSaveError'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          {t('settings.quoteSettings')}
        </CardTitle>
        <CardDescription>
          {t('settings.quoteSettingsDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-6 flex-wrap">
          <div className="space-y-2">
            <Label htmlFor="tva_percent">{t('settings.tvaPercent')}</Label>
            <Input
              id="tva_percent"
              type="number"
              min={0}
              max={100}
              step={1}
              value={localTva}
              onChange={(e) => setLocalTva(Number(e.target.value))}
              className="w-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="euro_rate">{t('settings.euroRate')}</Label>
            <Input
              id="euro_rate"
              type="number"
              min={0}
              step={0.01}
              value={localEuro}
              onChange={(e) => setLocalEuro(Number(e.target.value))}
              className="w-[120px]"
            />
          </div>
          <Button onClick={handleSaveQuoteSettings} disabled={isSavingQuote} size="sm">
            {isSavingQuote ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            {t('settings.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const { t } = useTranslation();
  const { role, isCompanyOwner, hasTeamAccess, companyId, user } = useAuth();
  const isAdmin = role === 'admin';
  const showTeamTab = isAdmin || isCompanyOwner || hasTeamAccess;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPricingUnlocked, setIsPricingUnlocked] = useState(isAdmin);
  const [accessCode, setAccessCode] = useState('');

  // Subscriber logo state (stored in companies table)
  const [subscriberLogoUrl, setSubscriberLogoUrl] = useState<string>('');

  useEffect(() => {
    if (isAdmin) setIsPricingUnlocked(true);
  }, [isAdmin]);
  const [settings, setSettings] = useState<CompanySettings>({
    name: 'IsoftGlass',
    address: '',
    phone: '',
    email: '',
    cui: '',
    bank_account: '',
    logo_url: '',
    primary_color: '#0F172A',
    secondary_color: '#3B82F6',
    presentation_text: '',
    quote_footer_text: '',
    pdf_logo_size: 'medium',
    pdf_logo_position: 'left',
    country_code: 'RO',
    vat_id: '',
    caen_code: '',
    iban: '',
    bic: '',
    trade_register: '',
    share_capital: '',
    city: '',
    county: '',
    postal_code: '',
    codice_fiscale: '',
    regime_fiscale: '',
    leitweg_id: '',
    siret: '',
    peppol_id: '',
  });
  const [lookingUpCui, setLookingUpCui] = useState(false);

  const handleAnafLookup = async () => {
    if (!settings.cui && !settings.vat_id) {
      toast.error('Introdu mai întâi CUI-ul');
      return;
    }
    setLookingUpCui(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-anaf-vat', {
        body: { cui: settings.cui || settings.vat_id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setSettings(prev => ({
        ...prev,
        name: prev.name || data.name || '',
        address: prev.address || data.address || '',
        city: prev.city || data.city || '',
        county: prev.county || data.county || '',
        postal_code: prev.postal_code || data.postal_code || '',
        trade_register: prev.trade_register || data.reg_com || '',
        country_code: 'RO',
        vat_id: data.vat_id || prev.vat_id || ('RO' + String(settings.cui).replace(/^RO/i, '').replace(/\D/g, '')),
      }));
      toast.success('Date completate de la ANAF');
    } catch (e: any) {
      toast.error(e.message || 'Nu am găsit CUI-ul la ANAF');
    } finally {
      setLookingUpCui(false);
    }
  };


  const handleUnlock = () => {
    if (accessCode === 'Admin1234') {
      setIsPricingUnlocked(true);
      toast.success(t('settings.accessUnlocked'));
    } else {
      toast.error(t('settings.accessCodeWrong'));
    }
  };

  // Load subscriber logo from companies table
  useEffect(() => {
    if (!isAdmin && companyId) {
      supabase.from('companies').select('logo_url').eq('id', companyId).maybeSingle()
        .then(({ data }) => {
          if (data?.logo_url) setSubscriberLogoUrl(data.logo_url as string);
        });
    }
  }, [isAdmin, companyId]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('settings.invalidFormat'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('settings.logoTooLarge'));
      return;
    }

    setIsUploadingLogo(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${ext}`;
      const currentLogoUrl = isAdmin ? settings.logo_url : subscriberLogoUrl;

      // Delete old logo if exists
      if (currentLogoUrl) {
        const oldPath = currentLogoUrl.split('/company-logos/')[1];
        if (oldPath) {
          await supabase.storage.from('company-logos').remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      if (isAdmin) {
        // Save immediately to company_settings for admin
        if (settings.id) {
          const { error } = await supabase
            .from('company_settings')
            .update({ logo_url: urlData.publicUrl } as any)
            .eq('id', settings.id);
          if (error) throw error;
        }
        setSettings(prev => ({ ...prev, logo_url: urlData.publicUrl }));
      } else if (companyId) {
        // Save directly to companies table for subscribers
        const { error } = await supabase
          .from('companies')
          .update({ logo_url: urlData.publicUrl } as any)
          .eq('id', companyId);
        if (error) throw error;
        setSubscriberLogoUrl(urlData.publicUrl);
      }
      toast.success(t('settings.logoUploaded'));
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(t('settings.logoUploadError'));
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    const currentLogoUrl = isAdmin ? settings.logo_url : subscriberLogoUrl;
    if (currentLogoUrl) {
      const oldPath = currentLogoUrl.split('/company-logos/')[1];
      if (oldPath) {
        await supabase.storage.from('company-logos').remove([oldPath]);
      }
    }
    if (isAdmin) {
      if (settings.id) {
        await supabase.from('company_settings').update({ logo_url: '' } as any).eq('id', settings.id);
      }
      setSettings(prev => ({ ...prev, logo_url: '' }));
    } else if (companyId) {
      await supabase.from('companies').update({ logo_url: null } as any).eq('id', companyId);
      setSubscriberLogoUrl('');
    }
    toast.success(t('settings.logoRemoved'));
  };

  useEffect(() => {
    loadSettings();
  }, [companyId, isAdmin]);

  const loadSettings = async () => {
    if (!isAdmin && !companyId) return;
    try {
      if (!isAdmin && companyId) {
        // Subscriber: load from companies table
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings(prev => ({
            ...prev,
            id: data.id,
            name: (data as any).name || '',
            address: (data as any).address || '',
            phone: (data as any).phone || '',
            email: (data as any).email || '',
            cui: (data as any).cui || '',
            bank_account: (data as any).bank_account || '',
            logo_url: (data as any).logo_url || '',
            primary_color: (data as any).primary_color || '#0F172A',
            secondary_color: (data as any).secondary_color || '#3B82F6',
            presentation_text: (data as any).presentation_text || '',
            quote_footer_text: (data as any).quote_footer_text || '',
            pdf_logo_size: ((data as any).pdf_logo_size || 'medium') as CompanySettings['pdf_logo_size'],
            pdf_logo_position: ((data as any).pdf_logo_position || 'left') as CompanySettings['pdf_logo_position'],
            country_code: (data as any).country_code || 'RO',
            vat_id: (data as any).vat_id || '',
            caen_code: (data as any).caen_code || '',
            iban: (data as any).iban || '',
            bic: (data as any).bic || '',
            trade_register: (data as any).trade_register || '',
            share_capital: (data as any).share_capital != null ? String((data as any).share_capital) : '',
            city: (data as any).city || '',
            county: (data as any).county || '',
            postal_code: (data as any).postal_code || '',
            codice_fiscale: (data as any).codice_fiscale || '',
            regime_fiscale: (data as any).regime_fiscale || '',
            leitweg_id: (data as any).leitweg_id || '',
            siret: (data as any).siret || '',
            peppol_id: (data as any).peppol_id || '',
          }));
        }
      } else {
        // Admin: load from company_settings (global)
        const { data, error } = await supabase
          .from('company_settings')
          .select('*')
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings(prev => ({
            ...prev,
            id: data.id,
            name: data.name || 'IsoftGlass',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            cui: data.cui || '',
            bank_account: data.bank_account || '',
            logo_url: data.logo_url || '',
            primary_color: data.primary_color || '#0F172A',
            secondary_color: data.secondary_color || '#3B82F6',
            presentation_text: (data as any).presentation_text || '',
            quote_footer_text: (data as any).quote_footer_text || '',
            pdf_logo_size: ((data as any).pdf_logo_size || 'medium') as CompanySettings['pdf_logo_size'],
            pdf_logo_position: ((data as any).pdf_logo_position || 'left') as CompanySettings['pdf_logo_position'],
          }));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error(t('settings.settingsLoadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!isAdmin && companyId) {
        // Subscriber: save to companies table
        const { error } = await supabase
          .from('companies')
          .update({
            name: settings.name,
            address: settings.address,
            phone: settings.phone,
            email: settings.email,
            cui: settings.cui,
            bank_account: settings.bank_account,
            primary_color: settings.primary_color,
            secondary_color: settings.secondary_color,
            presentation_text: settings.presentation_text || null,
            quote_footer_text: settings.quote_footer_text || null,
            pdf_logo_size: settings.pdf_logo_size,
            pdf_logo_position: settings.pdf_logo_position,
            country_code: settings.country_code || null,
            vat_id: settings.vat_id || null,
            caen_code: settings.caen_code || null,
            iban: settings.iban || null,
            bic: settings.bic || null,
            trade_register: settings.trade_register || null,
            share_capital: settings.share_capital ? Number(settings.share_capital) : null,
            city: settings.city || null,
            county: settings.county || null,
            postal_code: settings.postal_code || null,
            codice_fiscale: settings.codice_fiscale || null,
            regime_fiscale: settings.regime_fiscale || null,
            leitweg_id: settings.leitweg_id || null,
            siret: settings.siret || null,
            peppol_id: settings.peppol_id || null,
          } as any)
          .eq('id', companyId);

        if (error) throw error;
      } else if (settings.id) {
        // Admin: update existing company_settings
        const { error } = await supabase
          .from('company_settings')
          .update({
            name: settings.name,
            address: settings.address,
            phone: settings.phone,
            email: settings.email,
            cui: settings.cui,
            bank_account: settings.bank_account,
            logo_url: settings.logo_url,
            primary_color: settings.primary_color,
            secondary_color: settings.secondary_color,
            presentation_text: settings.presentation_text || null,
            quote_footer_text: settings.quote_footer_text || null,
            pdf_logo_size: settings.pdf_logo_size,
            pdf_logo_position: settings.pdf_logo_position,
          } as any)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Admin: create new company_settings
        const { data, error } = await supabase
          .from('company_settings')
          .insert({
            name: settings.name,
            address: settings.address,
            phone: settings.phone,
            email: settings.email,
            cui: settings.cui,
            bank_account: settings.bank_account,
            logo_url: settings.logo_url,
            primary_color: settings.primary_color,
            secondary_color: settings.secondary_color,
            presentation_text: settings.presentation_text || null,
            quote_footer_text: settings.quote_footer_text || null,
            pdf_logo_size: settings.pdf_logo_size,
            pdf_logo_position: settings.pdf_logo_position,
          } as any)
          .select()
          .single();

        if (error) throw error;
        setSettings(prev => ({ ...prev, id: data.id }));
      }

      toast.success(t('settings.settingsSaved'));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t('settings.settingsSaveError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title={t('settings.title')}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t('settings.title')}>
      <div className="space-y-6">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className={`flex w-full max-w-4xl overflow-x-auto ${showTeamTab ? 'sm:grid sm:grid-cols-6' : 'sm:grid sm:grid-cols-5'}`}>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t('settings.companyTab')}
            </TabsTrigger>
            {showTeamTab && (
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('settings.teamTab')}
              </TabsTrigger>
            )}
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('settings.pricingTab')}
            </TabsTrigger>
            <TabsTrigger value="client-pricing" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('settings.clientPricingTab')}
            </TabsTrigger>
            <TabsTrigger value="invoicing" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              {t('invoicing.tab')}
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              {t('settings.dataTab')}
            </TabsTrigger>
          </TabsList>

          {showTeamTab && (
            <TabsContent value="team" className="mt-6">
              <div className="max-w-3xl">
                <TeamManager />
              </div>
            </TabsContent>
          )}

          <TabsContent value="company" className="mt-6">
            <div className="max-w-3xl">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {t('settings.companyInfo')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.companyInfoDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('settings.companyName')}</Label>
                      <Input
                        id="name"
                        value={settings.name}
                        onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="IsoftGlass SRL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cui">{t('settings.cuiCif')}</Label>
                      <Input
                        id="cui"
                        value={settings.cui}
                        onChange={(e) => setSettings(prev => ({ ...prev, cui: e.target.value }))}
                        placeholder="RO12345678"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">{t('settings.address')}</Label>
                    <Textarea
                      id="address"
                      value={settings.address}
                      onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                      placeholder={t('settings.addressPlaceholder')}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('settings.phone')}</Label>
                      <Input
                        id="phone"
                        value={settings.phone}
                        onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+40 XXX XXX XXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('settings.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contact@companie.ro"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_account">{t('settings.bankAccount')}</Label>
                      <Input
                        id="bank_account"
                        value={settings.bank_account}
                        onChange={(e) => setSettings(prev => ({ ...prev, bank_account: e.target.value }))}
                        placeholder="ROXX XXXX XXXX XXXX XXXX XXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bic">BIC / SWIFT</Label>
                      <Input id="bic" value={settings.bic} onChange={(e) => setSettings(prev => ({ ...prev, bic: e.target.value }))} placeholder="BTRLRO22" />
                    </div>
                  </div>

                  {!isAdmin && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-base font-semibold">{t('invoicing.settings.sectionTitle')}</h3>
                          <p className="text-xs text-muted-foreground">{t('invoicing.settings.sectionDesc')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>{t('invoicing.settings.countryLabel')}</Label>
                            <Select value={settings.country_code || 'RO'} onValueChange={(v) => setSettings(prev => ({ ...prev, country_code: v }))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="RO">{t('invoicing.settings.countries.RO')}</SelectItem>
                                <SelectItem value="IT">{t('invoicing.settings.countries.IT')}</SelectItem>
                                <SelectItem value="DE">{t('invoicing.settings.countries.DE')}</SelectItem>
                                <SelectItem value="FR">{t('invoicing.settings.countries.FR')}</SelectItem>
                                <SelectItem value="PL">{t('invoicing.settings.countries.PL')}</SelectItem>
                                <SelectItem value="ES">{t('invoicing.settings.countries.ES')}</SelectItem>
                                <SelectItem value="AT">{t('invoicing.settings.countries.AT')}</SelectItem>
                                <SelectItem value="HU">{t('invoicing.settings.countries.HU')}</SelectItem>
                                <SelectItem value="BG">{t('invoicing.settings.countries.BG')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t('invoicing.settings.vatIdLabel')}</Label>
                            <Input value={settings.vat_id} onChange={(e) => setSettings(prev => ({ ...prev, vat_id: e.target.value }))} placeholder={t('invoicing.settings.vatIdPlaceholder')} />
                          </div>
                          <div className="space-y-2 flex flex-col">
                            <Label>&nbsp;</Label>
                            <Button type="button" variant="outline" onClick={handleAnafLookup} disabled={lookingUpCui}>
                              {lookingUpCui ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                              {t('invoicing.settings.anafValidate')}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>{t('invoicing.settings.cityLabel')}</Label>
                            <Input value={settings.city} onChange={(e) => setSettings(prev => ({ ...prev, city: e.target.value }))} placeholder={t('invoicing.settings.cityPlaceholder')} />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('invoicing.settings.countyLabel')}</Label>
                            <Input value={settings.county} onChange={(e) => setSettings(prev => ({ ...prev, county: e.target.value }))} placeholder={t('invoicing.settings.countyPlaceholder')} />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('invoicing.settings.postalCodeLabel')}</Label>
                            <Input value={settings.postal_code} onChange={(e) => setSettings(prev => ({ ...prev, postal_code: e.target.value }))} placeholder={t('invoicing.settings.postalCodePlaceholder')} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>{t('invoicing.settings.tradeRegister')}</Label>
                            <Input value={settings.trade_register} onChange={(e) => setSettings(prev => ({ ...prev, trade_register: e.target.value }))} placeholder={t('invoicing.settings.tradeRegisterPlaceholder')} />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('invoicing.settings.caenCode')}</Label>
                            <Input value={settings.caen_code} onChange={(e) => setSettings(prev => ({ ...prev, caen_code: e.target.value }))} placeholder={t('invoicing.settings.caenPlaceholder')} />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('invoicing.settings.shareCapital')}</Label>
                            <Input type="number" value={settings.share_capital} onChange={(e) => setSettings(prev => ({ ...prev, share_capital: e.target.value }))} placeholder={t('invoicing.settings.shareCapitalPlaceholder')} />
                          </div>
                        </div>

                        {settings.country_code === 'IT' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>{t('invoicing.settings.codiceFiscale')}</Label>
                              <Input value={settings.codice_fiscale} onChange={(e) => setSettings(prev => ({ ...prev, codice_fiscale: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                              <Label>{t('invoicing.settings.regimeFiscale')}</Label>
                              <Select value={settings.regime_fiscale || 'RF01'} onValueChange={(v) => setSettings(prev => ({ ...prev, regime_fiscale: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="RF01">{t('invoicing.settings.regimeRf01')}</SelectItem>
                                  <SelectItem value="RF02">{t('invoicing.settings.regimeRf02')}</SelectItem>
                                  <SelectItem value="RF19">{t('invoicing.settings.regimeRf19')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {settings.country_code === 'DE' && (
                          <div className="space-y-2">
                            <Label>{t('invoicing.settings.leitwegId')}</Label>
                            <Input value={settings.leitweg_id} onChange={(e) => setSettings(prev => ({ ...prev, leitweg_id: e.target.value }))} placeholder={t('invoicing.settings.leitwegPlaceholder')} />
                          </div>
                        )}

                        {settings.country_code === 'FR' && (
                          <div className="space-y-2">
                            <Label>{t('invoicing.settings.siret')}</Label>
                            <Input value={settings.siret} onChange={(e) => setSettings(prev => ({ ...prev, siret: e.target.value }))} placeholder={t('invoicing.settings.siretPlaceholder')} />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>{t('invoicing.settings.peppolId')}</Label>
                          <Input value={settings.peppol_id} onChange={(e) => setSettings(prev => ({ ...prev, peppol_id: e.target.value }))} placeholder={t('invoicing.settings.peppolPlaceholder')} />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <Label>{t('settings.companyLogo')}</Label>
                    <p className="text-xs text-muted-foreground">{t('settings.logoDesc')}</p>
                    <div className="flex items-center gap-4">
                      {(isAdmin ? settings.logo_url : subscriberLogoUrl) ? (
                        <div className="relative group">
                          <div className="w-20 h-20 rounded-lg border border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                            <img
                              src={isAdmin ? settings.logo_url : subscriberLogoUrl}
                              alt="Logo companie"
                              className="max-w-full max-h-full object-contain p-1"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleRemoveLogo}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border bg-muted/20 flex items-center justify-center">
                          <Image className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingLogo}
                        >
                          {isUploadingLogo ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          {(isAdmin ? settings.logo_url : subscriberLogoUrl) ? t('settings.changeLogo') : t('settings.uploadLogo')}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* PDF Logo Size + Position */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="flex flex-col gap-2">
                      <Label>{t('settings.pdfLogoSize')}</Label>
                      <p className="text-xs text-muted-foreground min-h-[2.5rem]">{t('settings.pdfLogoSizeDesc')}</p>
                      <Select
                        value={settings.pdf_logo_size}
                        onValueChange={(v) => setSettings(prev => ({ ...prev, pdf_logo_size: v as CompanySettings['pdf_logo_size'] }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">{t('settings.pdfLogoSizeSmall')}</SelectItem>
                          <SelectItem value="medium">{t('settings.pdfLogoSizeMedium')}</SelectItem>
                          <SelectItem value="large">{t('settings.pdfLogoSizeLarge')}</SelectItem>
                          <SelectItem value="xlarge">{t('settings.pdfLogoSizeXLarge')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>{t('settings.pdfLogoPosition')}</Label>
                      <p className="text-xs text-muted-foreground min-h-[2.5rem]">{t('settings.pdfLogoPositionDesc')}</p>
                      <Select
                        value={settings.pdf_logo_position}
                        onValueChange={(v) => setSettings(prev => ({ ...prev, pdf_logo_position: v as CompanySettings['pdf_logo_position'] }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">{t('settings.pdfLogoPositionLeft')}</SelectItem>
                          <SelectItem value="center">{t('settings.pdfLogoPositionCenter')}</SelectItem>
                          <SelectItem value="right">{t('settings.pdfLogoPositionRight')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Presentation Text */}
                  <div className="space-y-2">
                    <Label htmlFor="presentation_text">{t('settings.presentationText')}</Label>
                    <p className="text-xs text-muted-foreground">{t('settings.presentationDesc')}</p>
                    <RichTextEditor
                      value={settings.presentation_text}
                      onChange={(html) => setSettings(prev => ({ ...prev, presentation_text: html }))}
                      placeholder={t('settings.presentationPlaceholder')}
                    />
                  </div>

                  {/* Quote Footer Text */}
                  <div className="space-y-2">
                    <Label htmlFor="quote_footer_text">{t('settings.quoteFooterText')}</Label>
                    <p className="text-xs text-muted-foreground">{t('settings.quoteFooterDesc')}</p>
                    <RichTextEditor
                      value={settings.quote_footer_text}
                      onChange={(html) => setSettings(prev => ({ ...prev, quote_footer_text: html }))}
                      placeholder={t('settings.quoteFooterPlaceholder')}
                    />
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t('settings.saving')}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {t('settings.saveSettings')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="mt-6">
            {isPricingUnlocked ? (
              <div className="space-y-6">
                <QuoteSettingsCard />
                <PricingManager />
              </div>
            ) : (
              <Card className="max-w-md mx-auto">
                <CardContent className="pt-6 space-y-4 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{t('settings.accessCode')}</h3>
                    <p className="text-sm text-muted-foreground">{t('settings.accessCodeDesc')}</p>
                  </div>
                  <div className="flex gap-2 max-w-xs mx-auto">
                    <Input
                      type="password"
                      placeholder={t('settings.accessCodePlaceholder')}
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                    />
                    <Button onClick={handleUnlock}>
                      {t('settings.unlock')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="client-pricing" className="mt-6">
            {isPricingUnlocked ? (
              <ClientTypePricingManager />
            ) : (
              <Card className="max-w-md mx-auto">
                <CardContent className="pt-6 space-y-4 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{t('settings.accessCode')}</h3>
                    <p className="text-sm text-muted-foreground">{t('settings.accessCodeDesc')}</p>
                  </div>
                  <div className="flex gap-2 max-w-xs mx-auto">
                    <Input
                      type="password"
                      placeholder={t('settings.accessCodePlaceholder')}
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                    />
                    <Button onClick={handleUnlock}>
                      {t('settings.unlock')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="invoicing" className="mt-6">
            <div className="max-w-4xl">
              <InvoiceSeriesManager />
            </div>
          </TabsContent>
          <TabsContent value="data" className="mt-6">
            <div className="max-w-3xl space-y-6">
              <DataExportSection />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
