import { Clock, FileText, Lightbulb, CheckCircle2, Play, ArrowRight, Info } from 'lucide-react';
import styles from './FlowSummary.module.css';

function FlowSummary({ flujos, onStartSession, onClose }) {
  if (!flujos || flujos.length === 0) return null;

  const sortedFlujos = [...flujos].sort((a, b) => (a.orden || 0) - (b.orden || 0));
  
  // Calcular estadísticas
  const totalTime = sortedFlujos.reduce((sum, flujo) => sum + (flujo.tiempo_duracion || 0), 0);
  const totalFlujos = sortedFlujos.length;
  const hasResources = sortedFlujos.some(f => f.recursos);
  const hasTips = sortedFlujos.some(f => f.tips);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>Resumen del Flujo de Clase</h2>
            <p className={styles.subtitle}>
              Revisa el plan antes de iniciar la sesión
            </p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          {/* Estadísticas rápidas */}
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CheckCircle2 size={24} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{totalFlujos}</div>
                <div className={styles.statLabel}>Pasos en el flujo</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Clock size={24} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{totalTime} min</div>
                <div className={styles.statLabel}>Duración total</div>
              </div>
            </div>
            {hasResources && (
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FileText size={24} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>✓</div>
                  <div className={styles.statLabel}>Incluye recursos</div>
                </div>
              </div>
            )}
            {hasTips && (
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Lightbulb size={24} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>✓</div>
                  <div className={styles.statLabel}>Incluye tips</div>
                </div>
              </div>
            )}
          </div>

          {/* Guía rápida */}
          <div className={styles.guide}>
            <div className={styles.guideHeader}>
              <Info size={20} />
              <h3>¿Cómo funciona?</h3>
            </div>
            <div className={styles.guideSteps}>
              <div className={styles.guideStep}>
                <div className={styles.guideStepNumber}>1</div>
                <div className={styles.guideStepContent}>
                  <strong>Inicia la sesión</strong>
                  <p>El temporizador comenzará automáticamente</p>
                </div>
              </div>
              <div className={styles.guideStep}>
                <div className={styles.guideStepNumber}>2</div>
                <div className={styles.guideStepContent}>
                  <strong>Sigue cada paso</strong>
                  <p>El sistema te guiará paso a paso</p>
                </div>
              </div>
              <div className={styles.guideStep}>
                <div className={styles.guideStepNumber}>3</div>
                <div className={styles.guideStepContent}>
                  <strong>Usa los controles</strong>
                  <p>Puedes pausar, avanzar o terminar cuando quieras</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de flujos */}
          <div className={styles.flowsList}>
            <h3 className={styles.sectionTitle}>Pasos del flujo</h3>
            <div className={styles.flowsContainer}>
              {sortedFlujos.map((flujo, index) => (
                <div key={flujo.id} className={styles.flowItem}>
                  <div className={styles.flowNumber}>{index + 1}</div>
                  <div className={styles.flowContent}>
                    <h4 className={styles.flowName}>{flujo.nombre}</h4>
                    {flujo.descripcion && (
                      <p className={styles.flowDescription}>{flujo.descripcion}</p>
                    )}
                    <div className={styles.flowDetails}>
                      <div className={styles.flowDetail}>
                        <Clock size={14} />
                        <span>{flujo.tiempo_duracion} min</span>
                      </div>
                      {flujo.recursos && (
                        <div className={styles.flowDetail}>
                          <FileText size={14} />
                          <span>Recursos incluidos</span>
                        </div>
                      )}
                      {flujo.tips && (
                        <div className={styles.flowDetail}>
                          <Lightbulb size={14} />
                          <span>Tips disponibles</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.startButton} onClick={onStartSession}>
            <Play size={18} />
            Iniciar Sesión
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FlowSummary;

