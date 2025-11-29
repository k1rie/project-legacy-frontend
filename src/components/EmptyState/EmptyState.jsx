import { BookOpen, Users, Sparkles } from 'lucide-react';
import styles from './EmptyState.module.css';

function EmptyState({ 
  icon: Icon = Sparkles, 
  title, 
  message, 
  actionLabel, 
  onAction,
  type = 'default'
}) {
  return (
    <div className={styles.emptyContainer}>
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} size={48} />
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      {onAction && actionLabel && (
        <button onClick={onAction} className={styles.actionButton}>
          <Sparkles size={18} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;

