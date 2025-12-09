import React, { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useDrop } from "react-dnd";

function TimeSlotCell({
  day,
  timeSlot,
  getTasksForDay,
  formatTime,
  isToday,
  isCurrentHour,
  onScheduleTask,
  handleDeleteScheduledTask,
  findNextAvailableStart
}) {
  const tasksForDay = getTasksForDay(day);

  const slotTasks = tasksForDay.filter(
    (t) => Number(t.scheduledTime) === timeSlot.hour
  );

  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: "TASK_BLOCK",

    drop: (item) => {
      if (!item?.task || !onScheduleTask) return;

      const durationMinutes = item.task.duration ?? 60;

      const result = findNextAvailableStart(
        day,
        timeSlot.hour,
        durationMinutes
      );

      if (!result) return;

      const newTask = {
        ...item.task,
        scheduledDay: day,
        scheduledTime: result.start,
        endTime: result.end,
      };

      onScheduleTask(newTask);
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={dropRef}
      className={`
        p-1 border-r border-gray-200 min-h-[60px]
        ${isToday(day) ? "bg-blue-25" : "bg-white"}
        ${isCurrentHour ? "border-t-2 border-t-blue-500" : ""}
        ${isOver && canDrop ? "bg-blue-50" : ""}
      `}
    >
      {slotTasks.map((task) => (
        <div
          key={task.id}
          className={`${task.color || "bg-blue-500"} text-white text-xs p-2 rounded flex items-center justify-between`}
        >
          <div>
            <div className="font-medium truncate">{task.title}</div>
            <div className="text-xs opacity-75">
              {formatTime(task.scheduledTime)} - {formatTime(task.endTime)}
            </div>
          </div>

          <button
            onClick={(e) => handleDeleteScheduledTask(e, task.id)}
            className="p-0.5 text-white hover:bg-black/20 rounded-full transition-opacity"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function WeeklyCalendar({
  tasks,
  selectedDate,
  onDateSelect,
  scheduledTasks = [],
  onScheduleTask,
  onDeleteScheduledTask
}) {
  const [showTimeSlots, setShowTimeSlots] = useState(true);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push({
        hour,
        label: hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`
      });
    }
    return slots;
  }, []);

  function getWeekDates(date) {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  }

  const handleDeleteScheduledTask = useCallback(async (e, taskId) => {
    e.stopPropagation();
    if (onDeleteScheduledTask) {
      await onDeleteScheduledTask(taskId);
    }
  }, [onDeleteScheduledTask]);

  const getTasksForDay = useCallback((day) => {
    return scheduledTasks.filter((task) => {
      const taskDay = new Date(task.scheduledDay);
      return (
        taskDay.getDate() === day.getDate() &&
        taskDay.getMonth() === day.getMonth() &&
        taskDay.getFullYear() === day.getFullYear()
      );
    });
  }, [scheduledTasks]);

  const findNextAvailableStart = useCallback(
    (day, desiredStartHour, durationMinutes) => {
      const tasksForDay = scheduledTasks.filter(task => {
        const d = new Date(task.scheduledDay);
        return (
          d.getDate() === day.getDate() &&
          d.getMonth() === day.getMonth() &&
          d.getFullYear() === day.getFullYear()
        );
      });

      const durationHours = durationMinutes / 60;
      let start = desiredStartHour;
      const dayEnd = 22;

      while (true) {
        const end = start + durationHours;
        if (end > dayEnd) return null;

        const conflict = tasksForDay.some(task => {
          const s = Number(task.scheduledTime);
          const e = Number(task.endTime);
          return start < e && s < end;
        });

        if (!conflict) return { start, end };

        start += durationHours;
      }
    },
    [scheduledTasks]
  );

  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const isToday = useCallback((date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);

  const formatTime = useCallback((hourValue) => {
    const hourNum = Number(hourValue);
    const wholeHours = Math.floor(hourNum);
    const fractional = hourNum - wholeHours;
    const minutes = Math.round(fractional * 60);

    const labelHour =
      wholeHours === 0 ? 12 : wholeHours > 12 ? wholeHours - 12 : wholeHours;

    const ampm = wholeHours >= 12 ? 'PM' : 'AM';

    const minuteStr =
      minutes === 0 ? '' : `:${minutes.toString().padStart(2, '0')}`;

    return `${labelHour}${minuteStr} ${ampm}`;
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </h3>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() - 7);
                onDateSelect(newDate);
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={() => onDateSelect(new Date())}
              className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
            >
              Today
            </button>

            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() + 7);
                onDateSelect(newDate);
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowTimeSlots(!showTimeSlots)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="mr-2" size={16} />
          {showTimeSlots ? "Hide" : "Show"} Time Slots
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-8">
          <div className="bg-gray-50 p-4 border-r border-gray-200">
            <div className="text-sm font-medium text-gray-500">Time</div>
          </div>

          {weekDates.map((day, index) => (
            <div
              key={index}
              className={`p-4 border-r border-gray-200 text-center ${
                isToday(day) ? "bg-blue-50" : "bg-gray-50"
              }`}
            >
              <div
                className={`text-sm font-medium ${
                  isToday(day) ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {formatDate(day)}
              </div>
            </div>
          ))}
        </div>

        {showTimeSlots &&
          timeSlots.map((timeSlot, timeIndex) => (
            <div
              key={timeIndex}
              className="grid grid-cols-8 border-t border-gray-200"
            >
              <div className="bg-gray-50 p-3 border-r border-gray-200 text-xs text-gray-500 flex items-start justify-end">
                {timeSlot.label}
              </div>

              {weekDates.map((day, dayIndex) => {
                const isCurrentHour =
                  new Date().getHours() === timeSlot.hour &&
                  isToday(day);

                return (
                  <TimeSlotCell
                    key={dayIndex}
                    day={day}
                    timeSlot={timeSlot}
                    getTasksForDay={getTasksForDay}
                    formatTime={formatTime}
                    isToday={isToday}
                    isCurrentHour={isCurrentHour}
                    onScheduleTask={onScheduleTask}
                    handleDeleteScheduledTask={handleDeleteScheduledTask}
                    findNextAvailableStart={findNextAvailableStart}
                  />
                );
              })}
            </div>
          ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        💡 Drag task blocks from the "Task Blocks" tab to schedule them on the calendar
      </div>
    </div>
  );
}
