import React from 'react';
import { TrendingUp, Clock, Target, Award, Calendar, BarChart3 } from 'lucide-react';

export default function ProgressStats({ tasks }) {
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const totalTimeBlocked = tasks.reduce((acc, task) => acc + task.duration, 0);
  const completedTime = tasks
    .filter(task => task.completed)
    .reduce((acc, task) => acc + task.duration, 0);
  
  const timeCompletionRate = totalTimeBlocked > 0 ? Math.round((completedTime / totalTimeBlocked) * 100) : 0;
  
  // Category breakdown
  const categoryStats = tasks.reduce((acc, task) => {
    const category = task.category || 'General';
    if (!acc[category]) {
      acc[category] = { total: 0, completed: 0, time: 0 };
    }
    acc[category].total += 1;
    if (task.completed) {
      acc[category].completed += 1;
    }
    acc[category].time += task.duration;
    return acc;
  }, {});

  // Weekly progress (mock data for demonstration)
  const weeklyProgress = [
    { day: 'Mon', completed: 3, total: 5 },
    { day: 'Tue', completed: 4, total: 6 },
    { day: 'Wed', completed: 2, total: 4 },
    { day: 'Thu', completed: 5, total: 5 },
    { day: 'Fri', completed: 3, total: 7 },
    { day: 'Sat', completed: 1, total: 3 },
    { day: 'Sun', completed: 2, total: 4 }
  ];

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Progress Overview</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Task Completion</p>
              <p className="text-3xl font-bold text-blue-900">{completionRate}%</p>
              <p className="text-sm text-blue-700">{completedTasks} of {totalTasks} tasks</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <Target className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Time Completed</p>
              <p className="text-3xl font-bold text-green-900">{timeCompletionRate}%</p>
              <p className="text-sm text-green-700">{formatTime(completedTime)} of {formatTime(totalTimeBlocked)}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <Clock className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Productivity Score</p>
              <p className="text-3xl font-bold text-purple-900">
                {Math.round((completionRate + timeCompletionRate) / 2)}
              </p>
              <p className="text-sm text-purple-700">Overall performance</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Streak</p>
              <p className="text-3xl font-bold text-orange-900">7</p>
              <p className="text-sm text-orange-700">Days in a row</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-full">
              <Award className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
        <div className="space-y-4">
          {weeklyProgress.map((day, index) => {
            const percentage = day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0;
            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {day.completed}/{day.total}
                </div>
                <div className="w-12 text-sm font-medium text-gray-900 text-right">
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Category</h3>
        <div className="space-y-4">
          {Object.entries(categoryStats).map(([category, stats]) => {
            const categoryCompletionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            return (
              <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">{category}</span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Tasks</div>
                    <div className="font-semibold text-gray-900">
                      {stats.completed}/{stats.total}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="font-semibold text-gray-900">
                      {formatTime(stats.time)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Rate</div>
                    <div className="font-semibold text-gray-900">
                      {categoryCompletionRate}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">💡 Productivity Tip</h4>
            <p className="text-sm text-gray-600">
              {completionRate > 80 
                ? "Great job! You're maintaining excellent productivity. Keep up the momentum!"
                : completionRate > 60
                ? "Good progress! Try breaking down larger tasks into smaller, manageable chunks."
                : "Consider using the Pomodoro Technique to improve focus and task completion."
              }
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">🎯 Next Steps</h4>
            <p className="text-sm text-gray-600">
              {totalTasks < 5
                ? "Create more task blocks to better organize your schedule and track progress."
                : "Review your recurring tasks and optimize their scheduling for better efficiency."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
