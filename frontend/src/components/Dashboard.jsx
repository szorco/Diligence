import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, CheckCircle, BarChart3, Settings, User, Bell } from 'lucide-react';
import TaskBlock from './TaskBlock';
import WeeklyCalendar from './WeeklyCalendar';
import TaskCreator from './TaskCreator';
import ProgressStats from './ProgressStats';

export default function Dashboard({ onBackToLanding }) {
  const [activeTab, setActiveTab] = useState('calendar');
  const [tasks, setTasks] = useState([]);
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sample data - in real app this would come from API
  useEffect(() => {
    const sampleTasks = [
      {
        id: 1,
        title: 'Soccer Practice',
        duration: 120, // minutes
        color: 'bg-green-500',
        isRecurring: true,
        category: 'Sports',
        description: 'Team practice session'
      },
      {
        id: 2,
        title: 'Study Session',
        duration: 90,
        color: 'bg-blue-500',
        isRecurring: false,
        category: 'Education',
        description: 'Math and science review'
      },
      {
        id: 3,
        title: 'Gym Workout',
        duration: 60,
        color: 'bg-red-500',
        isRecurring: true,
        category: 'Fitness',
        description: 'Strength training routine'
      },
      {
        id: 4,
        title: 'Project Meeting',
        duration: 45,
        color: 'bg-purple-500',
        isRecurring: false,
        category: 'Work',
        description: 'Weekly team sync'
      }
    ];
    setTasks(sampleTasks);
  }, []);

  const handleCreateTask = (newTask) => {
    setTasks([...tasks, { ...newTask, id: Date.now() }]);
    setShowTaskCreator(false);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

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
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.map(task => (
                    <TaskBlock
                      key={task.id}
                      task={task}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
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
          onClose={() => setShowTaskCreator(false)}
          onCreateTask={handleCreateTask}
        />
      )}
    </div>
  );
}
