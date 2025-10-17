import React, { useState } from 'react';
import { X, Clock, Calendar, Tag, FileText } from 'lucide-react';

export default function TaskCreator({ onClose, onCreateTask, editingTask = null }) {
  const [formData, setFormData] = useState({
    title: editingTask?.title || '',
    description: editingTask?.description || '',
    duration: editingTask?.duration || 60,
    category: editingTask?.category || 'General',
    color: editingTask?.color || 'bg-blue-500',
    isRecurring: editingTask?.isRecurring || false
  });

  const colorOptions = [
    { name: 'Blue', value: 'bg-blue-500' },
    { name: 'Green', value: 'bg-green-500' },
    { name: 'Red', value: 'bg-red-500' },
    { name: 'Purple', value: 'bg-purple-500' },
    { name: 'Orange', value: 'bg-orange-500' },
    { name: 'Pink', value: 'bg-pink-500' },
    { name: 'Indigo', value: 'bg-indigo-500' },
    { name: 'Yellow', value: 'bg-yellow-500' }
  ];

  const categories = [
    'Work', 'Education', 'Fitness', 'Sports', 'Personal', 'Health', 'Social', 'General'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onCreateTask(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingTask ? 'Edit Task Block' : 'Create Task Block'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Soccer Practice"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline mr-1" size={16} />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Optional description of the task..."
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline mr-1" size={16} />
              Duration (minutes)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="480"
              />
              <span className="text-sm text-gray-500">
                ({Math.floor(formData.duration / 60)}h {formData.duration % 60}m)
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline mr-1" size={16} />
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleChange('color', color.value)}
                  className={`w-full h-10 rounded-lg border-2 ${
                    formData.color === color.value
                      ? 'border-gray-400'
                      : 'border-gray-200'
                  } ${color.value} flex items-center justify-center text-white font-medium`}
                >
                  {formData.color === color.value && '✓'}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.isRecurring}
              onChange={(e) => handleChange('isRecurring', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
              <Calendar className="inline mr-1" size={16} />
              This is a recurring task (can be reused across different days)
            </label>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full ${formData.color} mr-3`}></div>
                <div>
                  <h5 className="font-semibold text-gray-900">{formData.title || 'Task Title'}</h5>
                  <p className="text-sm text-gray-500">{formData.category}</p>
                </div>
              </div>
              {formData.description && (
                <p className="text-sm text-gray-600 mb-2">{formData.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="mr-1" size={14} />
                  {Math.floor(formData.duration / 60)}h {formData.duration % 60}m
                </div>
                {formData.isRecurring && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Calendar className="mr-1" size={12} />
                    Recurring
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
