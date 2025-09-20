import jsPDF from 'jspdf';

export interface PDFOptions {
  qrCodesPerPage: number;
  qrCodes: Array<{
    id: string;
    qrCodeUrl: string;
    productName?: string;
  }>;
}

export const generateQRCodesPDF = ({ qrCodesPerPage, qrCodes }: PDFOptions): jsPDF => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  
  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(qrCodesPerPage));
  const rows = Math.ceil(qrCodesPerPage / cols);
  
  const cellWidth = (pageWidth - margin * 2) / cols;
  const cellHeight = (pageHeight - margin * 2) / rows;
  
  let currentPage = 1;
  let itemsOnCurrentPage = 0;
  
  qrCodes.forEach((qrCode, index) => {
    if (itemsOnCurrentPage >= qrCodesPerPage) {
      pdf.addPage();
      currentPage++;
      itemsOnCurrentPage = 0;
    }
    
    const col = itemsOnCurrentPage % cols;
    const row = Math.floor(itemsOnCurrentPage / cols);
    
    const x = margin + col * cellWidth;
    const y = margin + row * cellHeight;
    
    // Add QR code image
    try {
      const qrSize = Math.min(cellWidth, cellHeight) * 0.6;
      const qrX = x + (cellWidth - qrSize) / 2;
      const qrY = y + 10;
      
      pdf.addImage(qrCode.qrCodeUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      
      // Add product name if available
      if (qrCode.productName) {
        pdf.setFontSize(8);
        pdf.text(qrCode.productName, x + cellWidth / 2, qrY + qrSize + 15, { 
          align: 'center',
          maxWidth: cellWidth - 10
        });
      }
    } catch (error) {
      console.error('Error adding QR code to PDF:', error);
    }
    
    itemsOnCurrentPage++;
  });
  
  return pdf;
};