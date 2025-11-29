import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Clock, CheckCircle2 } from 'lucide-react';
import styles from './ClassSession.module.css';

function ClassSession({ flujos, onEndSession }) {
  const [currentFlowIndex, setCurrentFlowIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedFlows, setCompletedFlows] = useState([]);
  const intervalRef = useRef(null);
  const sortedFlujos = [...flujos].sort((a, b) => (a.orden || 0) - (b.orden || 0));

  // Inicializar tiempo cuando se monta el componente o cambia el flujo
  useEffect(() => {
    if (sortedFlujos.length > 0 && currentFlowIndex < sortedFlujos.length) {
      // Limpiar intervalo anterior
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Establecer nuevo tiempo
      const newTime = sortedFlujos[currentFlowIndex].tiempo_duracion * 60;
      setTimeRemaining(newTime);
    }
  }, [currentFlowIndex, sortedFlujos]);

  // Temporizador principal - se reinicia solo cuando cambia isPaused o currentFlowIndex
  useEffect(() => {
    // Limpiar cualquier intervalo existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // No crear intervalo si está pausado
    if (isPaused) {
      return;
    }

    // Crear intervalo para contar hacia atrás
    // El intervalo usa la función de actualización de estado para acceder al valor actual
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        // Si el tiempo es 0 o menor, no hacer nada
        if (prev <= 0) {
          return 0;
        }
        
        const newTime = prev - 1;
        
        // Si el tiempo llegó a 0, manejar el siguiente flujo
        if (newTime <= 0) {
          // Usar setTimeout para evitar problemas de estado
          setTimeout(() => {
            // Usar los valores actuales del estado
            setCurrentFlowIndex((currentIdx) => {
              if (currentIdx < sortedFlujos.length - 1) {
                setCompletedFlows((prevCompleted) => [...prevCompleted, currentIdx]);
                return currentIdx + 1;
              } else {
                setCompletedFlows((prevCompleted) => [...prevCompleted, currentIdx]);
                setTimeout(() => onEndSession(), 100);
                return currentIdx;
              }
            });
          }, 100);
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, currentFlowIndex, sortedFlujos, onEndSession]); // NO incluir timeRemaining

  const handleNextFlow = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (currentFlowIndex < sortedFlujos.length - 1) {
      const newCompletedFlows = [...completedFlows, currentFlowIndex];
      setCompletedFlows(newCompletedFlows);
      const nextIndex = currentFlowIndex + 1;
      setCurrentFlowIndex(nextIndex);
      setTimeRemaining(sortedFlujos[nextIndex].tiempo_duracion * 60);
    } else {
      // Último flujo completado
      setCompletedFlows([...completedFlows, currentFlowIndex]);
      handleEndSession();
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleEndSession = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onEndSession();
  }, [onEndSession]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentFlow = sortedFlujos[currentFlowIndex];
  const progress = sortedFlujos.length > 0 
    ? ((currentFlowIndex + 1) / sortedFlujos.length) * 100 
    : 0;

  if (!currentFlow) return null;

  return (
    <div className={styles.sessionContainer}>
      <div className={styles.sessionHeader}>
        <div className={styles.sessionInfo}>
          <div className={styles.sessionTitle}>
            <h3>Modo Clase Activo</h3>
            <span className={styles.sessionBadge}>
              Flujo {currentFlowIndex + 1} de {sortedFlujos.length}
            </span>
          </div>
          <div className={styles.currentFlowName}>
            {currentFlow.nombre}
          </div>
        </div>

        <div className={styles.timerSection}>
          <div className={styles.timer}>
            <Clock size={24} className={styles.timerIcon} />
            <div className={styles.timerDisplay}>
              <span className={styles.timerTime}>
                {formatTime(timeRemaining)}
              </span>
              <span className={styles.timerLabel}>Tiempo restante</span>
            </div>
          </div>

          <div className={styles.sessionActions}>
            <button
              onClick={handlePauseResume}
              className={styles.pauseButton}
              title={isPaused ? 'Reanudar' : 'Pausar'}
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
              {isPaused ? 'Reanudar' : 'Pausar'}
            </button>
            <button
              onClick={handleNextFlow}
              className={styles.nextButton}
              disabled={currentFlowIndex >= sortedFlujos.length - 1}
            >
              Siguiente
            </button>
            <button
              onClick={handleEndSession}
              className={styles.endButton}
            >
              <Square size={18} />
              Terminar
            </button>
          </div>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={styles.sessionContent}>
        <div className={styles.flowDetails}>
          <div className={styles.flowSection}>
            <h4 className={styles.sectionTitle}>Descripción</h4>
            <p className={styles.sectionText}>{currentFlow.descripcion || 'Sin descripción'}</p>
          </div>

          {currentFlow.recursos && (
            <div className={styles.flowSection}>
              <h4 className={styles.sectionTitle}>Recursos</h4>
              <p className={styles.sectionText}>{currentFlow.recursos}</p>
            </div>
          )}

          {currentFlow.tips && (
            <div className={styles.flowSection}>
              <h4 className={styles.sectionTitle}>Tips</h4>
              <p className={styles.sectionText}>{currentFlow.tips}</p>
            </div>
          )}
        </div>

        <div className={styles.flowsList}>
          <h4 className={styles.listTitle}>Flujos de la clase</h4>
          <div className={styles.flowsGrid}>
            {sortedFlujos.map((flujo, index) => {
              const isCompleted = completedFlows.includes(index);
              const isCurrent = index === currentFlowIndex;
              const isUpcoming = index > currentFlowIndex;

              return (
                <div
                  key={flujo.id}
                  className={`${styles.flowCard} ${
                    isCurrent ? styles.current : ''
                  } ${isCompleted ? styles.completed : ''} ${
                    isUpcoming ? styles.upcoming : ''
                  }`}
                >
                  <div className={styles.flowCardHeader}>
                    <span className={styles.flowCardNumber}>{index + 1}</span>
                    {isCompleted && <CheckCircle2 size={16} className={styles.checkIcon} />}
                  </div>
                  <h5 className={styles.flowCardTitle}>{flujo.nombre}</h5>
                  <div className={styles.flowCardTime}>
                    <Clock size={12} />
                    {flujo.tiempo_duracion} min
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClassSession;

