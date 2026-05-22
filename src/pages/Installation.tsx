import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, ClipboardCheck, Truck, MapPin } from 'lucide-react';
import { InstallationCalendar } from '@/components/installation/InstallationCalendar';
import { TeamManager } from '@/components/installation/TeamManager';
import { ChecklistTemplateManager } from '@/components/installation/ChecklistTemplateManager';
import { OptimalRouting } from '@/components/installation/OptimalRouting';
import { VehicleManager } from '@/components/installation/VehicleManager';

export default function Installation() {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('installation.title')}</h1>
          <p className="text-muted-foreground">{t('installation.subtitle')}</p>
        </div>

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="calendar" className="gap-1.5">
              <Calendar className="h-4 w-4" />
              {t('installation.calendar')}
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-1.5">
              <Users className="h-4 w-4" />
              {t('installation.teams')}
            </TabsTrigger>
            <TabsTrigger value="checklist" className="gap-1.5">
              <ClipboardCheck className="h-4 w-4" />
              {t('installation.checklist')}
            </TabsTrigger>
            <TabsTrigger value="routing" className="gap-1.5">
              <MapPin className="h-4 w-4" />
              {t('installation.routing')}
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="gap-1.5">
              <Truck className="h-4 w-4" />
              {t('installation.vehicles')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <InstallationCalendar />
          </TabsContent>

          <TabsContent value="teams">
            <TeamManager />
          </TabsContent>

          <TabsContent value="checklist">
            <ChecklistTemplateManager />
          </TabsContent>

          <TabsContent value="routing">
            <OptimalRouting />
          </TabsContent>

          <TabsContent value="vehicles">
            <VehicleManager />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
