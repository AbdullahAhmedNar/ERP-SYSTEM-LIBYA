import { format } from 'date-fns';

/** تنسيق التاريخ بصيغة يوم/شهر/سنة (dd/MM/yyyy) لعرضه في الجداول والواجهات */
export function formatDateDMY(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '';
  return format(d, 'dd/MM/yyyy');
}

