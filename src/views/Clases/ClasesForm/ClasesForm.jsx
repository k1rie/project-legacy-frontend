import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, Wand2, BookOpen, Users, Clock, Target, FileText } from 'lucide-react';
import { API_BASE_URL } from '../../../services/apiService';
import { useToast } from '../../../contexts/ToastContext';
import Loading from '../../../components/Loading/Loading';
import FullScreenLoading from '../../../components/FullScreenLoading/FullScreenLoading';
import styles from './ClasesForm.module.css';

function ClasesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    grupo_id: '',
    tema: '',
    contexto: '',
    objetivos: '',
    duracion: 0,
    nivel: 'Principiante',
    recursos_necesarios: '',
  });

  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingFlows, setGeneratingFlows] = useState(false);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [currentStep, setCurrentStep] = useState(0);

  const niveles = ['Principiante', 'Intermedio', 'Avanzado'];

  const steps = [
    { id: 'grupo', label: 'Grupo', icon: Users },
    { id: 'tema', label: 'Tema', icon: BookOpen },
    { id: 'nivel', label: 'Nivel y Duración', icon: Clock },
    { id: 'contexto', label: 'Contexto', icon: FileText },
    { id: 'objetivos', label: 'Objetivos', icon: Target },
    { id: 'recursos', label: 'Recursos', icon: FileText },
    { id: 'generate', label: 'Generar Flow', icon: Wand2 },
  ];

  const totalSteps = steps.length;

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.grupo_id !== '';
      case 1:
        return formData.tema.trim() !== '';
      case 2:
        return formData.duracion > 0 && formData.nivel !== '';
      case 3:
        return true; // Contexto es opcional
      case 4:
        return true; // Objetivos es opcional
      case 5:
        return true; // Recursos es opcional
      default:
        return true;
    }
  };

  useEffect(() => {
    loadGrupos();
    if (isEdit) {
      loadClase();
    } else {
      // Si hay grupo_id en la URL, establecerlo por defecto
      const grupoIdFromUrl = searchParams.get('grupo_id');
      if (grupoIdFromUrl) {
        setFormData(prev => ({
          ...prev,
          grupo_id: parseInt(grupoIdFromUrl),
        }));
      }
    }
  }, [id, searchParams]);

  const loadGrupos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/grupos`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok) {
        setGrupos(data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar grupos:', err);
    }
  };

  const loadClase = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(`${API_BASE_URL}/clases/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar la clase');
      }

      const clase = data.data;
      setFormData({
        grupo_id: clase.grupo_id || '',
        tema: clase.tema || '',
        contexto: clase.contexto || '',
        objetivos: clase.objetivos || '',
        duracion: clase.duracion || 0,
        nivel: clase.nivel || 'Principiante',
        recursos_necesarios: clase.recursos_necesarios || '',
      });
    } catch (err) {
      setError(err.message || 'Error al cargar la clase');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duracion' || name === 'grupo_id' ? parseInt(value) || (name === 'grupo_id' ? '' : 0) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit ? `${API_BASE_URL}/clases/${id}` : `${API_BASE_URL}/clases`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar la clase');
      }

      const claseId = isEdit ? id : data.data.id;

      // Si es creación nueva y estamos en el último paso, generar flujos con IA
      if (!isEdit && currentStep === totalSteps - 1) {
        // Activar la animación de carga fullscreen
        setGeneratingFlows(true);
        setLoading(false); // Desactivar el loading del formulario
        
        try {
          const flowResponse = await fetch(`${API_BASE_URL}/flujos/ai`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clase_id: claseId }),
          });
          const flowData = await flowResponse.json();

          if (flowResponse.ok) {
            showToast(
              `¡Perfecto! ${flowData.data.length} flujo(s) generado(s) con IA`,
              'success'
            );
            // Esperar un momento para que se vea el mensaje de éxito
            setTimeout(() => {
              navigate(`/clases/${claseId}`);
            }, 1500);
          } else {
            setGeneratingFlows(false);
            showToast(flowData.message || 'Clase creada, pero error al generar flujos', 'warning');
            setTimeout(() => {
              navigate(`/clases/${claseId}`);
            }, 1000);
          }
        } catch (flowErr) {
          setGeneratingFlows(false);
          showToast('Clase creada, pero error al generar flujos', 'warning');
          setTimeout(() => {
            navigate(`/clases/${claseId}`);
          }, 1000);
        }
      } else {
        showToast(
          isEdit ? 'Clase actualizada exitosamente' : 'Clase creada exitosamente',
          'success'
        );
        
        // Si viene de un grupo, redirigir al grupo, sino a clases
        const grupoIdFromUrl = searchParams.get('grupo_id');
        setTimeout(() => {
          if (grupoIdFromUrl) {
            navigate(`/grupos/${grupoIdFromUrl}`);
          } else {
            navigate('/clases');
          }
        }, 500);
      }
    } catch (err) {
      setError(err.message || 'Error al guardar la clase');
      showToast(err.message || 'Error al guardar la clase', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className={styles.container}>
        <Loading message="Cargando información de la clase..." />
      </div>
    );
  }

  // Mostrar animación fullscreen cuando se están generando flujos
  if (generatingFlows) {
    return (
      <FullScreenLoading message="Nuestro asistente IA está creando un flujo personalizado para tu clase..." />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate('/clases')} className={styles.backButton}>
          <ArrowLeft size={18} />
          Volver
        </button>
        <div className={styles.headerContent}>
          <h1>{isEdit ? 'Editar Clase' : 'Nueva Clase'}</h1>
        </div>
      </div>

      <div className={styles.stepsIndicator}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`${styles.stepDot} ${index === currentStep ? styles.active : ''} ${index < currentStep ? styles.completed : ''}`}
            onClick={() => setCurrentStep(index)}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.slidesContainer}>
          {/* Step 0: Grupo */}
          <div className={`${styles.slide} ${currentStep === 0 ? styles.active : ''} ${currentStep > 0 ? styles.slideOut : ''}`}>
            <div className={styles.slideContent}>
              <Users size={48} className={styles.slideIcon} />
              <h2 className={styles.slideTitle}>¿A qué grupo pertenece esta clase?</h2>
              <p className={styles.slideDescription}>Selecciona el grupo de estudiantes para esta clase</p>
              <select
                id="grupo_id"
                name="grupo_id"
                value={formData.grupo_id}
                onChange={handleChange}
                className={styles.select}
                required
                disabled={loadingData}
              >
                <option value="">Selecciona un grupo</option>
                {grupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 1: Tema */}
          <div className={`${styles.slide} ${currentStep === 1 ? styles.active : ''} ${currentStep > 1 ? styles.slideOut : ''}`}>
            <div className={styles.slideContent}>
              <BookOpen size={48} className={styles.slideIcon} />
              <h2 className={styles.slideTitle}>¿Cuál es el tema de la clase?</h2>
              <p className={styles.slideDescription}>Define el tema principal que se abordará en esta clase</p>
              <input
                type="text"
                id="tema"
                name="tema"
                value={formData.tema}
                onChange={handleChange}
                className={styles.input}
                required
                placeholder="Ej: Introducción a JavaScript, Álgebra Básica..."
                autoFocus={currentStep === 1}
                disabled={loadingData}
              />
            </div>
          </div>

          {/* Step 2: Nivel y Duración */}
          <div className={`${styles.slide} ${currentStep === 2 ? styles.active : ''} ${currentStep > 2 ? styles.slideOut : ''}`}>
            <div className={styles.slideContent}>
              <Clock size={48} className={styles.slideIcon} />
              <h2 className={styles.slideTitle}>Nivel y Duración</h2>
              <p className={styles.slideDescription}>Especifica el nivel de dificultad y cuánto durará la clase</p>
              <div className={styles.doubleInput}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Nivel</label>
                  <select
                    id="nivel"
                    name="nivel"
                    value={formData.nivel}
                    onChange={handleChange}
                    className={styles.select}
                    required
                    disabled={loadingData}
                  >
                    {niveles.map((nivel) => (
                      <option key={nivel} value={nivel}>
                        {nivel}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Duración (minutos)</label>
                  <input
                    type="number"
                    id="duracion"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleChange}
                    className={styles.input}
                    required
                    min="1"
                    placeholder="90"
                    disabled={loadingData}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Contexto */}
          <div className={`${styles.slide} ${currentStep === 3 ? styles.active : ''} ${currentStep > 3 ? styles.slideOut : ''}`}>
            <div className={styles.slideContent}>
              <FileText size={48} className={styles.slideIcon} />
              <h2 className={styles.slideTitle}>Contexto de la clase</h2>
              <p className={styles.slideDescription}>Describe el contexto en el que se desarrollará esta clase</p>
              <textarea
                id="contexto"
                name="contexto"
                value={formData.contexto}
                onChange={handleChange}
                className={styles.textarea}
                rows="5"
                placeholder="Contexto de la clase..."
                disabled={loadingData}
              />
            </div>
          </div>

          {/* Step 4: Objetivos */}
          <div className={`${styles.slide} ${currentStep === 4 ? styles.active : ''} ${currentStep > 4 ? styles.slideOut : ''}`}>
            <div className={styles.slideContent}>
              <Target size={48} className={styles.slideIcon} />
              <h2 className={styles.slideTitle}>Objetivos de aprendizaje</h2>
              <p className={styles.slideDescription}>Define qué objetivos se esperan alcanzar con esta clase</p>
              <textarea
                id="objetivos"
                name="objetivos"
                value={formData.objetivos}
                onChange={handleChange}
                className={styles.textarea}
                rows="5"
                placeholder="Objetivos de la clase..."
                disabled={loadingData}
              />
            </div>
          </div>

          {/* Step 5: Recursos */}
          <div className={`${styles.slide} ${currentStep === 5 ? styles.active : ''} ${currentStep > 5 ? styles.slideOut : ''}`}>
            <div className={styles.slideContent}>
              <FileText size={48} className={styles.slideIcon} />
              <h2 className={styles.slideTitle}>Recursos necesarios</h2>
              <p className={styles.slideDescription}>Lista los recursos que se necesitarán para esta clase</p>
              <textarea
                id="recursos_necesarios"
                name="recursos_necesarios"
                value={formData.recursos_necesarios}
                onChange={handleChange}
                className={styles.textarea}
                rows="5"
                placeholder="Recursos necesarios para la clase..."
                disabled={loadingData}
              />
            </div>
          </div>

          {/* Step 6: Generar Flow */}
          <div className={`${styles.slide} ${currentStep === 6 ? styles.active : ''}`}>
            <div className={styles.slideContent}>
              <div className={styles.generateSection}>
                <div className={styles.generateIcon}>
                  <Wand2 size={64} />
                </div>
                <h2 className={styles.slideTitle}>¡Todo listo!</h2>
                <p className={styles.slideDescription}>
                  Tu clase está configurada. Ahora puedes generar el flujo de enseñanza con IA
                </p>
                
                <div className={styles.preview}>
                  <div className={styles.previewCard}>
                    <div className={styles.previewHeader}>
                      <BookOpen size={24} />
                      <h4>{formData.tema || 'Tema de la clase'}</h4>
                    </div>
                    <div className={styles.previewDetails}>
                      <div className={styles.previewItem}>
                        <span className={styles.previewLabel}>Grupo:</span>
                        <span>{grupos.find(g => g.id === formData.grupo_id)?.nombre || 'No seleccionado'}</span>
                      </div>
                      <div className={styles.previewItem}>
                        <span className={styles.previewLabel}>Nivel:</span>
                        <span>{formData.nivel}</span>
                      </div>
                      <div className={styles.previewItem}>
                        <span className={styles.previewLabel}>Duración:</span>
                        <span>{formData.duracion || 0} minutos</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.generateButton}
                  disabled={loading}
                >
                  <Wand2 size={20} />
                  {loading ? 'Creando clase y generando flujos...' : isEdit ? 'Actualizar Clase' : 'Crear Clase y Generar Flujos con IA'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.navigationButtons}>
          {currentStep > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className={styles.navButton}
            >
              <ChevronLeft size={18} />
              Anterior
            </button>
          )}
          {currentStep < totalSteps - 1 && (
            <button
              type="button"
              onClick={nextStep}
              className={`${styles.navButton} ${styles.primary}`}
              disabled={!canProceed()}
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ClasesForm;

