import api from './api'

const forumService = {
  getPosts: async (params) => {
    const response = await api.get('/forum/posts', { params })
    return response.data
  },

  getPostById: async (id) => {
    const response = await api.get(`/forum/posts/${id}`)
    return response.data
  },

  createPost: async (postData) => {
    const response = await api.post('/forum/posts', postData)
    return response.data
  },

  getCommentsByPostId: async (postId) => {
    const response = await api.get(`/forum/posts/${postId}/comments`)
    return response.data
  },

  createComment: async (postId, commentData) => {
    const response = await api.post(`/forum/posts/${postId}/comments`, commentData)
    return response.data
  },

  votePost: async (postId, voteType) => {
    const response = await api.post(`/forum/posts/${postId}/vote`, { type: voteType })
    return response.data
  }
}

export default forumService
