import api from './api'

const assignmentService = {
  getAssignmentsByGroup: async (groupId) => {
    const response = await api.get(`/v1/groups/${groupId}/assignments`)
    return response.data
  },

  getAssignmentsByCourse: async (courseId) => {
    const response = await api.get(`/v1/courses/${courseId}/assignments`)
    return response.data
  },

  getAssignmentById: async (assignmentId) => {
    const response = await api.get(`/v1/assignments/${assignmentId}`)
    return response.data
  },

  createAssignment: async (groupId, assignmentData) => {
    const response = await api.post(`/v1/groups/${groupId}/assignments`, assignmentData)
    return response.data
  },

  updateAssignment: async (assignmentId, assignmentData) => {
    const response = await api.put(`/v1/assignments/${assignmentId}`, assignmentData)
    return response.data
  },

  deleteAssignment: async (assignmentId) => {
    const response = await api.delete(`/v1/assignments/${assignmentId}`)
    return response.data
  },

  submitAssignment: async (assignmentId, formData) => {
    const response = await api.post(`/v1/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  getMySubmissions: async (assignmentId) => {
    const response = await api.get(`/v1/assignments/${assignmentId}/my-submissions`)
    return response.data
  },

  updateSubmission: async (submissionId, formData) => {
    const response = await api.put(`/v1/submissions/${submissionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  deleteSubmission: async (submissionId) => {
    const response = await api.delete(`/v1/submissions/${submissionId}`)
    return response.data
  },

  getSubmissionDetails: async (submissionId) => {
    const response = await api.get(`/v1/submissions/${submissionId}`)
    return response.data
  },

  getAllSubmissions: async (assignmentId) => {
    const response = await api.get(`/v1/assignments/${assignmentId}/submissions`)
    return response.data
  },

  gradeSubmission: async (submissionId, gradeData) => {
    const response = await api.post(`/v1/submissions/${submissionId}/grade`, gradeData)
    return response.data
  },

  bulkGrade: async (assignmentId, scoresMap) => {
    const response = await api.post(`/v1/assignments/${assignmentId}/bulk-grade`, scoresMap)
    return response.data
  },

  exportGrades: async (assignmentId) => {
    const response = await api.get(`/v1/assignments/${assignmentId}/export-grades`, {
      responseType: 'blob'
    })
    return response.data
  }
}

export default assignmentService
