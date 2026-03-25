import api from './api'

const groupFeedService = {
  getGroupFeed: async (groupId, type = '', page = 0, size = 10) => {
    const response = await api.get(`/groups/${groupId}/feed?type=${type}&page=${page}&size=${size}`)
    return response.data
  },

  createPost: async (groupId, postData) => {
    const response = await api.post(`/groups/${groupId}/feed`, postData)
    return response.data
  },

  updatePost: async (groupId, postId, postData) => {
    const response = await api.put(`/groups/${groupId}/feed/${postId}`, postData)
    return response.data
  },

  deletePost: async (groupId, postId) => {
    const response = await api.delete(`/groups/${groupId}/feed/${postId}`)
    return response.data
  },

  getPostComments: async (groupId, postId) => {
    const response = await api.get(`/groups/${groupId}/feed/${postId}/comments`)
    return response.data
  },

  addComment: async (groupId, postId, commentData) => {
    const response = await api.post(`/groups/${groupId}/feed/${postId}/comments`, commentData)
    return response.data
  },

  deleteComment: async (groupId, commentId) => {
    const response = await api.delete(`/groups/${groupId}/feed/comments/${commentId}`)
    return response.data
  },

  updateComment: async (groupId, commentId, commentData) => {
    const response = await api.put(`/groups/${groupId}/feed/comments/${commentId}`, commentData)
    return response.data
  },

  toggleReaction: async (groupId, postId) => {
    const response = await api.post(`/groups/${groupId}/feed/${postId}/reactions`)
    return response.data
  },

  togglePinPost: async (groupId, postId) => {
    const response = await api.put(`/groups/${groupId}/feed/${postId}/pin`)
    return response.data
  }
}

export default groupFeedService
