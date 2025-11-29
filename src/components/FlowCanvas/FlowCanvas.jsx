import { useMemo, useCallback, useEffect, useState, memo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  addEdge,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Clock, FileText, Lightbulb, X, Info, MousePointerClick } from 'lucide-react';
import styles from './FlowCanvas.module.css';

const CustomNode = memo(function CustomNode({ data, selected, onClick }) {
  const { flujo, index } = data;

  return (
    <div 
      className={`${styles.customNode} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        id="target"
        style={{ 
          background: '#6965DB',
          border: '3px solid #FFFFFF',
          width: '12px',
          height: '12px',
        }} 
      />
      
      <div className={styles.nodeHeader}>
        <div className={styles.nodeNumber}>{index}</div>
        <h3 className={styles.nodeTitle}>{flujo.nombre}</h3>
      </div>

      {flujo.descripcion && (
        <p className={styles.nodeDescription}>{flujo.descripcion}</p>
      )}

      <div className={styles.nodeDetails}>
        <div className={styles.detailItem}>
          <Clock size={14} />
          <span>{flujo.tiempo_duracion} min</span>
        </div>

        {flujo.recursos && (
          <div className={styles.detailItem}>
            <FileText size={14} />
            <span className={styles.detailText}>{flujo.recursos}</span>
          </div>
        )}
      </div>

      {flujo.tips && (
        <div className={styles.nodeTips}>
          <Lightbulb size={14} />
          <span>{flujo.tips}</span>
        </div>
      )}

      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source"
        style={{ 
          background: '#6965DB',
          border: '3px solid #FFFFFF',
          width: '12px',
          height: '12px',
        }} 
      />
    </div>
  );
});

function FlowDetailModal({ flujo, index, onClose }) {
  if (!flujo) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className={styles.modalHeader}>
          <div className={styles.modalNumber}>{index}</div>
          <h2 className={styles.modalTitle}>{flujo.nombre}</h2>
        </div>

        {flujo.descripcion && (
          <div className={styles.modalSection}>
            <h3 className={styles.modalSectionTitle}>Descripción</h3>
            <p className={styles.modalText}>{flujo.descripcion}</p>
          </div>
        )}

        <div className={styles.modalDetails}>
          <div className={styles.modalDetailItem}>
            <Clock size={20} />
            <div>
              <span className={styles.modalDetailLabel}>Duración</span>
              <span className={styles.modalDetailValue}>{flujo.tiempo_duracion} minutos</span>
            </div>
          </div>

          {flujo.recursos && (
            <div className={styles.modalDetailItem}>
              <FileText size={20} />
              <div>
                <span className={styles.modalDetailLabel}>Recursos</span>
                <span className={styles.modalDetailValue}>{flujo.recursos}</span>
              </div>
            </div>
          )}
        </div>

        {flujo.tips && (
          <div className={styles.modalTips}>
            <Lightbulb size={20} />
            <div>
              <h3 className={styles.modalSectionTitle}>Tips y Consejos</h3>
              <p className={styles.modalText}>{flujo.tips}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FlowCanvas({ flujos }) {
  const [selectedFlujo, setSelectedFlujo] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const initialNodes = useMemo(() => {
    if (!flujos || flujos.length === 0) return [];

    // Ordenar flujos por orden
    const sortedFlujos = [...flujos].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    const totalFlujos = sortedFlujos.length;

    // Dimensiones del nodo
    const nodeWidth = 320;
    const nodeHeight = 260;
    
    // Espaciado mejorado entre cards
    const horizontalSpacing = nodeWidth + 120;
    
    // Margen inicial - centrado verticalmente
    const startX = 150;
    const startY = 200;

    // Layout horizontal con mejor espaciado
    return sortedFlujos.map((flujo, index) => {
      const x = startX + index * horizontalSpacing;
      const y = startY;

      return {
        id: `flujo-${flujo.id}`,
        type: 'custom',
        position: { x, y },
        data: {
          label: flujo.nombre,
          flujo: flujo,
          index: index + 1,
        },
        selected: selectedFlujo?.id === flujo.id,
      };
    });
  }, [flujos, selectedFlujo]);

  const initialEdges = useMemo(() => {
    if (initialNodes.length < 2) return [];

    const sortedNodes = [...initialNodes].sort((a, b) => a.data.index - b.data.index);
    const newEdges = [];

    // Conectar nodos secuencialmente con líneas smoothstep (más elegantes)
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      const source = sortedNodes[i];
      const target = sortedNodes[i + 1];
      
      newEdges.push({
        id: `edge-${source.id}-${target.id}`,
        source: source.id,
        target: target.id,
        type: 'smoothstep', // Líneas curvas suaves y elegantes
        animated: false,
        style: { 
          stroke: '#0A66E6', 
          strokeWidth: 2.5,
          strokeDasharray: '0',
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#0A66E6',
          width: 18,
          height: 18,
        },
      });
    }

    return newEdges;
  }, [initialNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedFlujo(node.data.flujo);
    setSelectedIndex(node.data.index);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedFlujo(null);
    setSelectedIndex(null);
  }, []);

  const nodeTypes = useMemo(() => ({
    custom: (props) => (
      <CustomNode
        {...props}
        selected={props.data.flujo?.id === selectedFlujo?.id}
        onClick={() => {
          setSelectedFlujo(props.data.flujo);
          setSelectedIndex(props.data.index);
        }}
      />
    ),
  }), [selectedFlujo]);

  // Actualizar nodos y edges cuando cambien los flujos
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedFlujo) {
        handleCloseModal();
      }
    };
    
    if (selectedFlujo) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedFlujo, handleCloseModal]);

  return (
    <>
      <div className={styles.flowCanvas}>
        {/* Ayuda contextual */}
        <div className={styles.helpBanner}>
          <Info size={16} />
          <span>Haz clic en cualquier paso para ver más detalles</span>
          <button 
            className={styles.helpClose}
            onClick={(e) => {
              e.currentTarget.closest(`.${styles.helpBanner}`).style.display = 'none';
            }}
          >
            ×
          </button>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 0.8, minZoom: 0.2, duration: 200 }}
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          proOptions={{ hideAttribution: true }}
          deleteKeyCode={null}
          multiSelectionKeyCode={null}
          selectionOnDrag={false}
          panOnScroll={false}
          onInit={(reactFlowInstance) => {
            // Optimizar fitView con timeout más corto
            requestAnimationFrame(() => {
              reactFlowInstance.fitView({ 
                padding: 0.2, 
                maxZoom: 0.8,
                minZoom: 0.2,
                includeHiddenNodes: false,
                duration: 200
              });
            });
          }}
        >
          <Background color="#1a1a1a" gap={24} size={1} />
          <Controls 
            showInteractive={false}
            style={{
              button: {
                backgroundColor: '#1A1A1A',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }
            }}
          />
          <MiniMap 
            style={{
              backgroundColor: '#1A1A1A',
            }}
            nodeColor="#0A66E6"
            maskColor="rgba(0, 0, 0, 0.5)"
            pannable={false}
            zoomable={false}
          />
        </ReactFlow>
      </div>
      
      {selectedFlujo && (
        <FlowDetailModal
          flujo={selectedFlujo}
          index={selectedIndex}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default FlowCanvas;

