import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { MODULES } from '../../utils/constants';

const moduleRoutes = {
  restaurant: '/resto', pharmacy: '/pharma', apartment: '/apartment',
  electronics: '/electro', cyber: '/cyber',
};

export default function Login() {
  const { login } = useAuth();
  const { error } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(new URLSearchParams(window.location.search).get('desktop') === 'true');
  }, []);

  const onSubmit = async (data) => {
    setLoginError('');
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      const businessType = result?.tenant?.businessType;
      navigate(moduleRoutes[businessType] || '/resto');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setLoginError(msg);
      error(msg);
    }
    setLoading(false);
  };

  const formContent = (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
        <Input label="Password" type="password" {...register('password', { required: 'Password is required' })} error={errors.password?.message} />
        {loginError && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{loginError}</div>}
        {!isDesktop && (
          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Forgot password?</Link>
          </div>
        )}
        <Button type="submit" loading={loading} className="w-full">Login</Button>
      </form>
    </Card>
  );

  // Desktop: fullscreen overlay that covers PublicLayout
  if (isDesktop) {
    return (
      <>
        {/* Hide the public layout behind us */}
        <style>{`nav, footer, header { display: none !important; }`}</style>
        <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-primary-600" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="currentColor" />
                  <path d="M8 10h6v12H8zm10-4h6v16h-6z" fill="white" />
                  <circle cx="22" cy="8" r="2" fill="white" fillOpacity="0.5" />
                  <circle cx="22" cy="20" r="2" fill="white" fillOpacity="0.5" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Login to your BizHub account</p>
            </div>
            {formContent}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Login to your BizHub account</p>
        </div>
        {formContent}
        <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          Don't have an account? <Link to="/pricing" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Get Started</Link>
        </p>
      </div>
    </div>
  );
}