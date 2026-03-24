import React, { useState } from 'react';
import { createQuiz } from '../../services/quizService';
import { useNavigate, useParams } from 'react-router-dom';

const CreateQuiz = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        timeLimitSec: 3600,
        passingScore: 50,
        questions: []
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createQuiz({ ...formData, courseId });
            navigate(`/courses/${courseId}/quizzes`);
        } catch (error) {
            console.error('Failed to create quiz:', error);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Tạo Bài Kiểm Tra Mới</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                    <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Thời gian làm bài (Phút)</label>
                        <input type="number" value={formData.timeLimitSec / 60} onChange={e => setFormData({...formData, timeLimitSec: parseInt(e.target.value) * 60})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Điểm qua môn (%)</label>
                        <input type="number" min="0" max="100" value={formData.passingScore} onChange={e => setFormData({...formData, passingScore: parseInt(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-end">
                    <button type="button" onClick={() => navigate(-1)} className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Hủy</button>
                    <button type="submit" className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Tạo</button>
                </div>
            </form>
        </div>
    );
};

export default CreateQuiz;
