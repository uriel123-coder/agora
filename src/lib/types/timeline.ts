export type TimelineLine = "hebrea-judia" | "mundial" | "mexico";

export interface TimelineEvent {
  id: string;
  rowIndex: number;
  etapa?: string;
  line: TimelineLine;
  title: string;
  yearGregorian?: number;
  yearHebrew?: string;
  period?: string;
  source?: string;
  author?: string;
}

export interface TimelineBundle {
  events: TimelineEvent[];
  etapas: string[];
  totalRows: number;
  source: "google-sheets" | "empty";
  sheetTitle: string;
}
