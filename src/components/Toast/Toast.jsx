import { CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import styles from './Toast.module.css';

function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertCircle,
  };

  const Icon = icons[type] || CheckCircle;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <Icon className={styles.icon} size={20} />
      <span className={styles.message}>{message}</span>
      <button onClick={onClose} className={styles.closeButton}>
        ×
      </button>
    </div>
  );
}

export default Toast;

