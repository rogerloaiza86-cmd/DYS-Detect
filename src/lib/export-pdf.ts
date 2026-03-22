export const exportToPDF = async (elementId: string, filename: string) => {
  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    // Check dark mode
    const isDark = document.documentElement.className.includes('dark');
    
    // Force light mode for PDF rendering
    if (isDark) {
      document.documentElement.classList.remove('dark');
    }

    // Canvas generation
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Restore original styles
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    
    // PDF generation
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Add header text
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(25, 127, 230); // Primary color
    pdf.text("Rapport d'Orientation — DYS-Detect", 15, 20);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 15, 28);

    // Legal disclaimer in PDF
    pdf.setFontSize(7.5);
    pdf.setTextColor(150, 100, 30);
    pdf.text("Outil d'aide au repérage précoce — ne constitue pas une évaluation clinique. Orienter vers un professionnel de santé en cas de doute.", 15, 34);

    // Add captured image
    pdf.addImage(imgData, 'PNG', 10, 35, pdfWidth - 20, pdfHeight * ((pdfWidth - 20) / pdfWidth));

    // Save
    pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'export PDF:", error);
    return false;
  }
};
