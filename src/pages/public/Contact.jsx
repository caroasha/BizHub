import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { submitContact } from '../../api/public/landing';
import { useNotification } from '../../hooks/useNotification';
import { useSite } from '../../hooks/useSite';
import { validateEmail, validateRequired } from '../../utils/validators';

export default function Contact() {
  const { settings } = useSite();
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await submitContact(data);
      success('Message sent! We will get back to you soon.');
      reset();
    } catch (err) {
      error('Failed to send message');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)]">Contact Us</h1>
        <p className="text-[var(--text-muted)] mt-2">Have questions? We'd love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="text-center">
          <span className="text-2xl">📧</span>
          <p className="text-sm font-medium text-[var(--text)] mt-2">Email</p>
          <p className="text-xs text-[var(--text-muted)]">{settings.support_email || 'support@bizhub.co.ke'}</p>
        </Card>
        <Card className="text-center">
          <span className="text-2xl">📞</span>
          <p className="text-sm font-medium text-[var(--text)] mt-2">Phone</p>
          <p className="text-xs text-[var(--text-muted)]">{settings.support_phone || '+254 700 000 000'}</p>
        </Card>
        <Card className="text-center">
          <span className="text-2xl">💬</span>
          <p className="text-sm font-medium text-[var(--text)] mt-2">Live Chat</p>
          <p className="text-xs text-[var(--text-muted)]">Click the chat bubble</p>
        </Card>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" {...register('name', { validate: v => validateRequired(v, 'Name') })} error={errors.name?.message} />
            <Input label="Email" type="email" {...register('email', { validate: validateEmail })} error={errors.email?.message} />
          </div>
          <Input label="Subject" {...register('subject')} />
          <Textarea label="Message" rows={5} {...register('message', { validate: v => validateRequired(v, 'Message') })} error={errors.message?.message} />
          <Button type="submit" loading={loading}>Send Message</Button>
        </form>
      </Card>
    </div>
  );
}