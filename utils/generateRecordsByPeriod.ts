type RecordType = { date: string; isPaid: boolean; sum: number | null }

export default (startDate: string, endDate: string, period: 'month' | 'week', sum?: number): RecordType[] => {
    const result: RecordType[] = [];
    
    // Преобразуем строки в объекты Date
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
  
    while (currentDate <= end && result.length < 100) {
      const formattedDate = currentDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      result.push({
        date: formattedDate,
        isPaid: false,
        sum: sum || null,
      });
  
      // Переходим к следующему месяцу
      if(period === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      if(period === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }
  
    console.log(result)
    return result;
  }