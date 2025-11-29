// API Configuration
export const API_BASE_URL = 'https://charming-cassie-k1rie-45484dd5.koyeb.app/api';

export const API_ENDPOINTS = {
  grupos: {
    getAll: () => `${API_BASE_URL}/grupos`,
    getById: (id) => `${API_BASE_URL}/grupos/${id}`,
    create: () => `${API_BASE_URL}/grupos`,
    update: (id) => `${API_BASE_URL}/grupos/${id}`,
    delete: (id) => `${API_BASE_URL}/grupos/${id}`,
  },
  clases: {
    getAll: () => `${API_BASE_URL}/clases`,
    getById: (id) => `${API_BASE_URL}/clases/${id}`,
    create: () => `${API_BASE_URL}/clases`,
    update: (id) => `${API_BASE_URL}/clases/${id}`,
    delete: (id) => `${API_BASE_URL}/clases/${id}`,
  },
  apuntes: {
    getByClase: (claseId) => `${API_BASE_URL}/apuntes/clase/${claseId}`,
    getById: (id) => `${API_BASE_URL}/apuntes/${id}`,
    getByLink: (link) => `${API_BASE_URL}/apuntes/publico/${link}`,
    generate: () => `${API_BASE_URL}/apuntes/ai`,
    update: (id) => `${API_BASE_URL}/apuntes/${id}`,
    delete: (id) => `${API_BASE_URL}/apuntes/${id}`,
  },
  tareas: {
    getByClase: (claseId) => `${API_BASE_URL}/tareas/clase/${claseId}`,
    getById: (id) => `${API_BASE_URL}/tareas/${id}`,
    getByLink: (link) => `${API_BASE_URL}/tareas/publico/${link}`,
    generate: () => `${API_BASE_URL}/tareas/ai`,
    update: (id) => `${API_BASE_URL}/tareas/${id}`,
    delete: (id) => `${API_BASE_URL}/tareas/${id}`,
  },
};

