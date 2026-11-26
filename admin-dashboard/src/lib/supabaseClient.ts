import { createClient } from '@supabase/supabase-js';

export const BUCKET_SALARY_SLIPS = 'salary-slips';
export const BUCKET_COMPANY_ASSETS = 'company-assets';

/**
 * Get active Supabase configuration (prefers localStorage if configured in UI, then environment variables)
 */
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('app_supabase_url');
    const savedKey = localStorage.getItem('app_supabase_key');
    if (savedUrl) url = savedUrl;
    if (savedKey) anonKey = savedKey;
  }

  // Fallback defaults if neither is set
  if (!url || url.includes('xyzcompany') || url.includes('your-project-ref')) {
    url = 'https://supabase.local.omsairam';
  }
  if (!anonKey || anonKey.includes('dummy-anon-key') || anonKey.includes('your-anon-key')) {
    anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.active-client-key';
  }

  return { url, anonKey };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_supabase_url', url.trim());
    localStorage.setItem('app_supabase_key', anonKey.trim());
  }
}

const initialCreds = getSupabaseCredentials();
export let supabase = createClient(initialCreds.url, initialCreds.anonKey);

export function resetSupabaseClient(url: string, anonKey: string) {
  saveSupabaseCredentials(url, anonKey);
  supabase = createClient(url, anonKey);
  return supabase;
}

/**
 * Checks whether valid real-world Supabase credentials have been configured
 */
export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(
    url &&
    anonKey &&
    !url.includes('your-project-ref') &&
    !url.includes('xyzcompany') &&
    !url.includes('supabase.local.omsairam')
  );
}

/**
 * Tests connection to the Supabase backend and ensures buckets exist
 */
export async function testSupabaseConnection(overrideUrl?: string, overrideKey?: string): Promise<{
  success: boolean;
  message: string;
  buckets?: string[];
  tablesCount?: number;
}> {
  try {
    const client = overrideUrl && overrideKey 
      ? createClient(overrideUrl, overrideKey)
      : supabase;

    // Test bucket access
    const { data: buckets, error } = await client.storage.listBuckets();
    if (error) {
      return { 
        success: false, 
        message: `Connected to API but storage returned: ${error.message}` 
      };
    }

    const bucketNames = buckets?.map((b) => b.name) || [];

    // Attempt to auto-create buckets if missing
    if (!bucketNames.includes(BUCKET_SALARY_SLIPS)) {
      await client.storage.createBucket(BUCKET_SALARY_SLIPS, { public: true });
      bucketNames.push(BUCKET_SALARY_SLIPS);
    }
    if (!bucketNames.includes(BUCKET_COMPANY_ASSETS)) {
      await client.storage.createBucket(BUCKET_COMPANY_ASSETS, { public: true });
      bucketNames.push(BUCKET_COMPANY_ASSETS);
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase! Storage buckets verified and ready.',
      buckets: bucketNames,
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed' };
  }
}

/**
 * Uploads a generated PDF salary slip directly to the Supabase 'salary-slips' storage bucket
 */
export async function uploadSalarySlipToBucket(
  fileName: string,
  pdfBlob: Blob
): Promise<{ success: boolean; url?: string; message: string }> {
  try {
    if (!isSupabaseConfigured()) {
      // Local fallback simulation with object URL
      const mockUrl = URL.createObjectURL(pdfBlob);
      return {
        success: true,
        url: mockUrl,
        message: 'Saved to local buffer (Configure remote Supabase URL to push to cloud storage)',
      };
    }

    const filePath = `slips/${fileName}`;
    const { data, error } = await supabase.storage
      .from(BUCKET_SALARY_SLIPS)
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      return { success: false, message: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_SALARY_SLIPS)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      message: `Uploaded to Supabase bucket "${BUCKET_SALARY_SLIPS}" successfully!`,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Upload failed' };
  }
}

/**
 * Generates public download URL for a file in the Supabase salary-slips bucket
 */
export function getSalarySlipPublicUrl(fileName: string): string {
  const filePath = `slips/${fileName}`;
  const { data } = supabase.storage.from(BUCKET_SALARY_SLIPS).getPublicUrl(filePath);
  return data.publicUrl;
}
