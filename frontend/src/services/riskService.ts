import { apiClient } from "@/api/clients/clients";

enum Impact {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export type Risk = {
  riskId? : string,
  summary? : string,
  description? : string,
  probability? : number,
  impact? : Impact,
  mitigationAction? : string,
  resolutionCost? : number
};

const getAllProjectRisks = async(projectId : string) : Promise<Array<Risk>> => {
  const response = await apiClient.get(`/project/${projectId}/risk`);

  return response.data;
};

const getProjectRisk = async(projectId : string, riskId : string) : Promise<Risk> => {
  const response = await apiClient.get(`/project/${projectId}/risk/${riskId}`);

  return response.data;
};

const createProjectRisk = async(projectId : string, risk : Risk) : Promise<object> => {
  const response = await apiClient.post(`/project/${projectId}/risk`, risk);

  return response.data;
};

const updateProjectRisk = async(projectId : string, riskId : string, risk : Risk) : Promise<object> => {
  const response = await apiClient.put(`/project/${projectId}/risk/${riskId}`, risk);

  return response.data;
};

const deleteProjectRisk = async (projectId : string, riskId : string) : Promise<object> => {
  const response = await apiClient.delete(`/project/${projectId}/risk/${riskId}`);

  return response.data;
};

export default {
  getAllProjectRisks,
  getProjectRisk,
  createProjectRisk,
  updateProjectRisk,
  deleteProjectRisk
}