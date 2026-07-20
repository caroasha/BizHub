import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <span className="text-8xl">404</span>
      <h1 className="text-2xl font-bold text-[var(--text)] mt-4">Page Not Found</h1>
      <p className="text-[var(--text-muted)] mt-2">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6 inline-block"><Button>Back to Home</Button></Link>
    </div>
  );
}