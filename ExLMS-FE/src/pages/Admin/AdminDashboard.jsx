import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalGroups: 0, totalCourses: 0, upcomingAssignmentsCount: 0 });

    useEffect(() => {
        api.get('/dashboard/stats').then(res => setStats(res.data)).catch(console.error);
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Trang Quản Trị (Admin Dashboard)</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Tổng người dùng</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Tổng nhóm học tập</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalGroups}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Tổng khóa học</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCourses}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Bài tập sắp đến hạn</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcomingAssignmentsCount}</p>
                </div>
            </div>
            
            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Quản lý người dùng (Demo)</h2>
                <p className="text-gray-600">Tính năng quản lý người dùng chi tiết đang được phát triển.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
