import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { forgotPassword } from '../../api/public/auth';
import { useNotification } from '../../hooks/useNotification';

export default function ForgotPassword() {
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setFormError('');
    setLoading(true);
    try {
      await forgotPassword(data.email);
      setSent(true);
      success('Reset link sent to your email');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset link';
      setFormError(msg);
      error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your email to receive a reset link</p>
        </div>

        {sent ? (
          <Card>
            <div className="text-center py-4">
              <span className="text-5xl">📧</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">Check Your Email</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                We've sent a password reset link to your email.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Didn't receive it? Check your spam folder.
              </p>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => { setSent(false); setFormError(''); }}
                  className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline"
                >
                  Try another email
                </button>
              </div>
              <Link to="/login" className="mt-4 inline-block text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Back to Login
              </Link>
            </div>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                })}
                error={errors.email?.message}
              />

              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full">
                Send Reset Link
              </Button>
            </form>
          </Card>
        )}

        <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}