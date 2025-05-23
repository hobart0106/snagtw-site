import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { supabase } from "../../../../lib/supabase";

dayjs.extend(utc);
dayjs.extend(timezone);

interface DateItem {
  day: number;
  hasPromo: boolean;
  isToday: boolean;
  color: string;
}

interface CalendarGeneralByAnimaProps {
  onDateSelect: (date: number) => void;
}

function getTaipeiToday() {
  return dayjs().tz('Asia/Taipei');
}

const getDateColor = (dateObj: dayjs.Dayjs, promoRanges: {start: string; end: string}[]) => {
  const today = getTaipeiToday();
  const dateStr = dateObj.format('YYYY-MM-DD');
  
  const hasPromotion = promoRanges.some(range => 
    dateStr >= range.start && dateStr <= range.end
  );
  
  const isPast = dateObj.isBefore(today, 'day');
  
  if (hasPromotion && !isPast) return "#FFAB35";  // 有活動（未來或今日）
  if (hasPromotion && isPast) return "#666666";   // 有活動但過期
  return "#999999";                               // 無活動
};

export const CalendarGeneralByAnima = ({ onDateSelect }: CalendarGeneralByAnimaProps): JSX.Element => {
  const today = getTaipeiToday();
  const [selectedDate, setSelectedDate] = useState<number | null>(today.date());
  const [isExpanded, setIsExpanded] = useState(false);
  const [dates, setDates] = useState<DateItem[]>([]);
  const [promoRanges, setPromoRanges] = useState<{start: string; end: string}[]>([]);
  
  const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  useEffect(() => {
    const fetchPromoRanges = async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('start_date, end_date');
      
      if (!error && data) {
        setPromoRanges(data.map(promo => ({
          start: promo.start_date,
          end: promo.end_date
        })));
      }
    };

    fetchPromoRanges();
  }, []);

  const isDateInPromoRange = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    return promoRanges.some(range => 
      dateStr >= range.start && dateStr <= range.end
    );
  };

  useEffect(() => {
    const currentDate = today.date();
    const startOfWeek = today.startOf('week');
    const datesData: DateItem[] = [];

    if (isExpanded) {
      // Show full month view when expanded
      const startOfMonth = today.startOf('month');
      const daysInMonth = today.daysInMonth();
      const firstDayOfMonth = startOfMonth.day(); // 0 = Sunday, 1 = Monday, etc.
      const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start
      
      // Add empty slots for days before the first of the month
      for (let i = 0; i < adjustedFirstDay; i++) {
        datesData.push({
          day: 0,
          hasPromo: false,
          isToday: false,
          color: "#999999"
        });
      }
      
      // Add the actual days of the month
      for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
        const dateObj = today.date(dayNumber);
        const hasPromo = isDateInPromoRange(dateObj);
        
        datesData.push({
          day: dayNumber,
          hasPromo,
          isToday: dayNumber === currentDate,
          color: getDateColor(dateObj, promoRanges)
        });
      }
      
      // Add empty slots to complete the grid
      const totalDays = Math.ceil((daysInMonth + adjustedFirstDay) / 7) * 7;
      const remainingSlots = totalDays - datesData.length;
      for (let i = 0; i < remainingSlots; i++) {
        datesData.push({
          day: 0,
          hasPromo: false,
          isToday: false,
          color: "#999999"
        });
      }
    } else {
      // Show current week view when collapsed
      for (let i = 0; i < 7; i++) {
        const currentDay = startOfWeek.add(i, 'day');
        const dayNumber = currentDay.date();
        const hasPromo = isDateInPromoRange(currentDay);
        
        datesData.push({
          day: dayNumber,
          hasPromo,
          isToday: dayNumber === currentDate,
          color: getDateColor(currentDay, promoRanges)
        });
      }
    }

    setDates(datesData);
    
    if (!selectedDate) {
      setSelectedDate(currentDate);
      onDateSelect(currentDate);
    }
  }, [isExpanded, promoRanges]);

  const handleDateClick = (date: DateItem) => {
    if (date.day > 0) {
      setSelectedDate(date.day);
      onDateSelect(date.day);
    }
  };

  const toggleCalendar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="w-full bg-white rounded-[16px] shadow-lg border-0">
      <CardContent className="p-4">
        <div className="relative w-full flex justify-between items-center mb-6">
          <h2 className="font-bold text-light-primary text-xl">
            {today.format('YYYY/M/D')}
          </h2>
          <button 
            onClick={toggleCalendar}
            className="transition-transform duration-300"
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-6 h-6" />
            ) : (
              <ChevronDownIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day, index) => (
              <div
                key={index}
                className="font-medium text-light-primary text-center"
              >
                {day}
              </div>
            ))}
          </div>

          <div 
            className={`grid grid-cols-7 gap-1 transition-all duration-300 ease-in-out ${
              isExpanded ? 'h-auto' : 'h-[43px]'
            } overflow-hidden`}
          >
            {dates.map((date, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={date.day === 0}
                className={`flex justify-center items-center h-[43px] rounded-full transition-colors duration-200 ${
                  date.day === 0
                    ? "invisible"
                    : date.isToday
                    ? "bg-black text-white"
                    : date.day === selectedDate
                    ? "bg-[#FFAB35] text-white"
                    : `text-[${date.color}]`
                }`}
              >
                <span className="font-medium text-[18.3px]">
                  {date.day > 0 ? date.day : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};