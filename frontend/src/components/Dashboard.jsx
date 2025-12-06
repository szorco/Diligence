import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Calendar, Clock, CheckCircle, BarChart3, Settings, User, Bell, Loader2, LogOut, Flame, Zap } from 'lucide-react';
import TaskControls from './TaskControls';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import TaskBlock from './TaskBlock';
import WeeklyCalendar from './WeeklyCalendar';
import TaskCreator from './TaskCreator';
import ProgressStats from './ProgressStats';
import Notification from './Notification';

const derivePriority = (task) => {
  if (task.priority) {
    return task.priority.toLowerCase();
  }
  const duration = Number(task.duration) || 0;
  if (duration >= 120) return 'high';
  if (duration >= 60) return 'medium';
  return 'low';
};

const normalizeTask = (task) => {
  const duration = Number(task.duration) || 0;
  const createdAt = task.created_at || task.createdAt;
  const updatedAt = task.updated_at || task.updatedAt;

  return {
    ...task,
    duration,
    color: task.color || 'bg-blue-500',
    category: task.category || 'General',
    isRecurring: task.is_recurring ?? task.isRecurring ?? false,
    priority: derivePriority({ ...task, duration }),
    createdAt: createdAt ? new Date(createdAt) : null,
    updatedAt: updatedAt ? new Date(updatedAt) : null,
  };
};

const normalizeScheduledTask = (task) => {
  const scheduledDayValue = task.scheduledDay || task.scheduled_day;
  const scheduledTimeValue = task.scheduledTime ?? task.scheduled_time ?? task.start_time;
  const endTimeValue = task.endTime ?? task.end_time ?? task.finish_time;

  return {
    ...task,
    scheduledDay: scheduledDayValue ? new Date(scheduledDayValue) : null,
    scheduledTime: typeof scheduledTimeValue === 'number' ? scheduledTimeValue : scheduledTimeValue?.hour || 0,
    endTime: typeof endTimeValue === 'number' ? endTimeValue : endTimeValue?.hour || null,
    color: task.color || 'bg-blue-500',
  };
};

const buildTaskPayload = (task, includeCompleted = false) => {
  const payload = {
    title: task.title,
    description: task.description,
    duration: Number(task.duration) || 0,
    category: task.category,
    color: task.color,
    is_recurring: task.isRecurring ?? false,
  };

  if (includeCompleted) {
    payload.completed = task.completed ?? false;
  }

  return payload;
};

const formatMinutes = (minutes) => {
  const totalMinutes = Math.max(minutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
};

const combineDateAndHour = (dateValue, hour = 0) => {
  if (!dateValue) return null;
  const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hour, 0, 0, 0);
};

