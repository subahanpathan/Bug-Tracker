import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/index.js';
import { authAPI } from '../api/apiClient.js';
import { FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const loginPromise = authAPI.login({ email, password });

    toast.promise(loginPromise, {
      loading: 'Logging in...',
      success: 'Login successful! Welcome back.',
      error: (err) => err.message || 'Login failed',
    });

    try {
      const response = await loginPromise;
      setToken(response.data.data.token);
      setUser({
        id: response.data.data.userId,
        email: response.data.data.email,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-lg mx-auto flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">BT</span>
          </div>
          <h1 className="text-3xl font-bold text-secondary">Bug Tracker</h1>
          <p className="text-gray-600 mt-2">Professional Issue Management</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Email Address
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <FiMail className="text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 ml-3 outline-none bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <FiLock className="text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="flex-1 ml-3 outline-none bg-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Logging in...' : 'Login'}</span>
            {!loading && <FiArrowRight />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-primary font-semibold hover:underline"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
