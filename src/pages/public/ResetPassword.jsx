import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { resetPassword } from '../../api/public/auth';
import { useNotification } from '../../hooks/useNotification';
import { validatePassword } from '../../utils/validators';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (!token) return;
    setLoading(true);
    try {
      await resetPassword(token, data.password);
      setDone(true);
      success('Password reset successful');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="text-center">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">Invalid Reset Link</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This link is invalid or has expired.</p>
          <Link to="/forgot-password" className="mt-4 inline-block text-primary-600 dark:text-primary-400 font-medium hover:underline">Request New Link</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Set New Password</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your new password</p>
        </div>

        {done ? (
          <Card>
            <div className="text-center py-4">
              <span className="text-5xl">✅</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">Password Reset!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Redirecting to login...</p>
            </div>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="New Password" type="password" {...register('password', { validate: validatePassword })} error={errors.password?.message} />
              <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}