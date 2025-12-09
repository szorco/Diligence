import React, { useState } from 'react';
import { Clock, Calendar, Trash2, Edit3, Copy, CheckCircle, Flag } from 'lucide-react';
import { useDrag } from "react-dnd";

export default function TaskBlock({ task, onDelete, onEdit, onDuplicate, onToggleComplete }) {
  const [isHovered, setIsHovered] = useState(false);

  
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "TASK_BLOCK",
    item: { task }, 
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })); 

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(task);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
  };

  return (
    <div
      ref={dragRef}  
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-4
        transition-all duration-200 hover:shadow-md cursor-grab active:cursor-grabbing
        ${task.completed ? 'opacity-75' : ''}
        ${isDragging ? 'opacity-50' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${task.color} mb-1`}></div>
            {task.priority && (
              <Flag 
                size={12} 
                className={`${getPriorityColor(task.priority)} ${task.completed ? 'opacity-50' : ''}`} 
                fill={task.priority.toLowerCase() === 'high' ? 'currentColor' : 'none'}
              />
            )}
          </div>
          <div>
            <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            <p className="text-sm text-gray-500">{task.category}</p>
          </div>
        </div>
        
        <button
          onClick={() => onToggleComplete && onToggleComplete(task.id)}
          className={`p-1 rounded-full transition-colors ${
            task.completed 
              ? 'text-green-500 hover:text-green-600' 
              : 'text-gray-300 hover:text-green-500'
          }`}
          title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <CheckCircle size={20} className={task.completed ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      )}

      {/* Duration and Recurring Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="mr-1" size={14} />
          {formatDuration(task.duration)}
        </div>
        
        {task.isRecurring && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Calendar className="mr-1" size={12} />
            Recurring
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className={`flex items-center space-x-2 transition-opacity duration-200 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <button
          onClick={handleDuplicate}
          className="flex items-center px-3 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
        >
          <Copy className="mr-1" size={12} />
          Duplicate
        </button>
        
        <button
          onClick={handleEdit}
          className="flex items-center px-3 py-1 text-xs text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition"
        >
          <Edit3 className="mr-1" size={12} />
          Edit
        </button>
        
        <button
          onClick={handleDelete}
          className="flex items-center px-3 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition"
        >
          <Trash2 className="mr-1" size={12} />
          Delete
        </button>
      </div>

      {/* Drag Handle */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-center text-gray-400 text-xs">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          </div>
          <span className="ml-2">Drag to schedule</span>
        </div>
      </div>
    </div>
  );
} //here
