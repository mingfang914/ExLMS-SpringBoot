import api from './api'

const assignmentService = {
  getAssignmentsByGroup: async (groupId) => {
    const response = await api.get(`/groups/${groupId}/assignments`)
    return response.data
  },

  getAssignmentById: async (groupId, assignmentId) => {
    const response = await api.get(`/groups/${groupId}/assignments/${assignmentId}`)
    return response.data
  },

  createAssignment: async (groupId, assignmentData) => {
    const response = await api.post(`/groups/${groupId}/assignments`, assignmentData)
    return response.data
  },

  submitAssignment: async (groupId, assignmentId, submissionData) => {
    const response = await api.post(`/groups/${groupId}/assignments/${assignmentId}/submit`, submissionData)
    return response.data
  },

  getSubmissions: async (groupId, assignmentId) => {
    const response = await api.get(`/groups/${groupId}/assignments/${assignmentId}/submissions`)
    return response.data
  },

  gradeSubmission: async (groupId, assignmentId, submissionId, gradeData) => {
    const response = await api.post(`/groups/${groupId}/assignments/${assignmentId}/submissions/${submissionId}/grade`, gradeData)
    return response.data
  }
}

export default assignmentService
