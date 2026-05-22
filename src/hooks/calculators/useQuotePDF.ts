import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
// pdfGenerator imported lazily inside handleDownloadPDF to keep it out of calculator bundles
import { useTVA } from '@/hooks/useTVA';
import { captureCanvasSnapshot } from '@/lib/captureCanvasSnapshot';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/useAuth';
import type { PriceBreakdown } from '@/types/calculators';

interface UseQuotePDFOptions {
  productType: string;
  productLabel: string;
  getConfigDetails: () => { label: string; value: string }[];
  price: PriceBreakdown;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  customAmount?: number;
  markupPercent?: number;
}

export function useQuotePDF({ productType, productLabel, getConfigDetails, price, clientName, clientPhone, clientEmail, customAmount, markupPercent }: UseQuotePDFOptions) {
  const { toast } = useToast();
  const tvaPercent = useTVA();
  const { currencyLabel, convert } = useCurrency();
  const { role, companyId } = useAuth();
  const isAdmin = role === 'admin';

  const handleDownloadPDF = async () => {
    try {
      let company: any;

      if (!isAdmin && companyId) {
        // Subscriber: read from companies table
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .maybeSingle();

        company = {
          name: (companyData as any)?.name || 'Companie',
          address: (companyData as any)?.address || undefined,
          phone: (companyData as any)?.phone || undefined,
          email: (companyData as any)?.email || undefined,
          cui: (companyData as any)?.cui || undefined,
          bankAccount: (companyData as any)?.bank_account || undefined,
          logoUrl: (companyData as any)?.logo_url || undefined,
          presentationText: (companyData as any)?.presentation_text || undefined,
          quoteFooterText: (companyData as any)?.quote_footer_text || undefined,
          pdfLogoSize: (companyData as any)?.pdf_logo_size || 'medium',
          pdfLogoPosition: (companyData as any)?.pdf_logo_position || 'left',
        };
      } else {
        // Admin: read from company_settings (global)
        const { data: companyData } = await supabase
          .from('company_settings')
          .select('*')
          .limit(1)
          .single();

        company = {
          name: companyData?.name || 'Companie',
          address: companyData?.address || undefined,
          phone: companyData?.phone || undefined,
          email: companyData?.email || undefined,
          cui: companyData?.cui || undefined,
          bankAccount: companyData?.bank_account || undefined,
          logoUrl: companyData?.logo_url || undefined,
          presentationText: (companyData as any)?.presentation_text || undefined,
          quoteFooterText: (companyData as any)?.quote_footer_text || undefined,
          pdfLogoSize: (companyData as any)?.pdf_logo_size || 'medium',
          pdfLogoPosition: (companyData as any)?.pdf_logo_position || 'left',
        };
      }

      const snapshotBase64 = captureCanvasSnapshot() || undefined;

      const { generateQuickQuotePDF } = await import('@/lib/pdf/pdfGenerator');

      const doc = await generateQuickQuotePDF({
        company,
        productType: productLabel,
        configDetails: getConfigDetails(),
        price,
        clientName: clientName || undefined,
        clientPhone: clientPhone || undefined,
        clientEmail: clientEmail || undefined,
        tvaPercent,
        snapshotBase64,
        customAmount,
        markupPercent,
        currencyLabel,
        convertFn: convert,
      });

      const safeType = productType.replace(/[^a-zA-Z0-9]/g, '-');
      doc.save(`Oferta-${safeType}-${new Date().toISOString().slice(0, 10)}.pdf`);

      // Auto-create client in CRM if name was provided
      if (clientName?.trim()) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          // Check if client with same name already exists
          const { data: existing } = await supabase
            .from('clients')
            .select('id')
            .ilike('name', clientName.trim())
            .limit(1);

          if (!existing || existing.length === 0) {
            await supabase
              .from('clients')
              .insert({
                name: clientName.trim(),
                phone: clientPhone?.trim() || null,
                email: clientEmail?.trim() || null,
                client_type: 'person',
                created_by: user?.id,
              });
          }
        } catch (e) {
          // Don't block PDF download if client creation fails
          console.error('Auto-create client failed:', e);
        }
      }

      toast({
        title: "PDF generat",
        description: "Oferta a fost descărcată cu succes.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut genera PDF-ul.",
        variant: "destructive",
      });
    }
  };

  return { handleDownloadPDF };
}
