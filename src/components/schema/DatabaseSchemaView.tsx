import React, { useState } from 'react';
import { supabaseTables, supabaseSqlFullMigration, SchemaTable } from '../../data/schemaDefinition';
import { Language, translations } from '../../locales/translations';
import { 
  Database, 
  Copy, 
  Check, 
  ShieldCheck, 
  Key, 
  Table2, 
  Code2, 
  Zap,
  Layers
} from 'lucide-react';

interface DatabaseSchemaViewProps {
  lang: Language;
}

export const DatabaseSchemaView: React.FC<DatabaseSchemaViewProps> = ({ lang }) => {
  const t = translations[lang];
  const [selectedTable, setSelectedTable] = useState<SchemaTable>(supabaseTables[0]);
  const [activeTab, setActiveTab] = useState<'visual' | 'sql'>('visual');
  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlFullMigration);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#0F5A47]" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {t.schemaTitle}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.schemaSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'visual'
                ? 'bg-[#0F5A47] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Table2 className="w-4 h-4" />
            <span>{lang === 'ar' ? 'مخطط الجداول (Visual ERD)' : 'Table Inspector'}</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'sql'
                ? 'bg-[#0F5A47] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>{lang === 'ar' ? 'كود SQL كامل للنسخ' : 'Full SQL DDL'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'visual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Table List Column */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-bold text-slate-500 block mb-2 px-1">
              {lang === 'ar' ? 'الجداول السحابية (Supabase Tables):' : 'Database Tables:'}
            </span>
            {supabaseTables.map((table) => {
              const isSelected = selectedTable.name === table.name;
              return (
                <div
                  key={table.name}
                  onClick={() => setSelectedTable(table)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/70 border-[#0F5A47] ring-1 ring-[#0F5A47] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                      public.{table.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {table.columns.length} cols
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                    {lang === 'ar' ? table.name_ar : table.description_en}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Table Detail & Columns Column */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5">
            
            {/* Table Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <h3 className="font-mono font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>public.{selectedTable.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'ar' ? selectedTable.description_ar : selectedTable.description_en}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>RLS Protected</span>
              </div>
            </div>

            {/* Columns Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-3 text-start">{lang === 'ar' ? 'اسم الحقل (Column)' : 'Column'}</th>
                    <th className="py-2.5 px-3 text-start">{lang === 'ar' ? 'النوع (Type & Constraint)' : 'Data Type'}</th>
                    <th className="py-2.5 px-3 text-start">{lang === 'ar' ? 'الوصف' : 'Description'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {selectedTable.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        {col.isPrimary && (
                          <span title="Primary Key">
                            <Key className="w-3.5 h-3.5 text-amber-500" />
                          </span>
                        )}
                        {col.isForeign && <span className="text-[10px] text-blue-600 font-mono">FK</span>}
                        <span>{col.name}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#0F5A47] font-semibold">
                        {col.type}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {lang === 'ar' ? col.description_ar : col.description_en}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Row Level Security (RLS) Policy Box */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? 'سياسات الأمان Row Level Security (RLS):' : 'Security Policies:'}</span>
              </h4>
              <div className="space-y-1.5">
                {selectedTable.rlsPolicies.map((pol) => (
                  <div key={pol.name} className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700">
                    <strong className="text-emerald-800 uppercase me-2">[{pol.command}] {pol.name}:</strong>
                    <span>{pol.rule}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Full SQL Script Viewer with Copy Button */
        <div className="bg-slate-950 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-400" />
              <span className="font-mono text-xs font-bold text-slate-300">
                supabase_migration_aqarflow.sql
              </span>
            </div>
            
            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#0F5A47] hover:bg-[#0c4839] text-white rounded-lg shadow-sm transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t.sqlCopied : t.copySql}</span>
            </button>
          </div>

          <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 bg-slate-900 rounded-xl leading-relaxed max-h-[600px] overflow-y-auto">
            {supabaseSqlFullMigration}
          </pre>
        </div>
      )}

    </div>
  );
};
