import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, BookOpen, GraduationCap, UsersRound, School } from 'lucide-react';
import { API_BASE_URL } from '../../../services/apiService';
import Loading from '../../../components/Loading/Loading';
import EmptyState from '../../../components/EmptyState/EmptyState';
import styles from './GruposList.module.css';

function GruposList() {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadGrupos();
  }, []);

  const loadGrupos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/grupos`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar los grupos');
      }

      setGrupos(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar los grupos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que deseas eliminar este grupo?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/grupos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar el grupo');
      }

      // Animación de eliminación
      const grupoElement = e.currentTarget.closest(`[data-grupo-id="${id}"]`);
      if (grupoElement) {
        grupoElement.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
          setGrupos(grupos.filter(grupo => grupo.id !== id));
        }, 300);
      } else {
        setGrupos(grupos.filter(grupo => grupo.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Error al eliminar el grupo');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Loading message="Preparando tus grupos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.error}>{error}</div>
          <button onClick={loadGrupos} className={styles.retryButton}>
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
            <h1>Grupos</h1>
          </div>
          <p className={styles.subtitle}>Organiza tus estudiantes en grupos para planificar clases con IA</p>
        </div>
        <button
          onClick={() => navigate('/grupos/nuevo')}
          className={styles.createButton}
        >
          <Plus size={18} />
          Nuevo Grupo
        </button>
      </div>

      {grupos.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Comienza creando tu primer grupo"
          message="Los grupos te ayudan a organizar a tus estudiantes y planificar clases personalizadas para cada uno."
          actionLabel="Crear primer grupo"
          onAction={() => navigate('/grupos/nuevo')}
        />
      ) : (
        <div className={styles.grid}>
          {grupos.map((grupo, index) => (
            <div
              key={grupo.id}
              data-grupo-id={grupo.id}
              className={styles.card}
              style={{ 
                animationDelay: `${index * 0.05}s`,
                '--card-color': grupo.color || '#0A66E6'
              }}
              onClick={() => navigate(`/grupos/${grupo.id}`)}
            >
              <div className={styles.cardVisual}>
                <div className={styles.cardGradient}></div>
                <div className={styles.cardIcon}>
                  {grupo.icon === 'book' ? <BookOpen size={32} /> :
                   grupo.icon === 'graduation' ? <GraduationCap size={32} /> :
                   grupo.icon === 'users-round' ? <UsersRound size={32} /> :
                   grupo.icon === 'school' ? <School size={32} /> :
                   <Users size={32} />}
                </div>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h2>{grupo.nombre}</h2>
                  <div className={styles.actions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/grupos/${grupo.id}/editar`);
                      }}
                      className={styles.editButton}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(grupo.id, e)}
                      className={styles.deleteButton}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.info}>
                    <span className={styles.label}>Estudiantes:</span>
                    <span className={styles.value}>{grupo.numero_estudiantes || 0}</span>
                  </div>
                  {grupo.descripcion && (
                    <p className={styles.description}>{grupo.descripcion}</p>
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

export default GruposList;

