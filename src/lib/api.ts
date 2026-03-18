/**
 * Shared API configuration for all frontend fetch calls.
 * Edit BASE_URL here to point to staging/production when deploying.
 */
export const BASE_URL = "http://localhost:8000";

export const api = {
  auth: {
    login:    () => `${BASE_URL}/api/auth/login`,
    register: () => `${BASE_URL}/api/auth/register`,
    me:       () => `${BASE_URL}/api/auth/me`,
  },
  projects: {
    list:    () =>          `${BASE_URL}/api/projects`,
    create:  () =>          `${BASE_URL}/api/projects`,
    get:     (id: string) => `${BASE_URL}/api/projects/${id}`,
    delete:  (id: string) => `${BASE_URL}/api/projects/${id}`,
    columns: (id: string) => `${BASE_URL}/api/projects/${id}/columns`,
  },
  datasets: {
    upload: () => `${BASE_URL}/api/datasets/upload`,
    profiling: (id: string) => `${BASE_URL}/api/datasets/${id}/profiling`,
    preview: (id: string) => `${BASE_URL}/api/datasets/${id}/preview`,
  },
  jobs: {
    train: (id: string) => `${BASE_URL}/api/jobs/${id}/train`,
    models: (id: string) => `${BASE_URL}/api/jobs/${id}/models`,
    deploy: (projectId: string, modelId: number) => `${BASE_URL}/api/jobs/${projectId}/models/${modelId}/deploy`,
  },
};
