import { useAuth } from '../contexts/AuthContext';

export default function DevTools() {
  const { 
    devMode, 
    setDevMode, 
    user, 
    devLogin, 
    logout, 
    isLoading 
  } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700 z-50">
      <div className="flex items-center space-x-4">
        <div className="text-xs font-mono">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full mr-2 bg-green-500"></span>
            <span>Dev Mode: {devMode ? 'ON' : 'OFF'}</span>
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {user ? `Logged in as: ${user.email}` : 'Not logged in'}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setDevMode(!devMode)}
            className={`px-2 py-1 text-xs rounded ${
              devMode 
                ? 'bg-yellow-600 hover:bg-yellow-700' 
                : 'bg-gray-700 hover:bg-gray-600'
            } transition-colors`}
            title="Toggle development mode"
          >
            {devMode ? 'Disable Dev' : 'Enable Dev'}
          </button>
          {!user ? (
            <button
              onClick={devLogin}
              disabled={isLoading}
              className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded disabled:opacity-50 transition-colors"
              title="Login as test user"
            >
              {isLoading ? '...' : 'Dev Login'}
            </button>
          ) : (
            <button
              onClick={logout}
              className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors"
              title="Logout"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
