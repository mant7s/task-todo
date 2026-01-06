
import React, { useState } from 'react';
import { Task } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // 填充月初前的空白 (调整周日为 0)
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // 填充当月天数
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getTasksForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-800">{year}年 {monthNames[month]}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center border-b border-slate-100">
        {["日", "一", "二", "三", "四", "五", "六"].map(day => (
          <div key={day} className="py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[120px]">
        {days.map((day, idx) => {
          const dayTasks = day ? getTasksForDay(day) : [];
          return (
            <div key={idx} className={`p-2 border-r border-b border-slate-50 relative group ${!day ? 'bg-slate-50/30' : 'hover:bg-indigo-50/20 transition-colors'}`}>
              {day && (
                <>
                  <span className={`text-sm font-semibold inline-block w-7 h-7 leading-7 text-center rounded-full mb-1 ${isToday(day) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600'}`}>
                    {day}
                  </span>
                  <div className="space-y-1 overflow-y-auto max-h-[80px] no-scrollbar">
                    {dayTasks.map(task => (
                      <div key={task.id} className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${task.completed ? 'bg-slate-100 text-slate-400 border-slate-200 line-through' : 'bg-white text-indigo-700 border-indigo-100 shadow-sm'}`}>
                        {task.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
