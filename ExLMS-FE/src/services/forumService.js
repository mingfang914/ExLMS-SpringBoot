import api from './api'

const forumService = {
  // Posts
  getPosts: async (params) => {
    const response = await api.get('/v1/forum/posts', { params })
    return response.data
  },

  getPostById: async (id) => {
    const response = await api.get(`/v1/forum/posts/${id}`)
    return response.data
  },

  createPost: async (postData) => {
    const response = await api.post('/v1/forum/posts', postData)
    return response.data
  },

  updatePost: async (id, postData) => {
    const response = await api.put(`/v1/forum/posts/${id}`, postData)
    return response.data
  },

  deletePost: async (id) => {
    const response = await api.delete(`/v1/forum/posts/${id}`)
    return response.data
  },

  votePost: async (postId, voteType) => {
    const response = await api.post(`/v1/forum/posts/${postId}/vote`, { voteType })
    return response.data
  },

  togglePin: async (postId, pin) => {
    const response = await api.post(`/v1/forum/posts/${postId}/pin?pin=${pin}`)
    return response.data
  },

  // Comments
  getCommentsByPostId: async (postId) => {
    const response = await api.get(`/v1/forum/posts/${postId}/comments`)
    return response.data
  },

  addComment: async (postId, commentData) => {
    const response = await api.post(`/v1/forum/posts/${postId}/comments`, commentData)
    return response.data
  },

  voteComment: async (commentId, voteType) => {
    const response = await api.post(`/v1/forum/comments/${commentId}/vote`, { voteType })
    return response.data
  },

  acceptComment: async (commentId) => {
    const response = await api.post(`/v1/forum/comments/${commentId}/accept`)
    return response.data
  },

  // Tags
  getTags: async () => {
    const response = await api.get('/v1/forum/tags')
    return response.data
  },

  createTag: async (tagData) => {
    const response = await api.post('/v1/forum/tags', tagData)
    return response.data
  },

  followTag: async (tagId) => {
    const response = await api.post(`/v1/forum/tags/${tagId}/follow`)
    return response.data
  }
}

export default forumService
