import api from './api'

const fileService = {
  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data // Should return the file key
  },

  getDownloadUrl: async (fileKey) => {
    const response = await api.get(`/files/download-url/${fileKey}`)
    return response.data // Should return the presigned URL
  }
}

export default fileService
