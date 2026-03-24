import api from './api';

export const getQuizzes = async (courseId) => {
    const response = await api.get(`/quizzes?courseId=${courseId}`);
    return response.data;
};

export const getQuiz = async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
};

export const createQuiz = async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response.data;
};

export const submitQuiz = async (quizId, attemptData) => {
    const response = await api.post(`/quizzes/${quizId}/attempts`, attemptData);
    return response.data;
};
