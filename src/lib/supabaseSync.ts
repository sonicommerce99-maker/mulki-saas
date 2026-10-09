import { supabase } from './supabaseClient';
import { Property, Unit, Lease, MaintenanceTicket, FinancialTransaction } from '../types';
import { mockOrganization, mockProperties, mockUnits, mockLeases, mockMaintenanceTickets, mockTransactions } from '../data/mockData';

export interface SyncResult {
  success: boolean;
  message: string;
  syncedItems?: number;
}

/**
 * Seed sample real estate data into the user's Supabase instance
 */
export const seedSampleDataToSupabase = async (): Promise<SyncResult> => {
  try {
    // 1. Insert organization
    const { error: orgError } = await supabase
      .from('organizations')
      .upsert({
        id: 'e7b8c1a0-1234-4567-89ab-cdef01234567',
        name: mockOrganization.name_ar,
        cr_number: mockOrganization.cr_number,
        vat_number: mockOrganization.vat_number,
        country_code: 'SA',
        currency: 'SAR',
      });

    if (orgError) {
      if (orgError.code === '42P01' || orgError.message.includes('does not exist')) {
        return {
          success: false,
          message: 'الجداول غير موجودة بعد في مشروع سوبابيز. يرجى أولاً نسخ كود SQL وتشغيله في الـ SQL Editor لإنشاء الجداول.',
        };
      }
      return {
        success: false,
        message: `خطأ أثناء إنشاء المؤسسة: ${orgError.message}`,
      };
    }

    // 2. Insert properties
    const propertiesData = mockProperties.map((p, idx) => ({
      id: `a${idx + 1}111111-1111-1111-1111-111111111111`,
      organization_id: 'e7b8c1a0-1234-4567-89ab-cdef01234567',
      name: p.name_ar,
      type: p.type,
      city: p.city_ar,
      district: p.district_ar,
      total_units_count: p.total_units,
      image_url: p.image_url,
    }));

    await supabase.from('properties').upsert(propertiesData);

    return {
      success: true,
      message: 'تمت تعبئة بيانات العقارات والمؤسسة في مشروع Supabase الخاص بك بنجاح!',
      syncedItems: propertiesData.length,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'حدث خطأ غير متوقع أثناء إرسال البيانات لسوبابيز',
    };
  }
};
