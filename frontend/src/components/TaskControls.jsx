import React from 'react';
import { Filter, ArrowUpDown, Check } from 'lucide-react';

export default function TaskControls({ 
  sortBy, 
  sortOrder, 
  onSortChange,
  activeFilter,
  onFilterChange
}) {
  const sortOptions = [
    { value: 'priority', label: 'Priority' },
    { value: 'duration', label: 'Duration' },
    { value: 'title', label: 'Title' },
    { value: 'category', label: 'Category' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'recurring', label: 'Recurring' }
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      {/* Sort Dropdown */}
      <div className="relative group w-full sm:w-auto">
        <button 
          className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span className="flex items-center">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Sort by: {sortOptions.find(opt => opt.value === sortBy)?.label || 'Select...'}
          </span>
          <svg className="w-5 h-5 ml-2 -mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="absolute z-10 hidden group-hover:block w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="py-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onSortChange(option.value, sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>{option.label}</span>
                {sortBy === option.value && (
                  <span className="text-blue-600">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        {filterOptions.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeFilter === filter.value
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
