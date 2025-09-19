export function addMonthsPlusOneDay(months: number, base: Date = new Date()): Date {
  const d = new Date(base.getTime());          // не мутируем исходную
  d.setMonth(d.getMonth() + months);           // добавляем месяцы (JS сам обработает конец месяца)
  d.setDate(d.getDate() + 1);                  // + 1 день
  return d;                                    // локальная дата/время
}