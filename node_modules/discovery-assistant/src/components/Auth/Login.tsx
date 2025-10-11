import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

type AuthMode = 'signin' | 'signup' | 'reset';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  company: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, isAuthenticated, isSupabaseEnabled } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    company: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // If Supabase is not configured, show a message
  if (!isSupabaseEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img
              src="/logo1.svg"
              alt="AutomAIziot Logo"
              className="h-16 mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Discovery Assistant
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ExclamationCircleIcon className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-yellow-800">
                אימות משתמשים אינו מוגדר
              </p>
              <p className="text-sm text-yellow-600 mt-2">
                המערכת פועלת במצב מקומי
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 btn-primary"
              >
                המשך ללא התחברות
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      let result;

      switch (mode) {
        case 'signin':
          result = await signIn(formData.email, formData.password);
          if (result.success) {
            navigate('/');
          } else {
            setError(result.error || 'התחברות נכשלה');
          }
          break;

        case 'signup':
          if (formData.password !== formData.confirmPassword) {
            setError('הסיסמאות אינן תואמות');
            setLoading(false);
            return;
          }
          if (formData.password.length < 6) {
            setError('הסיסמה חייבת להכיל לפחות 6 תווים');
            setLoading(false);
            return;
          }
          result = await signUp(
            formData.email,
            formData.password,
            formData.fullName,
            formData.company
          );
          if (result.success) {
            setSuccess('החשבון נוצר בהצלחה! בדוק את האימייל שלך לאישור.');
            setMode('signin');
          } else {
            setError(result.error || 'יצירת חשבון נכשלה');
          }
          break;

        case 'reset':
          result = await resetPassword(formData.email);
          if (result.success) {
            setSuccess('קישור לאיפוס סיסמה נשלח לאימייל שלך');
            setMode('signin');
          } else {
            setError(result.error || 'איפוס סיסמה נכשל');
          }
          break;
      }
    } catch (err) {
      setError('אירעה שגיאה בלתי צפויה');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="/logo1.svg"
              alt="AutomAIziot Logo"
              className="h-14 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Discovery Assistant
            </h1>
            <p className="text-gray-600">
              {mode === 'signin' && 'התחבר לחשבונך'}
              {mode === 'signup' && 'צור חשבון חדש'}
              {mode === 'reset' && 'אפס סיסמה'}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                אימייל
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            {(mode === 'signin' || mode === 'signup') && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  סיסמה
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* Confirm Password (Sign up only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  אשר סיסמה
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* Full Name (Sign up only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  שם מלא
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ישראל ישראלי"
                  />
                </div>
              </div>
            )}

            {/* Company (Sign up only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  חברה
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="שם החברה"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex justify-center items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  {mode === 'signin' && 'התחבר'}
                  {mode === 'signup' && 'צור חשבון'}
                  {mode === 'reset' && 'שלח קישור איפוס'}
                  <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="mt-6 space-y-2">
            {mode === 'signin' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700"
                >
                  אין לך חשבון? הרשם כאן
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="w-full text-center text-sm text-gray-600 hover:text-gray-500"
                >
                  שכחת סיסמה?
                </button>
              </>
            )}

            {mode === 'signup' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccess(null);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-500"
              >
                כבר יש לך חשבון? התחבר כאן
              </button>
            )}

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccess(null);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-500"
              >
                חזור להתחברות
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          © 2024 Discovery Assistant. כל הזכויות שמורות.
        </p>
      </div>
    </div>
  );
};