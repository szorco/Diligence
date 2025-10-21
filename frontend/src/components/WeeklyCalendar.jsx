import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function WeeklyCalendar({ tasks, selectedDate, onDateSelect }) {
  const [draggedTask, setDraggedTask] = useState(null);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  // Generate time slots (6 AM to 10 PM)
  const timeSlots = [];
  for (let hour = 6; hour <= 22; hour++) {
    timeSlots.push({
      hour,
      label: hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`
    });
  }

  // Get current week dates
  const getWeekDates = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(selectedDate);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, day, timeSlot) => {
    e.preventDefault();
    
    if (draggedTask) {
      const newScheduledTask = {
        ...draggedTask,
        id: Date.now(),
        scheduledDay: day,
        scheduledTime: timeSlot.hour,
        endTime: timeSlot.hour + Math.ceil(draggedTask.duration / 60)
      };
      
      setScheduledTasks([...scheduledTasks, newScheduledTask]);
      setDraggedTask(null);
    }
  };

  const getScheduledTasksForSlot = (day, timeSlot) => {
    return scheduledTasks.filter(task => 
      task.scheduledDay.getDate() === day.getDate() &&
      task.scheduledTime === timeSlot.hour
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

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
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() + 7);
                onDateSelect(newDate);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setShowTimeSlots(!showTimeSlots)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
        >
          <Plus className="mr-2" size={16} />
          {showTimeSlots ? 'Hide' : 'Show'} Time Slots
        </button>
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
            <div className="bg-gray-50 p-3 border-r border-gray-200 text-sm text-gray-600">
              {timeSlot.label}
            </div>
            
            {/* Day columns */}
            {weekDates.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`p-2 border-r border-gray-200 min-h-[60px] ${
                  isToday(day) ? 'bg-blue-25' : 'bg-white'
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day, timeSlot)}
              >
                {/* Scheduled tasks for this slot */}
                {getScheduledTasksForSlot(day, timeSlot).map((task, taskIndex) => (
                  <div
                    key={taskIndex}
                    className={`${task.color} text-white text-xs p-2 rounded mb-1 cursor-move hover:shadow-md transition-all duration-200 transform hover:scale-105`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                  >
                    <div className="font-medium truncate">{task.title}</div>
                    <div className="opacity-75">
                      {timeSlot.hour}:00 - {task.endTime}:00
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}

        {/* Simplified view when time slots are hidden */}
        {!showTimeSlots && (
          <div className="grid grid-cols-8">
            {weekDates.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`p-4 border-r border-gray-200 min-h-[200px] ${
                  isToday(day) ? 'bg-blue-25' : 'bg-white'
                }`}
              >
                <div className="text-sm text-gray-500 mb-2">
                  {scheduledTasks.filter(task => 
                    task.scheduledDay.getDate() === day.getDate()
                  ).length} tasks scheduled
                </div>
                
                {/* Show scheduled tasks for this day */}
                {scheduledTasks
                  .filter(task => task.scheduledDay.getDate() === day.getDate())
                  .map((task, taskIndex) => (
                    <div
                      key={taskIndex}
                      className={`${task.color} text-white text-xs p-2 rounded mb-1`}
                    >
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="opacity-75">
                        {task.scheduledTime}:00 - {task.endTime}:00
                      </div>
                    </div>
                  ))}
              </div>
            ))}
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
