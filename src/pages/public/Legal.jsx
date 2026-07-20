import { useState, useEffect } from 'react';
import { getLegalDoc } from '../../api/public/legal';
import { Spinner } from '../../components/ui/Spinner';

export function Legal({ type, title }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLegalDoc(type)
      .then(res => setContent(res?.content || res?.data?.content || ''))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--text)] mb-8">{title}</h1>
      {loading ? <div className="flex justify-center"><Spinner /></div> : (
        <div className="prose prose-sm max-w-none text-[var(--text)]" dangerouslySetInnerHTML={{ __html: content }} />
      )}
    </div>
  );
}