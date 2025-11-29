import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, BookOpen, Users } from 'lucide-react';
import { API_BASE_URL } from '../../../services/apiService';
import Loading from '../../../components/Loading/Loading';
import EmptyState from '../../../components/EmptyState/EmptyState';
import styles from './ClasesList.module.css';

function ClasesList() {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadClases();
  }, []);

  const loadClases = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/clases`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar las clases');
      }

      setClases(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar las clases');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta clase?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/clases/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar la clase');
      }

      // Animación de eliminación
      const claseElement = e.currentTarget.closest(`[data-clase-id="${id}"]`);
      if (claseElement) {
        claseElement.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
          setClases(clases.filter(clase => clase.id !== id));
        }, 300);
      } else {
        setClases(clases.filter(clase => clase.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Error al eliminar la clase');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Loading message="Buscando tus clases..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.error}>{error}</div>
          <button onClick={loadClases} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleRow}>
            <h1>Clases</h1>
          </div>
          <p className={styles.subtitle}>Planifica y organiza tus clases con nuestro asistente inteligente</p>
        </div>
        <button
          onClick={() => navigate('/clases/nuevo')}
          className={styles.createButton}
        >
          <Plus size={18} />
          Nueva Clase
        </button>
      </div>

      {clases.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Crea tu primera clase"
          message="Nuestro asistente te ayudará a generar planes de clase completos y profesionales para tus estudiantes."
          actionLabel="Crear primera clase"
          onAction={() => navigate('/clases/nuevo')}
        />
      ) : (
        <div className={styles.grid}>
          {clases.map((clase, index) => (
            <div
              key={clase.id}
              data-clase-id={clase.id}
              className={styles.card}
              style={{ 
                animationDelay: `${index * 0.05}s`,
                '--card-color': '#0A66E6'
              }}
              onClick={() => navigate(`/clases/${clase.id}`)}
            >
              <div className={styles.cardVisual}>
                <div className={styles.cardGradient}></div>
                <div className={styles.cardIcon}>
                  <BookOpen size={32} />
                </div>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h2>{clase.tema}</h2>
                  <div className={styles.actions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/clases/${clase.id}/editar`);
                      }}
                      className={styles.editButton}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(clase.id, e)}
                      className={styles.deleteButton}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  {clase.grupo_nombre && (
                    <div className={styles.grupoInfo}>
                      <Users size={14} />
                      <span className={styles.grupoBadge}>{clase.grupo_nombre}</span>
                    </div>
                  )}
                  <div className={styles.badges}>
                    <span className={styles.badge}>{clase.nivel}</span>
                    <span className={styles.badge}>{clase.duracion} min</span>
                  </div>
                  {clase.contexto && (
                    <p className={styles.description}>{clase.contexto}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClasesList;

