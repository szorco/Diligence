import React, { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

const DRAG_DATA_FORMAT = 'application/x-diligence-task';

export default function WeeklyCalendar({ 
  tasks, 
  selectedDate, 
  onDateSelect, 
  scheduledTasks = [], 
  onScheduleTask,
  onDeleteScheduledTask 
}) {
  const [showTimeSlots, setShowTimeSlots] = useState(true);
  
  // Memoize the week dates to prevent unnecessary recalculations
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  
  // Generate time slots (6 AM to 10 PM)
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

  // Get current week dates
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


  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const extractDraggedTask = (dataTransfer) => {
    if (!dataTransfer) return null;
    const payload = dataTransfer.getData(DRAG_DATA_FORMAT) || dataTransfer.getData('application/json') || dataTransfer.getData('text/plain');
    if (!payload) return null;
    try {
      return JSON.parse(payload);
    } catch (error) {
      console.error('Failed to parse drag payload', error);
      return null;
    }
  };

  const handleDrop = useCallback(async (e, day, timeSlot) => {
    e.preventDefault();
    const draggedTask = extractDraggedTask(e.dataTransfer);
    if (!draggedTask) {
      return;
    }

    const durationMinutes = Number(draggedTask.duration) || 0;
    const estimatedHours = Math.max(1, Math.ceil(durationMinutes / 60));

    const newScheduledTask = {
      ...draggedTask,
      scheduledDay: day,
      scheduledTime: timeSlot.hour,
      endTime: timeSlot.hour + estimatedHours
    };
    
    if (onScheduleTask) {
      await onScheduleTask(newScheduledTask);
    }
  }, [onScheduleTask]);
  
  const handleDeleteScheduledTask = useCallback(async (e, taskId) => {
    e.stopPropagation();
    if (onDeleteScheduledTask) {
      await onDeleteScheduledTask(taskId);
    }
  }, [onDeleteScheduledTask]);

  const getScheduledTasksForSlot = useCallback((day, timeSlot) => {
    if (!scheduledTasks) return [];
    
    return scheduledTasks.filter(task => {
      const taskDay = task.scheduledDay instanceof Date ? task.scheduledDay : new Date(task.scheduledDay);
      return (
        taskDay.getDate() === day.getDate() &&
        taskDay.getMonth() === day.getMonth() &&
        taskDay.getFullYear() === day.getFullYear() &&
        task.scheduledTime === timeSlot.hour
      );
    });
  }, [scheduledTasks]);
  
  const getTasksForDay = useCallback((day) => {
    if (!scheduledTasks) return [];
    
    return scheduledTasks.filter(task => {
      const taskDay = task.scheduledDay instanceof Date ? task.scheduledDay : new Date(task.scheduledDay);
      return (
        taskDay.getDate() === day.getDate() &&
        taskDay.getMonth() === day.getMonth() &&
        taskDay.getFullYear() === day.getFullYear()
      );
    });
  }, [scheduledTasks]);

  const formatDate = useCallback((date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }, []);

  const isToday = useCallback((date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);
  
  const formatTime = useCallback((hour) => {
    return hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  }, []);

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() - 7);
                onDateSelect(newDate);
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Previous week"
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
              aria-label="Next week"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTimeSlots(!showTimeSlots)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <Plus className="mr-2" size={16} />
            {showTimeSlots ? 'Hide' : 'Show'} Time Slots
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-8">
          {/* Time column header */}
          <div className="bg-gray-50 p-4 border-r border-gray-200">
            <div className="text-sm font-medium text-gray-500">Time</div>
          </div>
          
          {/* Day headers */}
          {weekDates.map((day, index) => (
            <div
              key={index}
              className={`p-4 border-r border-gray-200 text-center ${
                isToday(day) ? 'bg-blue-50' : 'bg-gray-50'
              }`}
            >
              <div className={`text-sm font-medium ${
                isToday(day) ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {formatDate(day)}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        {showTimeSlots && timeSlots.map((timeSlot, timeIndex) => (
          <div key={timeIndex} className="grid grid-cols-8 border-t border-gray-200">
            {/* Time label */}
            <div className="bg-gray-50 p-3 border-r border-gray-200 text-sm text-gray-600 flex items-start justify-end">
              <span className="text-xs text-gray-500">{timeSlot.label}</span>
            </div>
            
            {/* Day columns */}
            {weekDates.map((day, dayIndex) => {
              const slotTasks = getScheduledTasksForSlot(day, timeSlot);
              const isCurrentHour = new Date().getHours() === timeSlot.hour && isToday(day);
              
              return (
                <div
                  key={dayIndex}
                  className={`p-1 border-r border-gray-200 min-h-[60px] ${
                    isToday(day) ? 'bg-blue-25' : 'bg-white'
                  } ${isCurrentHour ? 'border-t-2 border-t-blue-500' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, day, timeSlot)}
                >
                  {/* Scheduled tasks for this slot */}
                  {slotTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`${task.color || 'bg-blue-500'} text-white text-xs p-2 rounded flex items-center justify-between`}
                    >
                      <div>
                        <div className="font-medium truncate">{task.title}</div>
                        <div className="text-xs opacity-75">
                          {formatTime(task.scheduledTime)} - {formatTime(task.endTime)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteScheduledTask(e, task.id)}
                        className="p-0.5 opacity-0 group-hover:opacity-100 text-white hover:bg-black/20 rounded-full transition-opacity"
                        aria-label="Delete task"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}

        {/* Simplified view when time slots are hidden */}
        {!showTimeSlots && (
          <div className="grid grid-cols-8 border-t border-gray-200">
            {weekDates.map((day, dayIndex) => {
              const dayTasks = getTasksForDay(day);
              
              return (
                <div
                  key={dayIndex}
                  className={`p-4 border-r border-gray-200 min-h-[200px] ${
                    isToday(day) ? 'bg-blue-25' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium">
                      {day.getDate() === new Date().getDate() && day.getMonth() === new Date().getMonth() ? (
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          {day.getDate()}
                        </span>
                      ) : (
                        <span className="text-gray-700">{day.getDate()}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-2 overflow-y-auto max-h-40">
                    {dayTasks.slice(0, 3).map((task, taskIndex) => (
                      <div
                        key={taskIndex}
                        className={`${task.color || 'bg-blue-500'} text-white text-xs p-2 rounded flex items-center justify-between`}
                      >
                        <div>
                          <div className="font-medium truncate">{task.title}</div>
                          <div className="text-xs opacity-75">
                            {formatTime(task.scheduledTime)} - {formatTime(task.endTime)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteScheduledTask(e, task.id)}
                          className="p-0.5 opacity-0 group-hover:opacity-100 text-white hover:bg-black/20 rounded-full transition-opacity"
                          aria-label="Delete task"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-blue-600 text-center pt-1">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drag Instructions */}
      <div className="text-center text-sm text-gray-500">
        💡 Drag task blocks from the "Task Blocks" tab to schedule them on the calendar
      </div>
    </div>
  );
}
