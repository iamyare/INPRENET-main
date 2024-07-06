import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

export function setPdfMakeVfs() {
  (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
}
