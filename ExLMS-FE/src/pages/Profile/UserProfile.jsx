import React, { useState } from 'react';

const UserProfile = () => {
    const [profile, setProfile] = useState({ fullName: 'Nguyễn Văn A', email: 'user@example.com', bio: '' });

    const handleSave = (e) => {
        e.preventDefault();
        alert('Cập nhật hồ sơ thành công!');
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Hồ Sơ Cá Nhân</h1>
            <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Họ và Tên</label>
                    <input type="text" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" disabled value={profile.email} className="mt-1 block w-full bg-gray-100 rounded-md border-gray-300 shadow-sm p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tiểu sử (Bio)</label>
                    <textarea rows="4" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"></textarea>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">Lưu Thay Đổi</button>
                </div>
            </form>
        </div>
    );
};

export default UserProfile;
