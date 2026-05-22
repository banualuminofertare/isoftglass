import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { getDateLocale } from '@/lib/dateLocale';
import { MapPin, Navigation, Copy, ChevronUp, ChevronDown, Users, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useInstallation } from '@/hooks/useInstallation';
import { useInstallationTeams } from '@/hooks/useInstallationTeams';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

const ZONE_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
];

interface RouteJob {
  id: string;
  client_name: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  scheduled_time: string | null;
  status: string;
  team?: { id: string; name: string } | null;
  order?: { id: string; order_number: string } | null;
}

export function OptimalRouting() {
  const { t } = useTranslation();
  const { jobs } = useInstallation();
  const { teams } = useInstallationTeams();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [manualOrder, setManualOrder] = useState<Record<string, string[]>>({});

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const filteredJobs = useMemo(() => {
    return jobs.filter((job: any) => {
      const matchDate = job.scheduled_date === dateStr;
      const matchTeam = selectedTeam === 'all' || job.team_id === selectedTeam;
      return matchDate && matchTeam;
    });
  }, [jobs, dateStr, selectedTeam]);

  const groupedByZone = useMemo(() => {
    const groups: Record<string, RouteJob[]> = {};
    filteredJobs.forEach((job: any) => {
      const zone = job.city || job.postal_code || t('installation.routeUnknownZone');
      if (!groups[zone]) groups[zone] = [];
      groups[zone].push(job);
    });

    // Sort jobs within each zone by scheduled_time
    Object.keys(groups).forEach(zone => {
      const custom = manualOrder[zone];
      if (custom) {
        groups[zone].sort((a, b) => {
          const idxA = custom.indexOf(a.id);
          const idxB = custom.indexOf(b.id);
          if (idxA === -1 && idxB === -1) return 0;
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });
      } else {
        groups[zone].sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''));
      }
    });

    return groups;
  }, [filteredJobs, manualOrder, t]);

  const zones = Object.keys(groupedByZone);

  const moveJob = (zone: string, jobId: string, direction: 'up' | 'down') => {
    const currentJobs = groupedByZone[zone];
    const ids = currentJobs.map(j => j.id);
    const idx = ids.indexOf(jobId);
    if (direction === 'up' && idx > 0) {
      [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    } else if (direction === 'down' && idx < ids.length - 1) {
      [ids[idx + 1], ids[idx]] = [ids[idx], ids[idx + 1]];
    }
    setManualOrder(prev => ({ ...prev, [zone]: ids }));
  };

  const generateGoogleMapsUrl = (zoneJobs: RouteJob[]) => {
    const addresses = zoneJobs
      .filter(j => j.address || j.city)
      .map(j => encodeURIComponent([j.address, j.city].filter(Boolean).join(', ')));
    if (addresses.length === 0) return null;
    return `https://www.google.com/maps/dir/${addresses.join('/')}`;
  };

  const copyRoute = (zoneJobs: RouteJob[]) => {
    const text = zoneJobs
      .map((j, i) => `${i + 1}. ${j.client_name || '-'} — ${[j.address, j.city].filter(Boolean).join(', ') || '-'} (${j.scheduled_time || '-'})`)
      .join('\n');
    navigator.clipboard.writeText(text);
    toast({ title: t('installation.routeCopied') });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">{t('common.date')}</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('w-[200px] justify-start text-left font-normal', !selectedDate && 'text-muted-foreground')}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'dd MMM yyyy', { locale: getDateLocale() })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">{t('installation.team')}</label>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {teams.map((team: any) => (
                <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto">
          <Badge variant="secondary" className="text-sm py-1.5 px-3">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            {filteredJobs.length} {t('installation.routeJobs')} · {zones.length} {t('installation.routeZones')}
          </Badge>
        </div>
      </div>

      {/* No jobs */}
      {zones.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Navigation className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{t('installation.routeNoJobs')}</p>
          <p className="text-sm">{t('installation.routeNoJobsHint')}</p>
        </div>
      )}

      {/* Zone cards */}
      {zones.map((zone, zoneIdx) => {
        const zoneJobs = groupedByZone[zone];
        const mapsUrl = generateGoogleMapsUrl(zoneJobs);
        const colorClass = ZONE_COLORS[zoneIdx % ZONE_COLORS.length];

        return (
          <Card key={zone} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge className={cn('border', colorClass)}>{zone}</Badge>
                  <CardTitle className="text-base">
                    {zoneJobs.length} {t('installation.routeJobs')}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyRoute(zoneJobs)}>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    {t('installation.routeCopy')}
                  </Button>
                  {mapsUrl && (
                    <Button size="sm" asChild>
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        {t('installation.routeOpenMaps')}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {zoneJobs.map((job, idx) => (
                <div key={job.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <div className="flex flex-col gap-0.5">
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => moveJob(zone, job.id, 'up')}>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === zoneJobs.length - 1} onClick={() => moveJob(zone, job.id, 'down')}>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{job.client_name || '-'}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {[job.address, job.city, job.postal_code].filter(Boolean).join(', ') || '-'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    {job.scheduled_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.scheduled_time}
                      </span>
                    )}
                    {job.team && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job.team.name}
                      </span>
                    )}
                    {job.order && (
                      <Badge variant="outline" className="text-xs">{job.order.order_number}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
