import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Users, GitBranch, Sparkles, BookOpen, Clock, Target, FileText, Trash, Play, CheckCircle2, ClipboardList, Copy, ExternalLink, Maximize2 } from 'lucide-react';
import { API_BASE_URL } from '../../../services/apiService';
import { FRONTEND_BASE_URL } from '../../../config/api';
import { useToast } from '../../../contexts/ToastContext';
import Loading from '../../../components/Loading/Loading';
import FlowCanvas from '../../../components/FlowCanvas/FlowCanvas';
import FullScreenLoading from '../../../components/FullScreenLoading/FullScreenLoading';
import ClassSession from '../../../components/ClassSession/ClassSession';
import FlowSummary from '../../../components/FlowSummary/FlowSummary';
import styles from './ClasesDetail.module.css';

function ClasesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [clase, setClase] = useState(null);
  const [flujos, setFlujos] = useState([]);
  const [apuntes, setApuntes] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFlujos, setLoadingFlujos] = useState(true);
  const [loadingApuntes, setLoadingApuntes] = useState(true);
  const [loadingTareas, setLoadingTareas] = useState(true);
  const [generatingFlows, setGeneratingFlows] = useState(false);
  const [generatingApunte, setGeneratingApunte] = useState(false);
  const [generatingTarea, setGeneratingTarea] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showFlowSummary, setShowFlowSummary] = useState(false);
  const [showFullscreenFlow, setShowFullscreenFlow] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClase();
    loadFlujos();
    loadApuntes();
    loadTareas();
  }, [id]);

  const loadClase = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/clases/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar la clase');
      }

      setClase(data.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar la clase');
    } finally {
      setLoading(false);
    }
  };

  const loadFlujos = async () => {
    try {
      setLoadingFlujos(true);
      const response = await fetch(`${API_BASE_URL}/flujos/clase/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok) {
        setFlujos(data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar flujos:', err);
    } finally {
      setLoadingFlujos(false);
    }
  };

  const handleGenerateFlows = async () => {
    const message = flujos.length > 0 
      ? '¿Deseas regenerar los flujos? Esto eliminará los flujos existentes y creará nuevos.'
      : '¿Deseas generar flujos automáticamente con IA? Esto creará un plan completo para tu clase.';
    
    if (!window.confirm(message)) {
      return;
    }

    try {
      setGeneratingFlows(true);
      
      // Si ya hay flujos, eliminarlos primero
      if (flujos.length > 0) {
        for (const flujo of flujos) {
          try {
            await fetch(`${API_BASE_URL}/flujos/${flujo.id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            });
          } catch (err) {
            console.error('Error al eliminar flujo:', err);
          }
        }
      }

      const response = await fetch(`${API_BASE_URL}/flujos/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clase_id: parseInt(id) }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al generar flujos');
      }

      showToast(
        `¡Perfecto! ${data.data.length} flujo(s) generado(s) con IA`,
        'success'
      );
      loadFlujos();
    } catch (err) {
      showToast(err.message || 'Error al generar flujos', 'error');
    } finally {
      setGeneratingFlows(false);
    }
  };

  const handleDeleteFlujo = async (flujoId, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que deseas eliminar este flujo?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/flujos/${flujoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar el flujo');
      }

      showToast('Flujo eliminado exitosamente', 'success');
      loadFlujos();
    } catch (err) {
      showToast(err.message || 'Error al eliminar el flujo', 'error');
    }
  };

  const loadApuntes = async () => {
    try {
      setLoadingApuntes(true);
      const response = await fetch(`${API_BASE_URL}/apuntes/clase/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok) {
        setApuntes(data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar apuntes:', err);
    } finally {
      setLoadingApuntes(false);
    }
  };

  const loadTareas = async () => {
    try {
      setLoadingTareas(true);
      const response = await fetch(`${API_BASE_URL}/tareas/clase/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok) {
        setTareas(data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar tareas:', err);
    } finally {
      setLoadingTareas(false);
    }
  };

  const handleGenerateApunte = async () => {
    if (!window.confirm('¿Deseas generar un apunte automáticamente con IA para esta clase?')) {
      return;
    }

    try {
      setGeneratingApunte(true);
      const response = await fetch(`${API_BASE_URL}/apuntes/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clase_id: parseInt(id) }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al generar apunte');
      }

      showToast('Apunte generado exitosamente', 'success');
      loadApuntes();
    } catch (err) {
      showToast(err.message || 'Error al generar apunte', 'error');
    } finally {
      setGeneratingApunte(false);
    }
  };

  const handleGenerateTarea = async () => {
    if (!window.confirm('¿Deseas generar una tarea automáticamente con IA para esta clase?')) {
      return;
    }

    try {
      setGeneratingTarea(true);
      const response = await fetch(`${API_BASE_URL}/tareas/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clase_id: parseInt(id) }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al generar tarea');
      }

      showToast('Tarea generada exitosamente', 'success');
      loadTareas();
    } catch (err) {
      showToast(err.message || 'Error al generar tarea', 'error');
    } finally {
      setGeneratingTarea(false);
    }
  };

  const handleDeleteApunte = async (apunteId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este apunte?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/apuntes/${apunteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar el apunte');
      }

      showToast('Apunte eliminado exitosamente', 'success');
      loadApuntes();
    } catch (err) {
      showToast(err.message || 'Error al eliminar el apunte', 'error');
    }
  };

  const handleDeleteTarea = async (tareaId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tareas/${tareaId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar la tarea');
      }

      showToast('Tarea eliminada exitosamente', 'success');
      loadTareas();
    } catch (err) {
      showToast(err.message || 'Error al eliminar la tarea', 'error');
    }
  };

  const copyLink = (link, tipo) => {
    const fullLink = `${FRONTEND_BASE_URL}/${tipo}/publico/${link}`;
    navigator.clipboard.writeText(fullLink);
    showToast('Link copiado al portapapeles', 'success');
  };

  const handleDelete = async () => {
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

      showToast('Clase eliminada exitosamente', 'success');
      setTimeout(() => {
        navigate('/clases');
      }, 500);
    } catch (err) {
      showToast(err.message || 'Error al eliminar la clase', 'error');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Loading message="Cargando información de la clase..." />
      </div>
    );
  }

  if (error || !clase) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Clase no encontrada'}</div>
        <button onClick={() => navigate('/clases')} className={styles.backButton}>
          Volver a Clases
        </button>
      </div>
    );
  }

  if (generatingFlows) {
    return (
      <FullScreenLoading 
        title="Generando tu flujo de clase"
        message="Nuestro asistente IA está creando un flujo personalizado para tu clase..."
      />
    );
  }

  if (generatingApunte) {
    return (
      <FullScreenLoading 
        title="Generando tu apunte"
        message="Nuestro asistente IA está creando un apunte personalizado para tu clase..."
      />
    );
  }

  if (generatingTarea) {
    return (
      <FullScreenLoading 
        title="Generando tu tarea"
        message="Nuestro asistente IA está creando una tarea personalizada para tu clase..."
      />
    );
  }

  // Vista fullscreen del flujo
  if (showFullscreenFlow && flujos.length > 0 && !loadingFlujos) {
    const sortedFlujos = [...flujos].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    return (
      <div className={styles.fullscreenFlowView}>
        <div className={styles.fullscreenFlowHeader}>
          <div className={styles.fullscreenFlowHeaderLeft}>
            <button onClick={() => setShowFullscreenFlow(false)} className={styles.backButton}>
              <ArrowLeft size={18} />
              Volver
            </button>
            <div className={styles.flowTitle}>
              <GitBranch size={24} />
              <div>
                <h2>{clase.tema} - Flujo de Clase</h2>
                <div className={styles.flowStats}>
                  <span className={styles.flowStat}>
                    <CheckCircle2 size={14} />
                    {sortedFlujos.length} pasos
                  </span>
                  <span className={styles.flowStat}>
                    <Clock size={14} />
                    {sortedFlujos.reduce((sum, flujo) => sum + (flujo.tiempo_duracion || 0), 0)} min total
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.fullscreenFlowHeaderRight}>
            <button
              onClick={() => setShowFlowSummary(true)}
              className={styles.startSessionButton}
            >
              <Play size={18} />
              Iniciar Sesión
            </button>
          </div>
        </div>
        <div className={styles.fullscreenFlowContainer}>
          <FlowCanvas flujos={flujos} />
        </div>
      </div>
    );
  }

  // Si hay flujos, mostrar vista normal con opción de fullscreen
  if (flujos.length > 0 && !loadingFlujos) {
    // Si la sesión está activa, mostrar el modo de clase
    if (isSessionActive) {
      return (
        <ClassSession
          flujos={flujos}
          onEndSession={() => setIsSessionActive(false)}
        />
      );
    }

    const sortedFlujos = [...flujos].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    const totalTime = sortedFlujos.reduce((sum, flujo) => sum + (flujo.tiempo_duracion || 0), 0);

    return (
      <div className={styles.container}>
        <div className={styles.flowOnlyView}>
          <div className={styles.flowHeader}>
            <div className={styles.flowHeaderLeft}>
              <button onClick={() => navigate('/clases')} className={styles.backButton}>
                <ArrowLeft size={18} />
                Volver
              </button>
              <div className={styles.flowTitle}>
                <GitBranch size={24} />
                <div>
                  <h2>{clase.tema} - Flujo de Clase</h2>
                  <div className={styles.flowStats}>
                    <span className={styles.flowStat}>
                      <CheckCircle2 size={14} />
                      {sortedFlujos.length} pasos
                    </span>
                    <span className={styles.flowStat}>
                      <Clock size={14} />
                      {totalTime} min total
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.flowHeaderRight}>
              <button
                onClick={() => setShowFullscreenFlow(true)}
                className={styles.fullscreenButton}
                title="Ver en pantalla completa"
              >
                <Maximize2 size={18} />
                Pantalla Completa
              </button>
              <button
                onClick={() => setShowFlowSummary(true)}
                className={styles.startSessionButton}
              >
                <Play size={18} />
                Iniciar Sesión
              </button>
              <button
                onClick={() => navigate(`/clases/${id}/editar`)}
                className={styles.editButton}
              >
                <Edit size={18} />
                Editar
              </button>
              <button
                onClick={handleGenerateFlows}
                className={styles.createFlowButton}
                disabled={generatingFlows || loadingFlujos}
              >
                <Sparkles size={18} />
                Regenerar Flujos
              </button>
            </div>
          </div>

          <div className={styles.flowContainer}>
            <FlowCanvas flujos={flujos} />
          </div>
        </div>

        {/* Sección de Apuntes */}
        <div className={styles.resourcesSection}>
          <div className={styles.resourcesHeader}>
            <div className={styles.resourcesTitle}>
              <FileText size={24} />
              <h2>Apuntes</h2>
            </div>
            <button
              onClick={handleGenerateApunte}
              className={styles.generateButton}
              disabled={generatingApunte}
            >
              <Sparkles size={18} />
              {generatingApunte ? 'Generando...' : 'Generar Apunte con IA'}
            </button>
          </div>

          {loadingApuntes ? (
            <div className={styles.loadingResources}>Cargando apuntes...</div>
          ) : apuntes.length === 0 ? (
            <div className={styles.emptyResources}>
              <FileText size={48} className={styles.emptyIcon} />
              <p>No hay apuntes generados aún</p>
              <p className={styles.emptySubtext}>Genera apuntes automáticamente con IA para compartir con tus estudiantes</p>
            </div>
          ) : (
            <div className={styles.resourcesList}>
              {apuntes.map((apunte) => (
                <div key={apunte.id} className={styles.resourceCard}>
                  <div className={styles.resourceHeader}>
                    <div className={styles.resourceInfo}>
                      <h3>{apunte.titulo}</h3>
                      <span className={styles.resourceDate}>
                        {new Date(apunte.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteApunte(apunte.id)}
                      className={styles.deleteResourceButton}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className={styles.resourceLink}>
                    <div className={styles.linkDisplay}>
                      <ExternalLink size={14} />
                      <span className={styles.linkText}>
                        {`${FRONTEND_BASE_URL}/apuntes/publico/${apunte.link_unico}`}
                      </span>
                    </div>
                    <button
                      onClick={() => copyLink(apunte.link_unico, 'apuntes')}
                      className={styles.copyButton}
                      title="Copiar link"
                    >
                      <Copy size={16} />
                      Copiar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de Tareas */}
        <div className={styles.resourcesSection}>
          <div className={styles.resourcesHeader}>
            <div className={styles.resourcesTitle}>
              <ClipboardList size={24} />
              <h2>Tareas</h2>
            </div>
            <button
              onClick={handleGenerateTarea}
              className={styles.generateButton}
              disabled={generatingTarea}
            >
              <Sparkles size={18} />
              {generatingTarea ? 'Generando...' : 'Generar Tarea con IA'}
            </button>
          </div>

          {loadingTareas ? (
            <div className={styles.loadingResources}>Cargando tareas...</div>
          ) : tareas.length === 0 ? (
            <div className={styles.emptyResources}>
              <ClipboardList size={48} className={styles.emptyIcon} />
              <p>No hay tareas generadas aún</p>
              <p className={styles.emptySubtext}>Genera tareas automáticamente con IA para asignar a tus estudiantes</p>
            </div>
          ) : (
            <div className={styles.resourcesList}>
              {tareas.map((tarea) => (
                <div key={tarea.id} className={styles.resourceCard}>
                  <div className={styles.resourceHeader}>
                    <div className={styles.resourceInfo}>
                      <h3>{tarea.titulo}</h3>
                      <div className={styles.resourceMeta}>
                        <span className={styles.resourceDate}>
                          {new Date(tarea.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        {tarea.fecha_limite && (
                          <span className={styles.deadline}>
                            Límite: {new Date(tarea.fecha_limite).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTarea(tarea.id)}
                      className={styles.deleteResourceButton}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {tarea.descripcion && (
                    <p className={styles.resourceDescription}>{tarea.descripcion}</p>
                  )}
                  <div className={styles.resourceLink}>
                    <div className={styles.linkDisplay}>
                      <ExternalLink size={14} />
                      <span className={styles.linkText}>
                        {`${FRONTEND_BASE_URL}/tareas/publico/${tarea.link_unico}`}
                      </span>
                    </div>
                    <button
                      onClick={() => copyLink(tarea.link_unico, 'tareas')}
                      className={styles.copyButton}
                      title="Copiar link"
                    >
                      <Copy size={16} />
                      Copiar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mostrar resumen del flujo antes de iniciar sesión
  if (showFlowSummary && flujos.length > 0) {
    return (
      <FlowSummary
        flujos={flujos}
        onStartSession={() => {
          setShowFlowSummary(false);
          setIsSessionActive(true);
        }}
        onClose={() => setShowFlowSummary(false)}
      />
    );
  }

  // Vista normal cuando no hay flujos
  return (
    <div className={styles.container}>
      <div className={styles.contentSection}>
        <div className={styles.header}>
          <button onClick={() => navigate('/clases')} className={styles.backButton}>
            <ArrowLeft size={18} />
            Volver
          </button>
          <div className={styles.actions}>
            <button
              onClick={() => navigate(`/clases/${id}/editar`)}
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
            <div className={styles.visualSection}>
              <div className={styles.visualGradient}></div>
              <div className={styles.visualIcon}>
                <BookOpen size={48} />
              </div>
            </div>
            <div className={styles.headerContent}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{clase.tema}</h1>
              </div>
              <div className={styles.badges}>
                <div className={styles.badge}>
                  <Clock size={16} />
                  <span>{clase.duracion} min</span>
                </div>
                <div className={styles.badge}>
                  <span>{clase.nivel}</span>
                </div>
                {clase.grupo_nombre && (
                  <button
                    onClick={() => navigate(`/grupos/${clase.grupo_id}`)}
                    className={styles.grupoBadge}
                  >
                    <Users size={14} />
                    {clase.grupo_nombre}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className={styles.infoSection}>
            {clase.contexto && (
              <div className={styles.infoItem}>
                <div className={styles.infoHeader}>
                  <FileText size={20} />
                  <span className={styles.infoLabel}>Contexto</span>
                </div>
                <p className={styles.infoText}>{clase.contexto}</p>
              </div>
            )}

            {clase.objetivos && (
              <div className={styles.infoItem}>
                <div className={styles.infoHeader}>
                  <Target size={20} />
                  <span className={styles.infoLabel}>Objetivos</span>
                </div>
                <p className={styles.infoText}>{clase.objetivos}</p>
              </div>
            )}

            {clase.recursos_necesarios && (
              <div className={styles.infoItem}>
                <div className={styles.infoHeader}>
                  <FileText size={20} />
                  <span className={styles.infoLabel}>Recursos Necesarios</span>
                </div>
                <p className={styles.infoText}>{clase.recursos_necesarios}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {flujos.length === 0 && !loadingFlujos && (
        <div className={styles.flowSection}>
          <div className={styles.flowHeader}>
            <div className={styles.flowTitle}>
              <GitBranch size={24} />
              <h2>Flujo de la Clase</h2>
            </div>
            <button
              onClick={handleGenerateFlows}
              className={styles.createFlowButton}
              disabled={generatingFlows || loadingFlujos}
            >
              <Sparkles size={18} />
              Generar Flujos con IA
            </button>
          </div>

          <div className={styles.flowContainer}>
            <div className={styles.emptyFlow}>
              <GitBranch size={48} className={styles.emptyIcon} />
              <h3>No hay flujo creado aún</h3>
              <p>Genera flujos automáticamente con IA para guiar a tus estudiantes paso a paso</p>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Apuntes */}
      <div className={styles.resourcesSection}>
        <div className={styles.resourcesHeader}>
          <div className={styles.resourcesTitle}>
            <FileText size={24} />
            <h2>Apuntes</h2>
          </div>
          <button
            onClick={handleGenerateApunte}
            className={styles.generateButton}
            disabled={generatingApunte}
          >
            <Sparkles size={18} />
            {generatingApunte ? 'Generando...' : 'Generar Apunte con IA'}
          </button>
        </div>

        {loadingApuntes ? (
          <div className={styles.loadingResources}>Cargando apuntes...</div>
        ) : apuntes.length === 0 ? (
          <div className={styles.emptyResources}>
            <FileText size={48} className={styles.emptyIcon} />
            <p>No hay apuntes generados aún</p>
            <p className={styles.emptySubtext}>Genera apuntes automáticamente con IA para compartir con tus estudiantes</p>
          </div>
        ) : (
          <div className={styles.resourcesList}>
            {apuntes.map((apunte) => (
              <div key={apunte.id} className={styles.resourceCard}>
                <div className={styles.resourceHeader}>
                  <div className={styles.resourceInfo}>
                    <h3>{apunte.titulo}</h3>
                    <span className={styles.resourceDate}>
                      {new Date(apunte.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteApunte(apunte.id)}
                    className={styles.deleteResourceButton}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className={styles.resourceLink}>
                  <div className={styles.linkDisplay}>
                    <ExternalLink size={14} />
                    <span className={styles.linkText}>
                      {`${API_BASE_URL}/apuntes/publico/${apunte.link_unico}`}
                    </span>
                  </div>
                  <button
                    onClick={() => copyLink(apunte.link_unico, 'apuntes')}
                    className={styles.copyButton}
                    title="Copiar link"
                  >
                    <Copy size={16} />
                    Copiar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección de Tareas */}
      <div className={styles.resourcesSection}>
        <div className={styles.resourcesHeader}>
          <div className={styles.resourcesTitle}>
            <ClipboardList size={24} />
            <h2>Tareas</h2>
          </div>
          <button
            onClick={handleGenerateTarea}
            className={styles.generateButton}
            disabled={generatingTarea}
          >
            <Sparkles size={18} />
            {generatingTarea ? 'Generando...' : 'Generar Tarea con IA'}
          </button>
        </div>

        {loadingTareas ? (
          <div className={styles.loadingResources}>Cargando tareas...</div>
        ) : tareas.length === 0 ? (
          <div className={styles.emptyResources}>
            <ClipboardList size={48} className={styles.emptyIcon} />
            <p>No hay tareas generadas aún</p>
            <p className={styles.emptySubtext}>Genera tareas automáticamente con IA para asignar a tus estudiantes</p>
          </div>
        ) : (
          <div className={styles.resourcesList}>
            {tareas.map((tarea) => (
              <div key={tarea.id} className={styles.resourceCard}>
                <div className={styles.resourceHeader}>
                  <div className={styles.resourceInfo}>
                    <h3>{tarea.titulo}</h3>
                    <div className={styles.resourceMeta}>
                      <span className={styles.resourceDate}>
                        {new Date(tarea.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {tarea.fecha_limite && (
                        <span className={styles.deadline}>
                          Límite: {new Date(tarea.fecha_limite).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTarea(tarea.id)}
                    className={styles.deleteResourceButton}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {tarea.descripcion && (
                  <p className={styles.resourceDescription}>{tarea.descripcion}</p>
                )}
                <div className={styles.resourceLink}>
                  <div className={styles.linkDisplay}>
                    <ExternalLink size={14} />
                    <span className={styles.linkText}>
                      {`${API_BASE_URL}/tareas/publico/${tarea.link_unico}`}
                    </span>
                  </div>
                  <button
                    onClick={() => copyLink(tarea.link_unico, 'tareas')}
                    className={styles.copyButton}
                    title="Copiar link"
                  >
                    <Copy size={16} />
                    Copiar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClasesDetail;

