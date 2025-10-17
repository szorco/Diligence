import React, { useState } from 'react';
import { Clock, Calendar, Trash2, Edit3, Copy, CheckCircle } from 'lucide-react';

export default function TaskBlock({ task, onDelete, onEdit, onDuplicate }) {
  const [isHovered, setIsHovered] = useState(false);

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
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 hover:shadow-md ${
        task.completed ? 'opacity-75' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${task.color} mr-3`}></div>
          <div>
            <h3 className="font-semibold text-gray-900">{task.title}</h3>
            <p className="text-sm text-gray-500">{task.category}</p>
          </div>
        </div>
        
        {task.completed && (
          <CheckCircle className="text-green-500" size={20} />
        )}
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
}
