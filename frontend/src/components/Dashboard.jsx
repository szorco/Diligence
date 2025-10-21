import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, CheckCircle, BarChart3, Settings, User, Bell, Loader2 } from 'lucide-react';
import TaskBlock from './TaskBlock';
import WeeklyCalendar from './WeeklyCalendar';
import TaskCreator from './TaskCreator';
import ProgressStats from './ProgressStats';
import Notification from './Notification';

export default function Dashboard({ onBackToLanding }) {
  const [activeTab, setActiveTab] = useState('calendar');
  const [tasks, setTasks] = useState([]);
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [notification, setNotification] = useState(null);

  // Load tasks from localStorage or API
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        // Try to load from localStorage first
        const savedTasks = localStorage.getItem('diligence-tasks');
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        } else {
          // Load sample data
          const sampleTasks = [
            {
              id: 1,
              title: 'Soccer Practice',
              duration: 120,
              color: 'bg-green-500',
              isRecurring: true,
              category: 'Sports',
              description: 'Team practice session',
              completed: false
            },
            {
              id: 2,
              title: 'Study Session',
              duration: 90,
              color: 'bg-blue-500',
              isRecurring: false,
              category: 'Education',
              description: 'Math and science review',
              completed: false
            },
            {
              id: 3,
              title: 'Gym Workout',
              duration: 60,
              color: 'bg-red-500',
              isRecurring: true,
              category: 'Fitness',
              description: 'Strength training routine',
              completed: false
            },
            {
              id: 4,
              title: 'Project Meeting',
              duration: 45,
              color: 'bg-purple-500',
              isRecurring: false,
              category: 'Work',
              description: 'Weekly team sync',
              completed: false
            }
          ];
          setTasks(sampleTasks);
          localStorage.setItem('diligence-tasks', JSON.stringify(sampleTasks));
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTasks();
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('diligence-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleCreateTask = (newTask) => {
    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...newTask, id: editingTask.id } : task
      ));
      setEditingTask(null);
      showNotification('Task updated successfully!');
    } else {
      // Create new task
      setTasks([...tasks, { ...newTask, id: Date.now() }]);
      showNotification('Task created successfully!');
    }
    setShowTaskCreator(false);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    showNotification('Task deleted successfully!');
  };

  const handleToggleComplete = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    showNotification(task?.completed ? 'Task marked as incomplete' : 'Task completed! 🎉');
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskCreator(true);
  };

  const handleDuplicateTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now(),
      title: `${task.title} (Copy)`,
      completed: false
    };
    setTasks([...tasks, newTask]);
    showNotification('Task duplicated successfully!');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            setShowTaskCreator(true);
            break;
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
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
                <span className="text-sm font-medium text-gray-700">John Doe</span>
              </div>
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
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="text-orange-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Blocked</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(tasks.reduce((acc, task) => acc + task.duration, 0) / 60)}h
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'calendar'
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tasks'
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'progress'
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
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Weekly Schedule</h2>
                  <button
                    onClick={() => setShowTaskCreator(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                  >
                    <Plus className="mr-2" size={16} />
                    Add Task
                  </button>
                </div>
                <WeeklyCalendar 
                  tasks={tasks}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </div>
            )}

            {activeTab === 'tasks' && (
              <div>
                <div className="flex justify-between items-center mb-6">
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
                    {tasks.map(task => (
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
