"use client";

import { useState } from 'react';
import { exportToPDF } from '@/lib/export-pdf';
import { Student } from '@/lib/types';

export default function PdfExportButton({ student }: { student: Student }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await exportToPDF('report-content', `Rapport_DYS_${student.firstName}_${student.lastName}`);
    setIsExporting(false);
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
      className={`group flex items-center gap-4 py-5 px-10 rounded-xl bg-primary text-on-primary font-headline font-bold text-lg transition-all shadow-[0_20px_40px_rgba(0,96,173,0.15)] hover:bg-primary-dim hover:scale-[1.03] active:scale-95 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
        picture_as_pdf
      </span>
      {isExporting ? "Génération PDF..." : "Exporter le rapport en PDF"}
    </button>
  );
}
