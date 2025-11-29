import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, GraduationCap, UsersRound, School, ChevronRight, ChevronLeft, Wand2 } from 'lucide-react';
import { API_BASE_URL } from '../../../services/apiService';
import { useToast } from '../../../contexts/ToastContext';
import Loading from '../../../components/Loading/Loading';
import AIBadge from '../../../components/AIBadge/AIBadge';
import styles from './GruposForm.module.css';

function GruposForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    nombre: '',
    numero_estudiantes: 0,
    descripcion: '',
    color: '#0A66E6',
    icon: 'users',
  });

  const colors = [
    { value: '#0A66E6', name: 'Azul' },
    { value: '#13ADD0', name: 'Cyan' },
    { value: '#6965DB', name: 'Púrpura' },
    { value: '#EE46BC', name: 'Rosa' },
    { value: '#FF6B6B', name: 'Rojo' },
    { value: '#FFA94D', name: 'Naranja' },
  ];

  const icons = [
    { value: 'users', icon: Users, name: 'Usuarios' },
    { value: 'book', icon: BookOpen, name: 'Libro' },
    { value: 'graduation', icon: GraduationCap, name: 'Graduación' },
    { value: 'users-round', icon: UsersRound, name: 'Grupo' },
    { value: 'school', icon: School, name: 'Escuela' },
  ];

  const steps = [
    { id: 'nombre', label: 'Nombre del Grupo' },
    { id: 'estudiantes', label: 'Número de Estudiantes' },
    { id: 'descripcion', label: 'Descripción' },
    { id: 'color', label: 'Color' },
    { id: 'icon', label: 'Icono' },
    { id: 'generate', label: 'Crear Grupo' },
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
        return formData.nombre.trim() !== '';
      case 1:
        return true; // Número de estudiantes es opcional
      case 2:
        return true; // Descripción es opcional
      case 3:
        return formData.color !== '';
      case 4:
        return formData.icon !== '';
      default:
        return true;
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isEdit) {
      loadGrupo();
    }
  }, [id]);

  const loadGrupo = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(`${API_BASE_URL}/grupos/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar el grupo');
      }

      const grupo = data.data;
      setFormData({
        nombre: grupo.nombre || '',
        numero_estudiantes: grupo.numero_estudiantes || 0,
        descripcion: grupo.descripcion || '',
        color: grupo.color || '#0A66E6',
        icon: grupo.icon || 'users',
      });
    } catch (err) {
      setError(err.message || 'Error al cargar el grupo');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'numero_estudiantes' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit ? `${API_BASE_URL}/grupos/${id}` : `${API_BASE_URL}/grupos`;
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
        throw new Error(data.message || 'Error al guardar el grupo');
      }

      showToast(
        isEdit ? 'Grupo actualizado exitosamente' : 'Grupo creado exitosamente',
        'success'
      );
      
      // Pequeño delay para mostrar el toast antes de navegar
      setTimeout(() => {
        navigate('/grupos');
      }, 500);
    } catch (err) {
      setError(err.message || 'Error al guardar el grupo');
      showToast(err.message || 'Error al guardar el grupo', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className={styles.container}>
        <Loading message="Cargando información del grupo..." />
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
        <div className={styles.headerContent}>
          <h1>{isEdit ? 'Editar Grupo' : 'Nuevo Grupo'}</h1>
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
          {/* Step 0: Nombre */}
          <div className={`${styles.slide} ${currentStep === 0 ? styles.active : ''} ${currentStep > 0 ? styles.slideOut : ''}`}>
            <div className={styles.slideContent}>
              <h2 className={styles.slideTitle}>¿Cómo se llamará tu grupo?</h2>
              <p className={styles.slideDescription}>Dale un nombre único a tu grupo de estudiantes</p>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={styles.input}
                required
                placeholder="Ej: Grupo A, Matemáticas Avanzadas..."
                autoFocus
              />
            </div>
          </div>

          {/* Step 1: Número de Estudiantes */}
          <div className={`${styles.slide} ${currentStep === 1 ? styles.active : ''} ${currentStep > 1 ? styles.slideOut : ''}`}>
            <div className={styles.slideContent}>
              <h2 className={styles.slideTitle}>¿Cuántos estudiantes tiene?</h2>
              <p className={styles.slideDescription}>Especifica el número de estudiantes en este grupo</p>
              <input
                type="number"
                id="numero_estudiantes"
                name="numero_estudiantes"
                value={formData.numero_estudiantes}
                onChange={handleChange}
                className={styles.input}
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          {/* Step 2: Descripción */}
          <div className={`${styles.slide} ${currentStep === 2 ? styles.active : ''} ${currentStep > 2 ? styles.slideOut : ''}`}>
            <div className={styles.slideContent}>
              <h2 className={styles.slideTitle}>Describe tu grupo</h2>
              <p className={styles.slideDescription}>Agrega una descripción para identificar mejor este grupo</p>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className={styles.textarea}
                rows="4"
                placeholder="Descripción del grupo..."
              />
            </div>
          </div>

          {/* Step 3: Color */}
          <div className={`${styles.slide} ${currentStep === 3 ? styles.active : ''} ${currentStep > 3 ? styles.slideOut : ''}`}>
            <div className={styles.slideContent}>
              <h2 className={styles.slideTitle}>Elige un color</h2>
              <p className={styles.slideDescription}>Selecciona el color que representará a tu grupo</p>
              <div className={styles.colorPicker}>
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`${styles.colorOption} ${formData.color === color.value ? styles.active : ''}`}
                    style={{ '--color': color.value }}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    title={color.name}
                  >
                    <div className={styles.colorCircle}></div>
                    <span className={styles.colorName}>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4: Icono */}
          <div className={`${styles.slide} ${currentStep === 4 ? styles.active : ''} ${currentStep > 4 ? styles.slideOut : ''}`}>
            <div className={styles.slideContent}>
              <h2 className={styles.slideTitle}>Elige un icono</h2>
              <p className={styles.slideDescription}>Selecciona el icono que mejor represente a tu grupo</p>
              <div className={styles.iconPicker}>
                {icons.map((iconOption) => {
                  const IconComponent = iconOption.icon;
                  return (
                    <button
                      key={iconOption.value}
                      type="button"
                      className={`${styles.iconOption} ${formData.icon === iconOption.value ? styles.active : ''}`}
                      onClick={() => setFormData({ ...formData, icon: iconOption.value })}
                      title={iconOption.name}
                    >
                      <IconComponent size={32} />
                      <span className={styles.iconName}>{iconOption.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 5: Crear Grupo */}
          <div className={`${styles.slide} ${currentStep === 5 ? styles.active : ''}`}>
            <div className={styles.slideContent}>
              <div className={styles.generateSection}>
                <div className={styles.generateIcon}>
                  <Wand2 size={64} />
                </div>
                <h2 className={styles.slideTitle}>¡Todo listo!</h2>
                <p className={styles.slideDescription}>
                  Tu grupo está configurado. Revisa la información y crea tu grupo
                </p>
                
                <div className={styles.preview}>
                  <div 
                    className={styles.previewCard}
                    style={{ '--preview-color': formData.color }}
                  >
                    <div className={styles.previewVisual}>
                      <div className={styles.previewGradient}></div>
                      <div className={styles.previewIcon}>
                        {icons.find(i => i.value === formData.icon)?.icon && 
                          (() => {
                            const IconComponent = icons.find(i => i.value === formData.icon).icon;
                            return <IconComponent size={40} />;
                          })()
                        }
                      </div>
                    </div>
                    <div className={styles.previewContent}>
                      <h4>{formData.nombre || 'Nombre del Grupo'}</h4>
                      <p>{formData.numero_estudiantes || 0} estudiantes</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.generateButton}
                  disabled={loading}
                >
                  <Wand2 size={20} />
                  {loading ? 'Guardando...' : 'Crear Grupo'}
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

export default GruposForm;

