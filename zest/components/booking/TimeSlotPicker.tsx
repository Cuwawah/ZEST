"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAvailableSlots } from "@/app/actions/availability";
import { nextDaysInTz, formatDateTimeInTz } from "@/lib/dates";

interface TimeSlotPickerProps {
  eventTypeId: string;
  onSelectSlot: (timestamp: number) => void;
  selectedSlot?: number;
  timezone?: string | null;
}

export default function TimeSlotPicker({
  eventTypeId,
  onSelectSlot,
  selectedSlot,
  timezone,
}: TimeSlotPickerProps) {
  const tz = timezone || "Africa/Lagos";
  const days = nextDaysInTz(tz, 14);
  const [selectedDate, setSelectedDate] = useState<string>(days[0].date);

  const { data: slots, isLoading } = useQuery({
    queryKey: ["slots", eventTypeId, selectedDate],
    queryFn: () =>
      getAvailableSlots(eventTypeId, selectedDate, selectedDate),
  });

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="time-slot-picker">
      <div className="date-scroller">
        {days.map((day) => (
          <button
            key={day.date}
            className={`date-btn ${selectedDate === day.date ? "selected" : ""}`}
            onClick={() => handleDateSelect(day.date)}
          >
            <span className="date-day">{day.day}</span>
            <span className="date-num">{day.dayNum}</span>
            <span className="date-month">{day.month}</span>
          </button>
        ))}
      </div>

      <div className="slots-container">
        <h3 className="slots-title">
          Available times for{" "}
          {days.find((d) => d.date === selectedDate)
            ? formatDateTimeInTz(
                days.find((d) => d.date === selectedDate)!.ts,
                tz,
                { weekday: "long", month: "long", day: "numeric" }
              )
            : ""}
        </h3>

        {isLoading ? (
          <div className="loading">Loading available times...</div>
        ) : !slots || slots.length === 0 ? (
          <div className="no-slots">
            <p>No available times for this date.</p>
            <p className="no-slots-hint">Please select another date.</p>
          </div>
        ) : (
          <div className="slots-grid">
            {slots.map((slot) => (
              <button
                key={slot.timestamp}
                className={`slot-btn ${selectedSlot === slot.timestamp ? "selected" : ""}`}
                onClick={() => onSelectSlot(slot.timestamp)}
              >
                {formatTime(slot.timestamp)}
                {slot.spotsLeft !== undefined && slot.spotsLeft < 3 && (
                  <span className="spots-left">
                    {slot.spotsLeft === 1 ? "1 left" : `${slot.spotsLeft} left`}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .time-slot-picker { width: 100%; }

        .date-scroller {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 16px;
          margin-bottom: 24px;
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
        }

        .date-scroller::-webkit-scrollbar { height: 4px; }
        .date-scroller::-webkit-scrollbar-thumb { background: #e8e4cc; border-radius: 4px; }

        .date-btn {
          min-width: 70px;
          padding: 12px 8px;
          background: #fdfcf5;
          border: 1.5px solid #e8e4cc;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: "DM Sans", sans-serif;
        }

        .date-btn:hover { border-color: #f5c518; background: rgba(245, 197, 24, 0.04); }
        .date-btn.selected { background: #f5c518; border-color: #f5c518; }

        .date-day { font-size: 11px; font-weight: 500; color: #7a7a60; text-transform: uppercase; }
        .date-btn.selected .date-day { color: #1a1a0f; }
        .date-num { font-size: 18px; font-weight: 600; color: #1a1a0f; line-height: 1.2; }
        .date-month { font-size: 11px; color: #a0a080; }
        .date-btn.selected .date-month { color: #1a1a0f; }

        .slots-container {
          background: #fdfcf5;
          border: 1.5px solid #e8e4cc;
          border-radius: 16px;
          padding: 24px;
        }

        .slots-title { font-size: 16px; font-weight: 500; color: #1a1a0f; margin: 0 0 20px; }

        .loading { text-align: center; padding: 40px; color: #7a7a60; font-size: 14px; }

        .no-slots { text-align: center; padding: 40px; }
        .no-slots p { margin: 0 0 8px; color: #7a7a60; font-size: 14px; }
        .no-slots-hint { font-size: 13px; color: #a0a080; }

        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
        }

        .slot-btn {
          position: relative;
          padding: 12px;
          background: white;
          border: 1.5px solid #e8e4cc;
          border-radius: 10px;
          font-size: 14px;
          font-family: "DM Sans", sans-serif;
          color: #1a1a0f;
          cursor: pointer;
          transition: all 0.15s;
          text-align: center;
        }

        .spots-left {
          display: block;
          margin-top: 2px;
          font-size: 10.5px;
          font-weight: 600;
          color: #b45309;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .slot-btn.selected .spots-left { color: #1a1a0f; }

        .slot-btn:hover { border-color: #f5c518; background: rgba(245, 197, 24, 0.04); transform: translateY(-1px); }
        .slot-btn.selected { background: #f5c518; border-color: #f5c518; font-weight: 500; }

        @media (max-width: 480px) {
          .slots-grid { grid-template-columns: repeat(2, 1fr); }
          .date-btn { min-width: 60px; padding: 10px 6px; }
          .date-num { font-size: 16px; }
        }
      `}</style>
    </div>
  );
}
