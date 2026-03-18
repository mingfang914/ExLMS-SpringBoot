import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GroupList from './pages/Groups/GroupList'
import GroupDetail from './pages/Groups/GroupDetail'
import CreateGroup from './pages/Groups/CreateGroup'
import CourseDetail from './pages/Courses/CourseDetail'
import CreateCourse from './pages/Courses/CreateCourse'
import MeetingRoom from './pages/Meetings/MeetingRoom'
import ForumList from './pages/Forum/ForumList'
import AssignmentList from './pages/Assignments/AssignmentList'
import AssignmentDetail from './pages/Assignments/AssignmentDetail'
import CreateAssignment from './pages/Assignments/CreateAssignment'
import Calendar from './pages/Calendar'
import Notifications from './pages/Notifications'
import Layout from './components/Layout'
import { initSocket, disconnectSocket } from './services/socketService'

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    if (isAuthenticated) {
      initSocket()
    } else {
      disconnectSocket()
    }

    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated])

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout>
              <Dashboard />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      
      {/* Protected Routes */}
      <Route path="/groups" element={isAuthenticated ? <Layout><GroupList /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/create" element={isAuthenticated ? <Layout><CreateGroup /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:id" element={isAuthenticated ? <Layout><GroupDetail /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/courses/create" element={isAuthenticated ? <Layout><CreateCourse /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/courses/:id" element={isAuthenticated ? <Layout><CourseDetail /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/meetings/:id" element={isAuthenticated ? <MeetingRoom /> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/assignments" element={isAuthenticated ? <Layout><AssignmentList /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/assignments/create" element={isAuthenticated ? <Layout><CreateAssignment /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/assignments/:id" element={isAuthenticated ? <Layout><AssignmentDetail /></Layout> : <Navigate to="/login" />} />
      <Route path="/forum" element={isAuthenticated ? <Layout><ForumList /></Layout> : <Navigate to="/login" />} />
      <Route path="/calendar" element={isAuthenticated ? <Layout><Calendar /></Layout> : <Navigate to="/login" />} />
      <Route path="/notifications" element={isAuthenticated ? <Layout><Notifications /></Layout> : <Navigate to="/login" />} />

      {/* Fallback routes for other pages */}
      <Route path="/courses" element={isAuthenticated ? <Layout><div>Courses Page</div></Layout> : <Navigate to="/login" />} />
      <Route path="/assignments" element={isAuthenticated ? <Layout><div>Assignments Page</div></Layout> : <Navigate to="/login" />} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
