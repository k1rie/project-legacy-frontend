import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ClipboardList, Clock, Users, BookOpen, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../../../services/apiService';
import Loading from '../../../components/Loading/Loading';
import styles from './TareaPublica.module.css';

function TareaPublica() {
  const { link } = useParams();
  const [tarea, setTarea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTarea();
  }, [link]);

  const loadTarea = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tareas/publico/${link}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar la tarea');
      }

      setTarea(data.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar la tarea');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Loading message="Cargando tarea..." />
      </div>
    );
  }

  if (error || !tarea) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Tarea no encontrada</h2>
          <p>{error || 'La tarea que buscas no existe o ha sido eliminada.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <ClipboardList size={32} />
          </div>
          <div className={styles.titleSection}>
            <h1>{tarea.titulo}</h1>
            <div className={styles.meta}>
              {tarea.clase_tema && (
                <span className={styles.metaItem}>
                  <BookOpen size={14} />
                  {tarea.clase_tema}
                </span>
              )}
              {tarea.clase_nivel && (
                <span className={styles.metaItem}>{tarea.clase_nivel}</span>
              )}
              {tarea.grupo_nombre && (
                <span className={styles.metaItem}>
                  <Users size={14} />
                  {tarea.grupo_nombre}
                </span>
              )}
              {tarea.fecha_limite && (
                <span className={styles.metaItem}>
                  <Calendar size={14} />
                  Límite: {new Date(tarea.fecha_limite).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {tarea.descripcion && (
        <div className={styles.description}>
          <p>{tarea.descripcion}</p>
        </div>
      )}

      {tarea.instrucciones && (
        <div className={styles.instructions}>
          <h2>Instrucciones</h2>
          <div className={styles.instructionsContent}>
            {tarea.instrucciones.split('\n').map((line, index) => {
              // Detectar títulos
              if (line.startsWith('# ')) {
                return <h1 key={index}>{line.substring(2)}</h1>;
              }
              if (line.startsWith('## ')) {
                return <h2 key={index}>{line.substring(3)}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={index}>{line.substring(4)}</h3>;
              }
              // Detectar listas
              if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
                return <li key={index}>{line.replace(/^[-*]\s|^\d+\.\s/, '')}</li>;
              }
              // Líneas vacías
              if (line.trim() === '') {
                return <br key={index} />;
              }
              // Párrafos normales
              return <p key={index}>{line}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default TareaPublica;

