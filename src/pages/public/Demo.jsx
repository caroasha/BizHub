import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { requestDemo } from '../../api/public/landing';
import { useNotification } from '../../hooks/useNotification';
import { MODULES } from '../../utils/constants';
import { validateEmail, validatePhone, validateRequired } from '../../utils/validators';

export default function Demo() {
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await requestDemo(data);
      success('Demo request submitted! We will contact you soon.');
    } catch (err) {
      error('Failed to submit request');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)]">Request a Demo</h1>
        <p className="text-[var(--text-muted)] mt-2">See BizHub in action with a personalized demo</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Your Name" {...register('name', { validate: v => validateRequired(v, 'Name') })} error={errors.name?.message} />
          <Input label="Email" type="email" {...register('email', { validate: validateEmail })} error={errors.email?.message} />
          <Input label="Phone" {...register('phone', { validate: validatePhone })} error={errors.phone?.message} />
          <Input label="Business Name" {...register('businessName')} />
          <Select label="Interested Module" {...register('businessType')}
            options={[{ value: '', label: 'Select a module...' }, ...MODULES.map(m => ({ value: m.type, label: m.name }))]} />
          <Button type="submit" loading={loading} className="w-full">Request Demo</Button>
        </form>
      </Card>
    </div>
  );
}