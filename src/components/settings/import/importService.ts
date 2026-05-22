import { supabase } from '@/integrations/supabase/client';

const BATCH_SIZE = 100;

// Fields that must be injected per table for RLS compliance
const TABLE_REQUIRED_FIELDS: Record<string, string[]> = {
  clients: ['created_by', 'company_id'],
  quotes: ['created_by', 'company_id'],
  orders: ['created_by', 'company_id'],
  materials: [], // materials RLS only checks is_approved_user()
};

async function getAuthContext() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nu ești autentificat');

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', user.id)
    .single();

  return {
    user_id: user.id,
    company_id: profile?.company_id || null,
  };
}

function cleanRow(row: Record<string, unknown>, table: string): Record<string, unknown> {
  const cleaned = { ...row };
  // Remove id fields to let DB generate them
  delete cleaned['id'];
  // Remove created_at/updated_at to use defaults
  delete cleaned['created_at'];
  delete cleaned['updated_at'];
  return cleaned;
}

export async function importTableData(
  table: string,
  data: Record<string, unknown>[]
): Promise<{ success: number; errors: number }> {
  const ctx = await getAuthContext();
  const requiredFields = TABLE_REQUIRED_FIELDS[table] || [];

  let success = 0;
  let errors = 0;

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE).map(row => {
      const cleaned = cleanRow(row, table);

      // Inject auth context fields
      if (requiredFields.includes('created_by')) {
        cleaned['created_by'] = ctx.user_id;
      }
      if (requiredFields.includes('user_id')) {
        cleaned['user_id'] = ctx.user_id;
      }
      if (requiredFields.includes('company_id') && ctx.company_id) {
        cleaned['company_id'] = ctx.company_id;
      }

      return cleaned;
    });

    const { error } = await (supabase.from(table as any) as any).insert(batch);
    if (error) {
      console.error(`Import batch error for ${table}:`, error.message);
      errors += batch.length;
    } else {
      success += batch.length;
    }
  }

  return { success, errors };
}