export default function Dashboard({ onBackToLanding }) {
  const { user, logout, authenticatedFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('asc');
  const [activeFilter, setActiveFilter] = useState('all');
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [notification, setNotification] = useState(null);

  const totalBlockedMinutes = useMemo(
    () => tasks.reduce((acc, task) => acc + (Number(task.duration) || 0), 0),
    [tasks]
  );

  const activeTaskCount = useMemo(
    () => tasks.filter(task => !task.completed).length,
    [tasks]
  );

  const recurringTaskCount = useMemo(
    () => tasks.filter(task => task.isRecurring).length,
    [tasks]
  );

  const averageTaskDuration = useMemo(() => {
    if (tasks.length === 0) return '0m';
    const averageMinutes = Math.round(totalBlockedMinutes / tasks.length);
    return formatMinutes(averageMinutes);
  }, [tasks, totalBlockedMinutes]);

  const upcomingTask = useMemo(() => {
    if (!scheduledTasks.length) return null;
    const now = new Date();
    const enriched = scheduledTasks
      .map(task => ({
        ...task,
        startDateTime: combineDateAndHour(task.scheduledDay, task.scheduledTime)
      }))
      .filter(task => task.startDateTime && task.startDateTime >= now)
      .sort((a, b) => a.startDateTime - b.startDateTime);
    return enriched[0] || null;
  }, [scheduledTasks]);

  const handleStartFocusSession = useCallback(() => {
    if (!upcomingTask) {
      setNotification({ type: 'info', message: 'No scheduled blocks ready. Drag a task onto the calendar to queue one up.' });
      return;
    }
    setActiveTab('calendar');
    setNotification({ type: 'success', message: `Dialed in for ${upcomingTask.title}` });
  }, [upcomingTask]);

  // API base URL is imported from config

  // Load tasks and scheduled tasks
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const startDate = new Date(selectedDate);
      startDate.setDate(selectedDate.getDate() - 7); // Get data for previous week
      const endDate = new Date(selectedDate);
      endDate.setDate(selectedDate.getDate() + 14); // And next two weeks

      // Load regular tasks and scheduled tasks in parallel
      const [tasksResponse, scheduledResponse] = await Promise.all([
        authenticatedFetch(`${API_URL}/tasks`),
        authenticatedFetch(`${API_URL}/scheduled-tasks?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`)
      ]);

      // Handle tasks response
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.map(normalizeTask));
      } else {
        console.error('Failed to load tasks');
        // Fallback to sample data if API fails
        const sampleTasks = [
          {
            id: 1,
            title: 'Soccer Practice',
            duration: 120,
            color: 'bg-green-500',
            is_recurring: true,
            category: 'Sports',
            description: 'Team practice session',
            completed: false
          },
          {
            id: 2,
            title: 'Study Session',
            duration: 90,
            color: 'bg-blue-500',
            is_recurring: true,
            category: 'Education',
            description: 'Math and Science review',
            completed: false
          }
        ];
        setTasks(sampleTasks.map(normalizeTask));
      }

      // Handle scheduled tasks response
      if (scheduledResponse.ok) {
        const scheduledData = await scheduledResponse.json();
        const formattedScheduledTasks = scheduledData.map(normalizeScheduledTask);
        setScheduledTasks(formattedScheduledTasks);
      } else {
        console.error('Failed to load scheduled tasks');
        setScheduledTasks([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setTasks([]);
      setScheduledTasks([]);
      setNotification({ type: 'error', message: 'Failed to load data' });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, authenticatedFetch]);

  // Add effect to reload tasks when selectedDate changes
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Tasks are now managed by the API, no need for localStorage

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleCreateTask = async (newTask) => {
    try {
      if (editingTask) {
        // Update existing task
        const payload = buildTaskPayload({ ...editingTask, ...newTask }, true);
        const response = await authenticatedFetch(`${API_URL}/tasks/${editingTask.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const updatedTask = normalizeTask(await response.json());
          setTasks(prevTasks => prevTasks.map(task =>
            task.id === editingTask.id ? updatedTask : task
          ));
          setEditingTask(null);
          showNotification('Task updated successfully!');
        } else {
          showNotification('Failed to update task', 'error');
        }
      } else {
        // Create new task
        const payload = buildTaskPayload(newTask);
        const response = await authenticatedFetch(`${API_URL}/tasks`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const createdTask = normalizeTask(await response.json());
          setTasks(prevTasks => [createdTask, ...prevTasks]);
          showNotification('Task created successfully!');
        } else {
          showNotification('Failed to create task', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
      showNotification('Failed to save task', 'error');
    }
    setShowTaskCreator(false);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
        showNotification('Task deleted successfully!');
      } else {
        showNotification('Failed to delete task', 'error');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      showNotification('Failed to delete task', 'error');
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const updatedTask = { ...task, completed: !task.completed };
      const payload = buildTaskPayload(updatedTask, true);
      const wasCompleted = task?.completed;

      const response = await authenticatedFetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = normalizeTask(await response.json());
        setTasks(prevTasks => prevTasks.map(taskItem =>
          taskItem.id === taskId ? result : taskItem
        ));
        showNotification(wasCompleted ? 'Task marked as incomplete' : 'Task completed! 🎉');
      } else {
        showNotification('Failed to update task', 'error');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showNotification('Failed to update task', 'error');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskCreator(true);
  };

  const handleDuplicateTask = (task) => {
    const duplicatePayload = {
      ...task,
      title: `${task.title} (Copy)`,
      completed: false,
    };

    (async () => {
      try {
        const response = await authenticatedFetch(`${API_URL}/tasks`, {
          method: 'POST',
          body: JSON.stringify(buildTaskPayload(duplicatePayload)),
        });

        if (response.ok) {
          const createdTask = normalizeTask(await response.json());
          setTasks(prevTasks => [createdTask, ...prevTasks]);
          setNotification({ type: 'success', message: 'Task duplicated successfully' });
        } else {
          setNotification({ type: 'error', message: 'Failed to duplicate task' });
        }
      } catch (error) {
        console.error('Error duplicating task:', error);
        setNotification({ type: 'error', message: 'Failed to duplicate task' });
      }
    })();
  };

  // Handle sort change
  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Get filtered and sorted tasks
  const getFilteredAndSortedTasks = () => {
    let filteredTasks = [...tasks];

    // Apply filters
    switch (activeFilter) {
      case 'active':
        filteredTasks = filteredTasks.filter(task => !task.completed);
        break;
      case 'completed':
        filteredTasks = filteredTasks.filter(task => task.completed);
        break;
      case 'recurring':
        filteredTasks = filteredTasks.filter(task => task.isRecurring);
        break;
      default:
        // 'all' filter - show all tasks
        break;
    }

    // Apply sorting
    return filteredTasks.sort((a, b) => {
      let comparison = 0;

      // Handle different sort criteria
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1, undefined: 0 };
        comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
      } else if (sortBy === 'duration') {
        comparison = (a.duration || 0) - (b.duration || 0);
      } else if (sortBy === 'title') {
        comparison = (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'category') {
        comparison = (a.category || '').localeCompare(b.category || '');
      }

      // Reverse if sort order is descending
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  };

  const handleKeyPress = useCallback((e) => {
    // Ctrl+1, Ctrl+2, Ctrl+3 for navigation
    if (e.ctrlKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          setActiveTab('calendar');
          break;
        case '2':
          e.preventDefault();
          setActiveTab('tasks');
          break;
        case '3':
          e.preventDefault();
          setActiveTab('progress');
          break;
        default:
          break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={onBackToLanding}
                className="mr-4 text-gray-400 hover:text-gray-600 transition"
              >
                ← Back
              </button>
              <div className="text-2xl font-bold text-blue-600">Diligence</div>
              <span className="ml-4 text-sm text-gray-500">Dashboard</span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings size={20} />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition ml-4"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Blocked</p>
                <p className="text-2xl font-bold text-gray-900">{formatMinutes(totalBlockedMinutes)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Blocks</p>
                <p className="text-2xl font-bold text-gray-900">{activeTaskCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="text-orange-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recurring Library</p>
                <p className="text-2xl font-bold text-gray-900">{recurringTaskCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Focus Mode */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Focus Mode</p>
              <h3 className="text-2xl font-bold text-gray-900">Stay Ahead of Your Next Block</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleStartFocusSession}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Flame size={16} className="mr-2" />
                Start Focus Session
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Manage Blocks
              </button>
            </div>
          </div>
          {upcomingTask ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Up next</p>
                <h4 className="text-xl font-semibold text-gray-900">{upcomingTask.title}</h4>
                <p className="text-gray-600">
                  {upcomingTask.category} • {formatMinutes(upcomingTask.duration || 0)} • {combineDateAndHour(upcomingTask.scheduledDay, upcomingTask.scheduledTime)?.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs uppercase text-blue-600 tracking-wide">Avg Duration</p>
                  <p className="text-xl font-bold text-blue-900">{averageTaskDuration}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-xs uppercase text-purple-600 tracking-wide">Active Blocks</p>
                  <p className="text-xl font-bold text-purple-900">{activeTaskCount}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 border border-dashed border-gray-200 rounded-lg p-6">
              <div>
                <p className="text-lg font-medium text-gray-900">No upcoming block scheduled</p>
                <p className="text-gray-600">Drag a task block into the calendar to set up your next focus session.</p>
              </div>
              <Zap className="text-yellow-500" size={32} />
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'calendar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Calendar className="inline mr-2" size={16} />
                Calendar
                <span className="ml-1 text-xs text-gray-400">(⌘1)</span>
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <CheckCircle className="inline mr-2" size={16} />
                Task Blocks
                <span className="ml-1 text-xs text-gray-400">(⌘2)</span>
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'progress'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <BarChart3 className="inline mr-2" size={16} />
                Progress
                <span className="ml-1 text-xs text-gray-400">(⌘3)</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'calendar' && (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Task Sidebar */}
                <div className="w-full lg:w-80 flex-shrink-0">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900">Task Blocks</h3>
                      <button
                        onClick={() => setShowTaskCreator(true)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Add Task"
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                      {tasks.filter(t => !t.completed).length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          No active tasks. Create one to get started!
                        </div>
                      ) : (
                        tasks
                          .filter(t => !t.completed)
                          .map(task => (
                            <div key={task.id} className="transform transition hover:scale-102">
                              <TaskBlock
                                task={task}
                                onDelete={handleDeleteTask}
                                onEdit={handleEditTask}
                                onDuplicate={handleDuplicateTask}
                                onToggleComplete={handleToggleComplete}
                              />
                            </div>
                          ))
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 text-center">
                      Drag tasks onto the calendar to schedule them
                    </div>
                  </div>
                </div>

                {/* Calendar Area */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Weekly Schedule</h2>
                    <div className="lg:hidden">
                      <button
                        onClick={() => setShowTaskCreator(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                      >
                        <Plus className="mr-2" size={16} />
                        Add Task
                      </button>
                    </div>
                  </div>
                  <WeeklyCalendar
                    tasks={tasks}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    scheduledTasks={scheduledTasks}
                    onScheduleTask={async (task) => {
                      try {
                        const response = await authenticatedFetch(`${API_URL}/scheduled-tasks`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            taskId: task.id || task.taskId,
                            scheduledDay: task.scheduledDay.toISOString(),
                            scheduledTime: task.scheduledTime,
                            endTime: task.endTime
                          })
                        });

                        if (response.ok) {
                          const newScheduledTask = await response.json();
                          setScheduledTasks(prev => [...prev, normalizeScheduledTask(newScheduledTask)]);
                          setNotification({ type: 'success', message: 'Task scheduled successfully!' });
                        } else {
                          throw new Error('Failed to schedule task');
                        }
                      } catch (error) {
                        console.error('Error scheduling task:', error);
                        setNotification({ type: 'error', message: 'Failed to schedule task' });
                      }
                    }}
                    onDeleteScheduledTask={async (taskId) => {
                      try {
                        const response = await authenticatedFetch(`${API_URL}/scheduled-tasks/${taskId}`, {
                          method: 'DELETE'
                        });

                        if (response.ok) {
                          setScheduledTasks(scheduledTasks.filter(t => t.id !== taskId));
                          setNotification({ type: 'success', message: 'Scheduled task removed' });
                        } else {
                          throw new Error('Failed to delete scheduled task');
                        }
                      } catch (error) {
                        console.error('Error deleting scheduled task:', error);
                        setNotification({ type: 'error', message: 'Failed to remove scheduled task' });
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Reusable Task Blocks</h2>
                  <button
                    onClick={() => setShowTaskCreator(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                  >
                    <Plus className="mr-2" size={16} />
                    Create Block
                    <span className="ml-2 text-xs opacity-75">(⌘N)</span>
                  </button>
                </div>

                {/* Task Controls */}
                <TaskControls
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  activeFilter={activeFilter}
                  onFilterChange={handleFilterChange}
                />

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <span className="ml-3 text-gray-600">Loading tasks...</span>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No task blocks yet</h3>
                    <p className="text-gray-600 mb-6">Create your first reusable task block to get started</p>
                    <button
                      onClick={() => setShowTaskCreator(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                      Create Your First Task Block
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredAndSortedTasks().map(task => (
                      <TaskBlock
                        key={task.id}
                        task={task}
                        onDelete={handleDeleteTask}
                        onEdit={handleEditTask}
                        onDuplicate={handleDuplicateTask}
                        onToggleComplete={handleToggleComplete}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'progress' && (
              <ProgressStats tasks={tasks} />
            )}
          </div>
        </div>
      </div>

      {/* Task Creator Modal */}
      {showTaskCreator && (
        <TaskCreator
          onClose={() => {
            setShowTaskCreator(false);
            setEditingTask(null);
          }}
          onCreateTask={handleCreateTask}
          editingTask={editingTask}
        />
      )}

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
