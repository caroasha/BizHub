import { Toast } from './Toast';
import { useNotification } from '../../hooks/useNotification';

export function ToastContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {notifications.map(n => (
        <Toast key={n.id} id={n.id} message={n.message} type={n.type} onRemove={removeNotification} />
      ))}
    </div>
  );
}