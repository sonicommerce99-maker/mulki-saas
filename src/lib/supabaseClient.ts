import { createClient } from '@supabase/supabase-js';

// Provided credentials with environment variables fallback
const envUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '').trim();

export const DEFAULT_SUPABASE_URL = 'https://dyivtezezgiswxqkufyk.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Z1S8Bk3bJILfKF9fAe57FQ_WwcBaXxB';

export const supabaseUrl = envUrl || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = envKey || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

// Real initialized Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string;
  hasAnonKey: boolean;
  projectId: string;
}

export const getSupabaseConfigStatus = (): SupabaseConfigStatus => {
  let projectId = '';
  try {
    const urlObj = new URL(supabaseUrl);
    projectId = urlObj.hostname.split('.')[0] || '';
  } catch {
    projectId = 'dyivtezezgiswxqkufyk';
  }

  return {
    isConfigured: isSupabaseConfigured,
    url: supabaseUrl,
    hasAnonKey: Boolean(supabaseAnonKey),
    projectId,
  };
};

/**
 * Test live connection to the user's Supabase instance
 */
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  tablesFound: boolean;
  message: string;
  counts?: { properties?: number; units?: number };
}> => {
  try {
    // Attempt to query properties table
    const { data, error } = await supabase
      .from('properties')
      .select('id', { count: 'exact' })
      .limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return {
          success: true,
          tablesFound: false,
          message: 'تم الاتصال بسوبابيز بنجاح! الجداول ما زالت فارغة وبحاجة لتنفيذ استعلام SQL في الـ SQL Editor.',
        };
      }
      return {
        success: false,
        tablesFound: false,
        message: `خطأ في الاتصال: ${error.message}`,
      };
    }

    return {
      success: true,
      tablesFound: true,
      message: 'قاعدة البيانات متصلة وجاهزة بنجاح!',
      counts: {
        properties: data ? data.length : 0,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      tablesFound: false,
      message: err.message || 'فشل الاتصال بقاعدة البيانات',
    };
  }
};
