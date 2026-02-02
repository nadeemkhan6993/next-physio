'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export default function DateInput({
  label,
  value,
  onChange,
  error,
  required = false,
}: DateInputProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setCurrentMonth(date);
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
        setViewMode('days');
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  const formatDisplayDate = (date: Date | null): string => {
    if (!date || isNaN(date.getTime())) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}`;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    onChange(newDate.toISOString().split('T')[0]); // yyyy-mm-dd format
    setShowCalendar(false);
    setViewMode('days');
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1));
    setViewMode('days');
  };

  const handleYearSelect = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setViewMode('months');
  };

  const changeYear = (delta: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + delta, currentMonth.getMonth(), 1));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const changeMonth = (delta: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Generate year range (current year - 100 to current year + 10)
  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 111 }, (_, i) => currentYear - 100 + i);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={formatDisplayDate(selectedDate)}
          onClick={() => setShowCalendar(!showCalendar)}
          readOnly
          placeholder="DD MMM YY"
          className={`w-full px-4 py-3 pr-12 bg-white/10 border ${
            error ? 'border-red-500' : 'border-gray-600'
          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm transition-all`}
        />
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {showCalendar && (
        <div
          ref={calendarRef}
          className="absolute z-50 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4 min-w-[280px]"
        >
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => viewMode === 'days' ? changeMonth(-1) : changeYear(-1)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                if (viewMode === 'days') setViewMode('months');
                else if (viewMode === 'months') setViewMode('years');
              }}
              className="text-white font-semibold hover:bg-gray-700 px-3 py-1 rounded transition-colors"
            >
              {viewMode === 'days' && `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}
              {viewMode === 'months' && currentMonth.getFullYear()}
              {viewMode === 'years' && `${yearRange[0]} - ${yearRange[yearRange.length - 1]}`}
            </button>
            <button
              type="button"
              onClick={() => viewMode === 'days' ? changeMonth(1) : changeYear(1)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Days View */}
          {viewMode === 'days' && (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {emptyDays.map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}
                {days.map((day) => {
                  const isSelected =
                    selectedDate &&
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === currentMonth.getMonth() &&
                    selectedDate.getFullYear() === currentMonth.getFullYear();

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      className={`aspect-square flex items-center justify-center text-sm rounded transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Months View */}
          {viewMode === 'months' && (
            <div className="grid grid-cols-3 gap-2">
              {monthNamesShort.map((month, index) => {
                const isSelected = selectedDate && selectedDate.getMonth() === index && selectedDate.getFullYear() === currentMonth.getFullYear();
                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleMonthSelect(index)}
                    className={`py-2 px-3 text-sm rounded transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          )}

          {/* Years View */}
          {viewMode === 'years' && (
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {yearRange.map((year) => {
                const isSelected = selectedDate && selectedDate.getFullYear() === year;
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearSelect(year)}
                    className={`py-2 px-3 text-sm rounded transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
