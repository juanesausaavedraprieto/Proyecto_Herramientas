import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export const downloadDecisionReport = async (elementId: string, title: string, authorName: string = 'Usuario') => {
    const element = document.getElementById(elementId);
    if (!element) {
        toast.error("No se encontró el contenido para exportar.");
        return;
    }

    const toastId = toast.loading("Generando reporte PDF corporativo...");

    try {
        // 1. Configuración de captura en Alta Resolución
        const canvas = await html2canvas(element, {
            scale: 3, // Calidad retina
            useCORS: true,
            backgroundColor: '#ffffff', // Forzar fondo blanco
            logging: false
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // 2. Membrete Corporativo (Header)
        pdf.setFillColor(79, 70, 229); // Fondo Indigo-600
        pdf.rect(0, 0, pdfWidth, 20, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("SIATD - Sistema Inteligente de Apoyo a la Toma de Decisiones", 10, 13);

        // 3. Título y Metadatos del Análisis
        pdf.setTextColor(30, 41, 59); // Slate-800
        pdf.setFontSize(18);
        pdf.text(title, 10, 32);

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 116, 139); // Slate-500

        // Fecha formateada
        const date = new Date().toLocaleDateString('es-PE', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        pdf.text(`Generado por: ${authorName} | Fecha: ${date}`, 10, 39);

        // Línea divisoria elegante
        pdf.setDrawColor(226, 232, 240); // Slate-200
        pdf.line(10, 44, pdfWidth - 10, 44);

        // 4. Inserción de Contenido con Paginación Inteligente
        const margin = 10;
        const startY = 50;
        const imgWidth = pdfWidth - (margin * 2);
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let position = startY;

        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - startY);

        // Si el contenido excede la página, creamos hojas nuevas
        while (heightLeft > 0) {
            position = heightLeft - imgHeight + margin; // Calculamos el desplazamiento
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        // 5. Pie de Página Automático (Para todas las hojas generadas)
        const pageCount = (pdf.internal as any).getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(148, 163, 184);

            // Número de página centrado
            pdf.text(`Página ${i} de ${pageCount}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });

            // Marca de confidencialidad
            pdf.text("Documento de uso interno y confidencial.", 10, pdfHeight - 10);
        }

        // 6. Descarga y notificación
        pdf.save(`SIATD_Reporte_${title.replace(/\s+/g, '_')}.pdf`);
        toast.success("¡Reporte descargado con éxito!", { id: toastId });

    } catch (error) {
        console.error("Error creando el PDF:", error);
        toast.error("Ocurrió un error al compilar el documento.", { id: toastId });
    }
};