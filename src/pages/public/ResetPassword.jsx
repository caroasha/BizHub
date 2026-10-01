import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { resetPassword } from '../../api/public/auth';
import { useNotification } from '../../hooks/useNotification';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch('password');

  const onSubmit = async (data) => {
    if (!token) return;

    setFormError('');
    setLoading(true);

    try {
      await resetPassword(token, data.password);
      setDone(true);
      success('Password reset successful');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="text-center max-w-md">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
            Invalid Reset Link
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            This link is invalid or has expired.
          </p>
          <Link
            to="/forgot-password"
            className="mt-4 inline-block text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            Request New Link
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Set New Password
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter your new password
          </p>
        </div>

        {done ? (
          <Card>
            <div className="text-center py-4">
              <span className="text-5xl">✅</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                Password Reset!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Redirecting to login…
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 characters' },
                })}
                error={errors.password?.message}
              />

              <Input
                label="Confirm Password"
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) => v === newPassword || 'Passwords do not match',
                })}
                error={errors.confirmPassword?.message}
              />

              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full">
                Reset Password
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}