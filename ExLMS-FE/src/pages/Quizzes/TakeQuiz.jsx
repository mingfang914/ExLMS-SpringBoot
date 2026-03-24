import React, { useState, useEffect } from 'react';
import { getQuiz, submitQuiz } from '../../services/quizService';
import { useParams, useNavigate } from 'react-router-dom';

const TakeQuiz = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [responses, setResponses] = useState({});

    useEffect(() => {
        getQuiz(quizId).then(setQuiz).catch(console.error);
    }, [quizId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const attemptData = { 
                responses: Object.keys(responses).map(qId => ({ questionId: qId, selectedAnswerId: responses[qId] })) 
            };
            await submitQuiz(quizId, attemptData);
            navigate(`/quizzes/${quizId}/results`);
        } catch (error) {
            console.error('Submission failed', error);
        }
    };

    if (!quiz) return <div className="p-6">Đang tải biểu mẫu...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-gray-600 mb-8">{quiz.description}</p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                {quiz.questions?.map((q, index) => (
                    <div key={q.id} className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4">Câu {index + 1}: {q.content}</h3>
                        <div className="space-y-3">
                            {q.answers?.map(ans => (
                                <label key={ans.id} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                    <input type="radio" name={`question_${q.id}`} value={ans.id} onChange={(e) => setResponses({...responses, [q.id]: e.target.value})} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                                    <span className="ml-3 block text-sm font-medium text-gray-700">{ans.content}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                
                <div className="flex justify-end">
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Nộp Bài
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TakeQuiz;
