import { useSite } from '../../hooks/useSite';

export default function Maintenance() {
  const { settings } = useSite();
  const systemName = settings?.system_name || 'BizHub';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-7xl">🔧</span>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6">Under Maintenance</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">
          {systemName} is currently undergoing scheduled maintenance.
        </p>
        <p className="text-gray-400 dark:text-gray-500 mt-2">
          We'll be back shortly. Thank you for your patience.
        </p>
        {settings?.support_email && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">
            Need help?{' '}
            <a href={`mailto:${settings.support_email}`} className="text-primary-600 dark:text-primary-400 hover:underline">
              {settings.support_email}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}