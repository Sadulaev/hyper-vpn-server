export function formatDateToLocal(date = new Date(), hideTime?: boolean) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const d  = pad(date.getDate());
  const m  = pad(date.getMonth() + 1);
  const y  = date.getFullYear();
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${d}.${m}.${y}${hideTime ? `` : ` ${hh}:${mm}:${ss}`}`;
}
