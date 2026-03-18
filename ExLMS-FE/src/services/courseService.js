import api from './api'

const courseService = {
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
  }
}

export default courseService
