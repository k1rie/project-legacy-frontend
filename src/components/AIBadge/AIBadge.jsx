import { Sparkles } from 'lucide-react';
import styles from './AIBadge.module.css';

function AIBadge({ size = 'small' }) {
  return (
    <div className={`${styles.badge} ${styles[size]}`}>
      <Sparkles size={size === 'large' ? 16 : 12} />
      <span>Powered by AI</span>
    </div>
  );
}

export default AIBadge;

