import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, Clock, Users, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../../../services/apiService';
import Loading from '../../../components/Loading/Loading';
import styles from './ApuntePublico.module.css';

function ApuntePublico() {
  const { link } = useParams();
  const [apunte, setApunte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadApunte();
  }, [link]);

  const loadApunte = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/apuntes/publico/${link}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar el apunte');
      }

      setApunte(data.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar el apunte');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Loading message="Cargando apunte..." />
      </div>
    );
  }

  if (error || !apunte) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Apunte no encontrado</h2>
          <p>{error || 'El apunte que buscas no existe o ha sido eliminado.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <BookOpen size={32} />
          </div>
          <div className={styles.titleSection}>
            <h1>{apunte.titulo}</h1>
            <div className={styles.meta}>
              {apunte.clase_tema && (
                <span className={styles.metaItem}>
                  <BookOpen size={14} />
                  {apunte.clase_tema}
                </span>
              )}
              {apunte.clase_nivel && (
                <span className={styles.metaItem}>{apunte.clase_nivel}</span>
              )}
              {apunte.grupo_nombre && (
                <span className={styles.metaItem}>
                  <Users size={14} />
                  {apunte.grupo_nombre}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.markdownContent}>
          {apunte.contenido.split('\n').map((line, index) => {
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
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return <li key={index}>{line.substring(2)}</li>;
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
    </div>
  );
}

export default ApuntePublico;

