import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import i18next from 'i18next';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, ChevronDown, ChevronUp, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';

interface ErrorLog {
  id: string;
  user_id: string | null;
  error_message: string;
  error_stack: string | null;
  component_stack: string | null;
  url: string;
  user_agent: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export default function AdminErrorLogs() {
  const { role, loading } = useAuth();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: errors = [], isLoading } = useQuery({
    queryKey: ['admin-error-logs'],
    queryFn: async () => {
      const { data, error } = await (supabase.from('client_error_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)) as any;
      if (error) throw error;
      const logs = (data ?? []) as ErrorLog[];

      // Fetch user names
      const userIds = [...new Set(logs.map(l => l.user_id).filter(Boolean))] as string[];
      let nameMap = new Map<string, string>();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        if (profiles) {
          for (const p of profiles) {
            nameMap.set(p.user_id, p.full_name || 'N/A');
          }
        }
      }

      return logs.map(l => ({ ...l, user_name: l.user_id ? (nameMap.get(l.user_id) || 'N/A') : 'Anonim' }));
    },
    enabled: role === 'admin',
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('client_error_logs' as any).delete().eq('id', id)) as any;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-error-logs'] });
      toast.success(i18next.t('toasts.errorLogs.deleted'));
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase.from('client_error_logs' as any).delete().neq('id', '00000000-0000-0000-0000-000000000000')) as any;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-error-logs'] });
      toast.success(i18next.t('toasts.errorLogs.allDeleted'));
    },
  });

  if (loading) return null;
  if (role !== 'admin') return <Navigate to="/dashboard" replace />;

  const formatDate = (d: string) => new Date(d).toLocaleString('ro-RO');

  return (
    <AppLayout>
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h1 className="text-xl font-bold">Erori Client</h1>
            <span className="text-sm text-muted-foreground">({errors.length})</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-error-logs'] })}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {errors.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => deleteAllMutation.mutate()}>
                Șterge toate
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">{i18next.t('ui.loading')}</p>
        ) : errors.length === 0 ? (
          <p className="text-muted-foreground text-sm">{i18next.t('ui.noErrors')}</p>
        ) : (
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Utilizator</TableHead>
                  <TableHead className="w-[160px]">Data</TableHead>
                  <TableHead>Mesaj</TableHead>
                  <TableHead className="w-[200px]">URL</TableHead>
                  <TableHead className="w-[80px]">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((err) => (
                  <TableRow key={err.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === err.id ? null : err.id)}>
                    <TableCell className="text-xs whitespace-nowrap font-medium">{(err as any).user_name}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{formatDate(err.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {expandedId === err.id ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
                        <span className="text-sm line-clamp-1">{err.error_message}</span>
                      </div>
                      {expandedId === err.id && (
                        <div className="mt-2 space-y-2 text-xs">
                          {err.error_stack && (
                            <div>
                              <strong>Stack:</strong>
                              <pre className="mt-1 p-2 bg-muted rounded text-[11px] overflow-auto max-h-40 whitespace-pre-wrap">{err.error_stack}</pre>
                            </div>
                          )}
                          {err.component_stack && (
                            <div>
                              <strong>Component Stack:</strong>
                              <pre className="mt-1 p-2 bg-muted rounded text-[11px] overflow-auto max-h-40 whitespace-pre-wrap">{err.component_stack}</pre>
                            </div>
                          )}
                          <div><strong>User Agent:</strong> {err.user_agent}</div>
                          <div><strong>User ID:</strong> {err.user_id ?? 'N/A'}</div>
                          {err.metadata && <div><strong>Metadata:</strong> {JSON.stringify(err.metadata)}</div>}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{new URL(err.url).pathname}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(err.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
