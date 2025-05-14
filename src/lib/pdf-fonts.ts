import { jsPDF } from 'jspdf';

// Add custom fonts to jsPDF for proper Turkish character support
export const addCustomFonts = (doc: jsPDF) => {
  // Register normal font
  doc.addFont('https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf', 'Roboto', 'normal');
  
  // Register bold font
  doc.addFont('https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', 'Roboto', 'bold');
  
  // Set default font
  doc.setFont('Roboto');
  
  return doc;
};

// Helper function to safely handle Turkish characters
export const safeText = (text: string): string => {
  if (!text) return '';
  // Convert Turkish characters to their English equivalents
  return text
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/₺/g, 'TL');
};
