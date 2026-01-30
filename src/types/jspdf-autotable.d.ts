declare module 'jspdf-autotable' {
  import jsPDF from 'jspdf';

  export interface CellDef {
    content?: string | number;
    colSpan?: number;
    rowSpan?: number;
    styles?: Partial<Styles>;
  }

  export interface ColumnInput {
    header?: string;
    dataKey?: string;
  }

  export interface Styles {
    font?: string;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
    fillColor?: [number, number, number] | number | string | false;
    textColor?: [number, number, number] | number | string;
    cellWidth?: 'auto' | 'wrap' | number;
    minCellWidth?: number;
    minCellHeight?: number;
    halign?: 'left' | 'center' | 'right' | 'justify';
    valign?: 'top' | 'middle' | 'bottom';
    fontSize?: number;
    cellPadding?: number;
    lineColor?: [number, number, number] | number | string;
    lineWidth?: number;
  }

  export interface UserOptions {
    includeHiddenHtml?: boolean;
    useCss?: boolean;
    theme?: 'striped' | 'grid' | 'plain';
    startY?: number | false;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number; horizontal?: number; vertical?: number };
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    tableWidth?: 'auto' | 'wrap' | number;
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    tableLineColor?: [number, number, number] | number | string;
    tableLineWidth?: number;
    
    head?: (string | CellDef)[][];
    body?: (string | number | CellDef)[][];
    foot?: (string | CellDef)[][];
    
    html?: string | HTMLTableElement;
    
    columns?: ColumnInput[];
    columnStyles?: { [key: string]: Partial<Styles> } | { [key: number]: Partial<Styles> };
    styles?: Partial<Styles>;
    headStyles?: Partial<Styles>;
    bodyStyles?: Partial<Styles>;
    footStyles?: Partial<Styles>;
    alternateRowStyles?: Partial<Styles>;
    
    didDrawPage?: (data: any) => void;
    didDrawCell?: (data: any) => void;
    didParseCell?: (data: any) => void;
    willDrawCell?: (data: any) => boolean | void;
    willDrawPage?: (data: any) => void;
  }

  export function autoTable(doc: jsPDF, options: UserOptions): void;
  export default autoTable;
}