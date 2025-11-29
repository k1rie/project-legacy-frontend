import { BookOpen, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './WelcomeMessage.module.css';

function WelcomeMessage() {
  const navigate = useNavigate();

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.content}>
        <h1 className={styles.title}>TeachEs</h1>
        <p className={styles.subtitle}>
          Plataforma de planificación educativa con asistencia inteligente
        </p>
        
        <div className={styles.messageBox}>
          <p className={styles.message}>
            Comienza organizando tus grupos de estudiantes. Una vez configurados, 
            podrás crear clases personalizadas y generar flujos de enseñanza 
            estructurados automáticamente.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => navigate('/grupos')}
            className={styles.actionCard}
          >
            <div className={styles.actionIcon}>
              <Users size={24} />
            </div>
            <div className={styles.actionContent}>
              <h3>Grupos</h3>
              <p>Organiza y gestiona tus grupos de estudiantes</p>
            </div>
            <ArrowRight size={20} className={styles.arrow} />
          </button>
          
          <button
            onClick={() => navigate('/clases')}
            className={styles.actionCard}
          >
            <div className={styles.actionIcon}>
              <BookOpen size={24} />
            </div>
            <div className={styles.actionContent}>
              <h3>Clases</h3>
              <p>Crea y planifica tus sesiones de enseñanza</p>
            </div>
            <ArrowRight size={20} className={styles.arrow} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeMessage;

