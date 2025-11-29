import { Sparkles } from 'lucide-react';
import styles from './Loading.module.css';

function Loading({ message = 'Cargando...' }) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}>
        <Sparkles className={styles.sparkleIcon} size={32} />
      </div>
      <p className={styles.message}>{message}</p>
      <div className={styles.dots}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}

export default Loading;

