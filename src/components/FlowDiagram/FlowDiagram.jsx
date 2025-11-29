import { Clock, FileText, Lightbulb, ArrowDown } from 'lucide-react';
import styles from './FlowDiagram.module.css';

function FlowDiagram({ flujos }) {
  if (!flujos || flujos.length === 0) {
    return null;
  }

  return (
    <div className={styles.flowDiagram}>
      {flujos.map((flujo, index) => (
        <div key={flujo.id} className={styles.flowNode}>
          {index > 0 && (
            <div className={styles.connector}>
              <ArrowDown size={20} />
            </div>
          )}
          <div className={styles.nodeContent}>
            <div className={styles.nodeHeader}>
              <div className={styles.nodeNumber}>{index + 1}</div>
              <h3 className={styles.nodeTitle}>{flujo.nombre}</h3>
            </div>
            
            {flujo.descripcion && (
              <p className={styles.nodeDescription}>{flujo.descripcion}</p>
            )}

            <div className={styles.nodeDetails}>
              <div className={styles.detailItem}>
                <Clock size={16} />
                <span>{flujo.tiempo_duracion} min</span>
              </div>
              
              {flujo.recursos && (
                <div className={styles.detailItem}>
                  <FileText size={16} />
                  <span>{flujo.recursos}</span>
                </div>
              )}
            </div>

            {flujo.tips && (
              <div className={styles.nodeTips}>
                <Lightbulb size={16} />
                <span>{flujo.tips}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FlowDiagram;

