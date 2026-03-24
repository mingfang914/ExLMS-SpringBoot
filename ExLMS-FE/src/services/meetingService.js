import api from './api';

const API_URL = '/v1/meetings';

const meetingService = {
  scheduleMeeting: async (groupId, meetingData) => {
    const response = await api.post(`${API_URL}/group/${groupId}`, meetingData);
    return response.data;
  },

  updateMeeting: async (id, meetingData) => {
    const response = await api.put(`${API_URL}/${id}`, meetingData);
    return response.data;
  },

  deleteMeeting: async (id) => {
    await api.delete(`${API_URL}/${id}`);
  },

  getMeeting: async (id) => {
    const response = await api.get(`${API_URL}/${id?.trim()}`);
    return response.data;
  },

  getMeetingsByGroup: async (groupId) => {
    const response = await api.get(`${API_URL}/group/${groupId}`);
    return response.data;
  },

  startMeeting: async (id) => {
    await api.post(`${API_URL}/${id}/start`);
  },

  endMeeting: async (id) => {
    await api.post(`${API_URL}/${id}/end`);
  },

  recordAttendance: async (id, joining) => {
    await api.post(`${API_URL}/${id}/attend?joining=${joining}`);
  },

  getAttendanceReport: async (id) => {
    const response = await api.get(`${API_URL}/${id}/attendance`);
    return response.data;
  },

  addQuestion: async (id, questionData) => {
    const response = await api.post(`${API_URL}/${id?.trim()}/questions`, questionData);
    return response.data;
  },

  answerQuestion: async (questionId, answer) => {
    await api.post(`${API_URL}/questions/${questionId}/answer?answer=${encodeURIComponent(answer)}`);
  },

  getQuestions: async (id) => {
    const response = await api.get(`${API_URL}/${id?.trim()}/questions`);
    return response.data;
  },

  createPoll: async (id, pollData) => {
    const response = await api.post(`${API_URL}/${id?.trim()}/polls`, pollData);
    return response.data;
  },

  voteInPoll: async (pollId, optionId) => {
    await api.post(`${API_URL}/polls/${pollId}/vote?optionId=${optionId}`);
  },

  getPolls: async (id) => {
    const response = await api.get(`${API_URL}/${id}/polls`);
    return response.data;
  }
};

export default meetingService;
