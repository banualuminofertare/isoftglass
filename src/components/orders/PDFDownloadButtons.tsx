import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, Download, ClipboardList, Loader2, Wrench } from 'lucide-react';
// pdfGenerator is imported dynamically inside each handler to keep it out of the Orders bundle
import type { Order, OrderProduct } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/contexts/CurrencyContext';

interface PDFDownloadButtonsProps {
  order: Order;
  products: OrderProduct[];
  variant?: 'default' | 'dropdown';
  materialMap?: Map<string, { name: string; image_url: string | null }>;
  hideQuote?: boolean;
  productionSheetLabel?: string;
  liveTotals?: { liveOrderSubtotal: number; liveProductLineTotals: Record<string, number> };
}

export function PDFDownloadButtons({ 
  order, 
  products,
  variant = 'dropdown',
  materialMap,
  hideQuote = false,
  productionSheetLabel,
  liveTotals
}: PDFDownloadButtonsProps) {
  const [isGenerating, setIsGenerating] = useState<'quote' | 'production' | 'installation' | null>(null);
  const { t } = useTranslation();
  const { role, companyId } = useAuth();
  const { currencyLabel, convert } = useCurrency();
  const isAdmin = role === 'admin';

  const getCompanyInfo = async () => {
    // Subscriber: read from companies table
    if (!isAdmin && companyId) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .maybeSingle();

      return {
        name: (companyData as any)?.name || 'Companie',
        address: (companyData as any)?.address || undefined,
        phone: (companyData as any)?.phone || undefined,
        email: (companyData as any)?.email || undefined,
        cui: (companyData as any)?.cui || undefined,
        bankAccount: (companyData as any)?.bank_account || undefined,
        logoUrl: (companyData as any)?.logo_url || undefined,
        presentationText: (companyData as any)?.presentation_text || undefined,
        quoteFooterText: (companyData as any)?.quote_footer_text || undefined,
        pdfLogoSize: ((companyData as any)?.pdf_logo_size || 'medium') as 'small' | 'medium' | 'large' | 'xlarge',
        pdfLogoPosition: ((companyData as any)?.pdf_logo_position || 'left') as 'left' | 'center' | 'right',
      };
    }

    // Admin: read from company_settings (global)
    const { data } = await supabase
      .from('company_settings')
      .select('*')
      .single();

    return {
      name: data?.name || 'IsoftGlass',
      address: data?.address || undefined,
      phone: data?.phone || undefined,
      email: data?.email || undefined,
      cui: data?.cui || undefined,
      bankAccount: data?.bank_account || undefined,
      logoUrl: data?.logo_url || undefined,
      presentationText: (data as any)?.presentation_text || undefined,
      quoteFooterText: (data as any)?.quote_footer_text || undefined,
      pdfLogoSize: ((data as any)?.pdf_logo_size || 'medium') as 'small' | 'medium' | 'large' | 'xlarge',
      pdfLogoPosition: ((data as any)?.pdf_logo_position || 'left') as 'left' | 'center' | 'right',
    };
  };

  const getClientInfo = () => {
    if (!order.clients) return null;
    return {
      name: order.clients.name,
      company_name: order.clients.company_name || undefined,
      phone: order.clients.phone || undefined,
      email: order.clients.email || undefined,
    };
  };

  const getOrderInfo = () => ({
    order_number: order.order_number,
    created_at: order.created_at,
    delivery_date: order.delivery_date || undefined,
    delivery_address: order.delivery_address || undefined,
    notes: order.notes || undefined,
    subtotal: order.subtotal,
    discount_percent: order.discount_percent || undefined,
    discount_amount: order.discount_amount || undefined,
    tax_percent: order.tax_percent || undefined,
    tax_amount: order.tax_amount || undefined,
    total: order.total,
  });

  const handleDownloadQuote = async () => {
    setIsGenerating('quote');
    try {
      const company = await getCompanyInfo();
      const client = getClientInfo();
      const orderInfo = getOrderInfo();

      const { generateQuotePDF } = await import('@/lib/pdf/pdfGenerator');
      const pdf = await generateQuotePDF(company, client, orderInfo, products, { currencyLabel, convertFn: convert }, materialMap, liveTotals);
      pdf.save(`Oferta_${order.order_number}.pdf`);
      
      toast.success(t('pdfButtons.quoteDownloaded'));
    } catch (error) {
      console.error('Error generating quote PDF:', error);
      toast.error(t('pdfButtons.generateError'));
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDownloadProductionSheet = async () => {
    setIsGenerating('production');
    try {
      const company = await getCompanyInfo();
      const orderInfo = getOrderInfo();

      const { generateProductionSheetPDF } = await import('@/lib/pdf/pdfGenerator');
      const pdf = await generateProductionSheetPDF(company, orderInfo, products, materialMap);
      pdf.save(`Fisa_Productie_${order.order_number}.pdf`);
      
      toast.success(t('pdfButtons.productionDownloaded'));
    } catch (error) {
      console.error('Error generating production sheet PDF:', error);
      toast.error(t('pdfButtons.generateError'));
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDownloadInstallationSheet = async () => {
    setIsGenerating('installation');
    try {
      const company = await getCompanyInfo();
      const client = getClientInfo();
      const orderInfo = getOrderInfo();

      const { generateInstallationSheetPDF } = await import('@/lib/pdf/pdfGenerator');
      const pdf = await generateInstallationSheetPDF(company, client, orderInfo, products, materialMap);
      pdf.save(`Fisa_Montaj_${order.order_number}.pdf`);
      
      toast.success(t('pdfButtons.installationDownloaded'));
    } catch (error) {
      console.error('Error generating installation sheet PDF:', error);
      toast.error(t('pdfButtons.generateError'));
    } finally {
      setIsGenerating(null);
    }
  };

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isGenerating !== null}>
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {t('pdfButtons.downloadPdf')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!hideQuote && (
            <DropdownMenuItem onClick={handleDownloadQuote} disabled={isGenerating !== null}>
              <FileText className="h-4 w-4 mr-2" />
              {t('pdfButtons.priceQuote')}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleDownloadProductionSheet} disabled={isGenerating !== null}>
            <ClipboardList className="h-4 w-4 mr-2" />
            {productionSheetLabel || t('pdfButtons.productionSheet')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadInstallationSheet} disabled={isGenerating !== null}>
            <Wrench className="h-4 w-4 mr-2" />
            {t('pdfButtons.installationSheet')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-2">
      {!hideQuote && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownloadQuote}
          disabled={isGenerating !== null}
        >
          {isGenerating === 'quote' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          {t('pdfButtons.quotePdf')}
        </Button>
      )}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={productionSheetLabel ? handleDownloadInstallationSheet : handleDownloadProductionSheet}
        disabled={isGenerating !== null}
      >
        {isGenerating === (productionSheetLabel ? 'installation' : 'production') ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <ClipboardList className="h-4 w-4 mr-2" />
        )}
        {productionSheetLabel || t('pdfButtons.productionSheet')}
      </Button>
    </div>
  );
}
