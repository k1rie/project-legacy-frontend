import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, BookOpen, Plus, Users, GraduationCap, UsersRound, School } from 'lucide-react';
import { API_BASE_URL } from '../../../services/apiService';
import { useToast } from '../../../contexts/ToastContext';
import Loading from '../../../components/Loading/Loading';
import styles from './GruposDetail.module.css';

function GruposDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [grupo, setGrupo] = useState(null);
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingClases, setLoadingClases] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGrupo();
    loadClases();
  }, [id]);

  const loadGrupo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/grupos/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar el grupo');
      }

      setGrupo(data.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar el grupo');
    } finally {
      setLoading(false);
    }
  };

  const loadClases = async () => {
    try {
      setLoadingClases(true);
      const response = await fetch(`${API_BASE_URL}/clases/grupo/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok) {
        setClases(data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar clases:', err);
    } finally {
      setLoadingClases(false);
    }
  };

  const handleDelete = async () => {
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

      showToast('Grupo eliminado exitosamente', 'success');
      setTimeout(() => {
        navigate('/grupos');
      }, 500);
    } catch (err) {
      showToast(err.message || 'Error al eliminar el grupo', 'error');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Loading message="Cargando información del grupo..." />
      </div>
    );
  }

  if (error || !grupo) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Grupo no encontrado'}</div>
        <button onClick={() => navigate('/grupos')} className={styles.backButton}>
          Volver a Grupos
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate('/grupos')} className={styles.backButton}>
          <ArrowLeft size={18} />
          Volver
        </button>
        <div className={styles.actions}>
          <button
            onClick={() => navigate(`/grupos/${id}/editar`)}
            className={styles.editButton}
          >
            <Edit size={18} />
            Editar
          </button>
          <button onClick={handleDelete} className={styles.deleteButton}>
            <Trash2 size={18} />
            Eliminar
          </button>
        </div>
      </div>

      <div className={styles.infoCard}>
        <div className={styles.visualHeader}>
          <div 
            className={styles.visualSection}
            style={{ '--card-color': grupo.color || '#0A66E6' }}
          >
            <div className={styles.visualGradient}></div>
            <div className={styles.visualIcon}>
              {grupo.icon === 'book' ? <BookOpen size={48} /> :
               grupo.icon === 'graduation' ? <GraduationCap size={48} /> :
               grupo.icon === 'users-round' ? <UsersRound size={48} /> :
               grupo.icon === 'school' ? <School size={48} /> :
               <Users size={48} />}
            </div>
          </div>
          <div className={styles.headerContent}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{grupo.nombre}</h1>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <Users size={20} />
                <span>{grupo.numero_estudiantes || 0} estudiantes</span>
              </div>
            </div>
          </div>
        </div>
        
        {grupo.descripcion && (
          <div className={styles.descriptionSection}>
            <span className={styles.sectionLabel}>Descripción</span>
            <p className={styles.description}>{grupo.descripcion}</p>
          </div>
        )}
      </div>

      <div className={styles.clasesSection}>
        <div className={styles.clasesHeader}>
          <h2>Clases del Grupo</h2>
          <button
            onClick={() => navigate(`/clases/nuevo?grupo_id=${id}`)}
            className={styles.addClaseButton}
          >
            <Plus size={16} />
            Nueva Clase
          </button>
        </div>

        {loadingClases ? (
          <div className={styles.loadingClases}>Cargando clases...</div>
        ) : clases.length === 0 ? (
          <div className={styles.emptyClases}>
            <p>No hay clases en este grupo</p>
          </div>
        ) : (
          <div className={styles.clasesList}>
            {clases.map((clase) => (
              <div
                key={clase.id}
                className={styles.claseCard}
                onClick={() => navigate(`/clases/${clase.id}`)}
              >
                <div className={styles.claseHeader}>
                  <BookOpen size={18} />
                  <h3>{clase.tema}</h3>
                </div>
                <div className={styles.claseInfo}>
                  <span className={styles.claseBadge}>{clase.nivel}</span>
                  <span className={styles.claseBadge}>{clase.duracion} min</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GruposDetail;

