import { BellIcon, MenuIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { CalendarGeneralByAnima } from "./sections/CalendarGeneralByAnima";
import { FrameByAnima } from "./sections/FrameByAnima";
import dayjs from 'dayjs';

export const FrameScreen = (): JSX.Element => {
  const today = dayjs().date();
  const [selectedDate, setSelectedDate] = useState<number>(today);

  const handleDateSelect = (date: number) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFE45C] to-[#FFFBEA] flex flex-row justify-center w-full py-6">
      <div className="w-full max-w-[402px]">
        <header className="flex items-center justify-between h-14 px-5 mb-4">
          <button className="p-2">
            <MenuIcon className="w-5 h-5" />
          </button>

          <h1 className="absolute left-1/2 transform -translate-x-1/2 font-bold text-[20px] text-black">
            優惠日曆
          </h1>

          <button className="p-2">
            <BellIcon className="w-5 h-5" />
          </button>
        </header>

        <main className="flex flex-col w-full gap-5 px-5">
          <CalendarGeneralByAnima onDateSelect={handleDateSelect} />
          <FrameByAnima selectedDate={selectedDate} />
        </main>
      </div>
    </div>
  );
}