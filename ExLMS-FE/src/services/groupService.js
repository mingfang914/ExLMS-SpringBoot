import api from './api'

const groupService = {
  getAllPublicGroups: async () => {
    const response = await api.get('/groups')
    return response.data
  },

  getMyGroups: async () => {
    const response = await api.get('/groups/my')
    return response.data
  },

  getGroupById: async (id) => {
    const response = await api.get(`/groups/${id}`)
    return response.data
  },

  createGroup: async (groupData) => {
    const response = await api.post('/groups', groupData)
    return response.data
  },

  updateGroup: async (id, groupData) => {
    const response = await api.put(`/groups/${id}`, groupData)
    return response.data
  },

  deleteGroup: async (id) => {
    const response = await api.delete(`/groups/${id}`)
    return response.data
  },

  joinGroupByInviteCode: async (inviteCode) => {
    const response = await api.post(`/groups/join/${inviteCode}`)
    return response.data
  },

  getGroupMembers: async (groupId) => {
    const response = await api.get(`/groups/${groupId}/members`)
    return response.data
  },

  createJoinRequest: async (groupId, message) => {
    const response = await api.post(`/groups/${groupId}/join-requests`, { message })
    return response.data
  },

  getPendingJoinRequests: async (groupId) => {
    const response = await api.get(`/groups/${groupId}/join-requests/pending`)
    return response.data
  },

  reviewJoinRequest: async (requestId, approve) => {
    const response = await api.put(`/groups/join-requests/${requestId}/review?approve=${approve}`)
    return response.data
  },

  changeMemberRole: async (groupId, userId, role) => {
    const response = await api.put(`/groups/${groupId}/members/${userId}/role?role=${role}`)
    return response.data
  },

  removeMember: async (groupId, userId) => {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`)
    return response.data
  },

  transferOwnership: async (groupId, newOwnerId) => {
    const response = await api.put(`/groups/${groupId}/transfer-owner/${newOwnerId}`)
    return response.data
  }
}

export default groupService
