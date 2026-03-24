import api from './api'

const courseService = {
  // ── Course ──────────────────────────────────────────────────────────────────
  getCoursesByGroupId: async (groupId) => {
    const response = await api.get(`/groups/${groupId}/courses`)
    return response.data
  },

  createCourse: async (groupId, courseData) => {
    const response = await api.post(`/groups/${groupId}/courses`, courseData)
    return response.data
  },

  getCourseById: async (groupId, courseId) => {
    const response = await api.get(`/groups/${groupId}/courses/${courseId}`)
    return response.data
  },

  updateCourse: async (groupId, courseId, courseData) => {
    const response = await api.put(`/groups/${groupId}/courses/${courseId}`, courseData)
    return response.data
  },

  deleteCourse: async (groupId, courseId) => {
    const response = await api.delete(`/groups/${groupId}/courses/${courseId}`)
    return response.data
  },

  // ── Chapters ─────────────────────────────────────────────────────────────────
  getChapters: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/chapters`)
    return response.data
  },

  createChapter: async (courseId, data) => {
    const response = await api.post(`/courses/${courseId}/chapters`, data)
    return response.data
  },

  updateChapter: async (courseId, chapterId, data) => {
    const response = await api.put(`/courses/${courseId}/chapters/${chapterId}`, data)
    return response.data
  },

  deleteChapter: async (courseId, chapterId) => {
    const response = await api.delete(`/courses/${courseId}/chapters/${chapterId}`)
    return response.data
  },

  reorderChapters: async (courseId, orderedIds) => {
    const response = await api.put(`/courses/${courseId}/chapters/reorder`, orderedIds)
    return response.data
  },

  // ── Lessons ──────────────────────────────────────────────────────────────────
  getLessons: async (chapterId) => {
    const response = await api.get(`/chapters/${chapterId}/lessons`)
    return response.data
  },

  createLesson: async (chapterId, data) => {
    const response = await api.post(`/chapters/${chapterId}/lessons`, data)
    return response.data
  },

  updateLesson: async (chapterId, lessonId, data) => {
    const response = await api.put(`/chapters/${chapterId}/lessons/${lessonId}`, data)
    return response.data
  },

  deleteLesson: async (chapterId, lessonId) => {
    const response = await api.delete(`/chapters/${chapterId}/lessons/${lessonId}`)
    return response.data
  },

  markLessonComplete: async (chapterId, lessonId) => {
    const response = await api.post(`/chapters/${chapterId}/lessons/${lessonId}/complete`)
    return response.data
  },

  // ── Enrollment ───────────────────────────────────────────────────────────────
  enrollCourse: async (courseId) => {
    const response = await api.post(`/v1/courses/${courseId}/enrollment`)
    return response.data
  },

  getMyEnrollment: async (courseId) => {
    try {
      const response = await api.get(`/v1/courses/${courseId}/enrollment/my`)
      // 204 = not enrolled, return null gracefully
      if (response.status === 204) return null
      return response.data
    } catch {
      return null
    }
  },

  // ── Quizzes ──────────────────────────────────────────────────────────────────
  createQuiz: async (courseId, data) => {
    const response = await api.post(`/v1/courses/${courseId}/quizzes`, data)
    return response.data
  },

  updateQuiz: async (quizId, data) => {
    const response = await api.put(`/v1/quizzes/${quizId}`, data)
    return response.data
  },

  getQuizzesByCourseId: async (courseId) => {
    const response = await api.get(`/v1/courses/${courseId}/quizzes`)
    return response.data
  },

  getQuizById: async (quizId) => {
    const response = await api.get(`/v1/quizzes/${quizId}`)
    return response.data
  },

  startQuizAttempt: async (quizId) => {
    const response = await api.post(`/v1/quizzes/${quizId}/attempts`)
    return response.data
  },

  submitQuizAttempt: async (attemptId, data) => {
    const response = await api.post(`/v1/quizzes/attempts/${attemptId}/submit`, data)
    return response.data
  },

  getQuizAttemptResult: async (attemptId) => {
    const response = await api.get(`/v1/quizzes/attempts/${attemptId}/result`)
    return response.data
  },

  getMyQuizAttempts: async (quizId) => {
    const response = await api.get(`/v1/quizzes/${quizId}/my-attempts`)
    return response.data
  },

  // ── Assignments ─────────────────────────────────────────────────────────────
  getAssignmentsByGroup: async (groupId) => {
    const response = await api.get(`/v1/groups/${groupId}/assignments`)
    return response.data
  },

  getAssignmentsByCourse: async (courseId) => {
    const response = await api.get(`/v1/courses/${courseId}/assignments`)
    return response.data
  },

  getAssignmentById: async (id) => {
    const response = await api.get(`/v1/assignments/${id}`)
    return response.data
  },

  createAssignment: async (groupId, data) => {
    const response = await api.post(`/v1/groups/${groupId}/assignments`, data)
    return response.data
  },

  submitAssignment: async (assignmentId, formData) => {
    // formData should contain 'request' (JSON blob) and 'file' (Multipart)
    const response = await api.post(`/v1/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  getMySubmissions: async (assignmentId) => {
    const response = await api.get(`/v1/assignments/${assignmentId}/my-submissions`)
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
  },
}

export default courseService
