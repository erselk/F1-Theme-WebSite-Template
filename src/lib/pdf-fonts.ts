import { jsPDF } from 'jspdf';

export const addCustomFonts = (doc: jsPDF) => {
  doc.addFont('https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf', 'Roboto', 'normal');
  doc.addFont('https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', 'Roboto', 'bold');
  doc.setFont('Roboto');
  return doc;
};

export const safeText = (text: string): string => {
  if (!text) return '';
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
