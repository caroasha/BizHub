import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  HiCheckCircle,
  HiXCircle,
  HiMail,
  HiArrowRight,
} from 'react-icons/hi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import api from '../../api/axios';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [state, setState] = useState('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setErrorMsg('No verification token provided');
      return;
    }

    let cancelled = false;
    const verify = async () => {
      try {
        await api.post('/public/auth/verify-email', { token });
        if (cancelled) return;
        setState('success');
      } catch (err) {
        if (cancelled) return;
        setState('error');
        setErrorMsg(
          err?.response?.data?.message ||
            err.message ||
            'Verification failed. The link may be expired.'
        );
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Card>
          {state === 'verifying' && (
            <div className="text-center py-10">
              <Spinner size="lg" className="mx-auto" />
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                Verifying your email…
              </p>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center py-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <HiCheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <h2 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">
                Email Verified!
              </h2>

              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Your email address has been confirmed. You can now log in to your account.
              </p>

              <Button
                className="mt-6 w-full"
                onClick={() => navigate('/login')}
              >
                Continue to Login <HiArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {state === 'error' && (
            <div className="text-center py-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <HiXCircle className="w-10 h-10 text-red-600" />
              </div>

              <h2 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">
                Verification Failed
              </h2>

              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {errorMsg || 'The link is invalid or has expired.'}
              </p>

              <div className="mt-6 space-y-2">
                <Link to="/login" className="block">
                  <Button variant="secondary" className="w-full">
                    Back to Login
                  </Button>
                </Link>

                <Link to="/register" className="block">
                  <Button variant="ghost" className="w-full">
                    Register again
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
                <HiMail className="w-3 h-3 inline mr-1" />
                Need help? Contact support@bizhub.co.ke
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}