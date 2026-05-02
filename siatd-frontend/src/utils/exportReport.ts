import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const downloadDecisionReport = async (elementId: string, title: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.text(`Reporte de Decisión: ${title}`, 10, 10);
    pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
    pdf.save(`SIATD_Reporte_${title.replace(/\s+/g, '_')}.pdf`);
};