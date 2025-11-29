import { Sparkles, Wand2 } from 'lucide-react';
import styles from './FullScreenLoading.module.css';

function FullScreenLoading({ 
  message = "Nuestro asistente IA está creando un flujo personalizado para tu clase...",
  title = "Generando tu flujo de clase"
}) {
  return (
    <div className={styles.fullScreenLoading}>
      <div className={styles.loadingContent}>
        <div className={styles.iconContainer}>
          <Wand2 size={64} className={styles.mainIcon} />
          <div className={styles.sparkles}>
            <Sparkles size={24} className={styles.sparkle1} />
            <Sparkles size={20} className={styles.sparkle2} />
            <Sparkles size={18} className={styles.sparkle3} />
          </div>
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
        <p className={styles.hint}>Esto puede tomar unos momentos...</p>
      </div>
    </div>
  );
}

export default FullScreenLoading;

