import { useState } from 'react';
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
  const [showSelector, setShowSelector] = useState(false);
  const [userModules, setUserModules] = useState([]);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoginError('');
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      const modules = result?.modules || [];
      const businessType = result?.tenant?.businessType;

      if (modules.length > 1) {
        setUserModules(modules);
        setShowSelector(true);
      } else if (businessType) {
        navigate(moduleRoutes[businessType] || '/resto');
      } else {
        navigate('/resto');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setLoginError(msg);
      error(msg);
    }
    setLoading(false);
  };

  const handleModuleSelect = (mod) => {
    setShowSelector(false);
    navigate(moduleRoutes[mod] || '/resto');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Login to your BizHub account</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
            <Input label="Password" type="password" {...register('password', { required: 'Password is required' })} error={errors.password?.message} />
            {loginError && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{loginError}</div>}
            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" loading={loading} className="w-full">Login</Button>
          </form>
        </Card>
        <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          Don't have an account? <Link to="/pricing" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Get Started</Link>
        </p>
      </div>

      {/* Module Selector Overlay */}
      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Choose Module</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You have access to multiple modules. Select one to continue.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userModules.map(mod => {
                const config = MODULES.find(m => m.type === mod);
                return (
                  <div key={mod} onClick={() => handleModuleSelect(mod)}
                    className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-center cursor-pointer hover:shadow-md hover:border-primary-500 transition-all">
                    <span className="text-3xl">{config?.icon || '📦'}</span>
                    <p className="mt-2 font-medium text-gray-900 dark:text-white text-sm">{config?.name || mod}</p>
                  </div>
                );
              })}
            </div>
            <Button variant="secondary" className="mt-4 w-full" onClick={() => { setShowSelector(false); navigate('/resto'); }}>Go to Default</Button>
          </div>
        </div>
      )}
    </div>
  );
}