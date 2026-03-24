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
import CourseEditor from './pages/Courses/CourseEditor'
import GroupCourseDetail from './pages/Courses/GroupCourseDetail'
import QuizEditor from './pages/Courses/QuizEditor'
import QuizPlayer from './pages/Courses/QuizPlayer'
import QuizResult from './pages/Courses/QuizResult'
import MeetingRoom from './pages/Meetings/MeetingRoom'
import MeetingDetail from './pages/Meetings/MeetingDetail'
import ForumList from './pages/Forum/ForumList'
import AssignmentList from './pages/Assignments/AssignmentList'
import AssignmentDetail from './pages/Assignments/AssignmentDetail'
import AssignmentForm from './pages/Assignments/AssignmentForm'
import Calendar from './pages/Calendar'
import Notifications from './pages/Notifications'
import Users from './pages/Admin/Users'
import Profile from './pages/Profile'
import Layout from './components/Layout'
import { initSocket, disconnectSocket } from './services/socketService'
import { setUser } from './store/authSlice'
import authService from './services/authService'

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    if (isAuthenticated) {
      initSocket()
      if (!user) {
        authService.getCurrentUser()
          .then(data => dispatch(setUser(data)))
          .catch(err => console.error('Failed to restore user session:', err))
      }
    } else {
      disconnectSocket()
    }

    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated, user, dispatch])

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
      <Route path="/groups/:groupId/courses/create" element={isAuthenticated ? <Layout><CourseEditor /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/courses/:courseId/edit" element={isAuthenticated ? <Layout><CourseEditor /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/courses/:courseId/view" element={isAuthenticated ? <Layout><GroupCourseDetail /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/courses/:courseId/quiz/create" element={isAuthenticated ? <Layout><QuizEditor /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/courses/:courseId/quiz/:quizId/edit" element={isAuthenticated ? <Layout><QuizEditor /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/courses/:courseId/quiz/:quizId/take" element={isAuthenticated ? <Layout><QuizPlayer /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/courses/:courseId/quiz/attempts/:attemptId/result" element={isAuthenticated ? <Layout><QuizResult /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/courses/:id" element={isAuthenticated ? <Layout><CourseDetail /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/meetings/:id" element={isAuthenticated ? <Layout><MeetingDetail /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/meetings/:id/room" element={isAuthenticated ? <MeetingRoom /> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/assignments" element={isAuthenticated ? <Layout><AssignmentList /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/assignments/create" element={isAuthenticated ? <Layout><AssignmentForm /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/assignments/:id/edit" element={isAuthenticated ? <Layout><AssignmentForm /></Layout> : <Navigate to="/login" />} />
      <Route path="/groups/:groupId/assignments/:id" element={isAuthenticated ? <Layout><AssignmentDetail /></Layout> : <Navigate to="/login" />} />
      <Route path="/forum" element={isAuthenticated ? <Layout><ForumList /></Layout> : <Navigate to="/login" />} />
      <Route path="/calendar" element={isAuthenticated ? <Layout><Calendar /></Layout> : <Navigate to="/login" />} />
      <Route path="/notifications" element={isAuthenticated ? <Layout><Notifications /></Layout> : <Navigate to="/login" />} />
      <Route path="/admin/users" element={isAuthenticated ? <Layout><Users /></Layout> : <Navigate to="/login" />} />
      <Route path="/profile" element={isAuthenticated ? <Layout><Profile /></Layout> : <Navigate to="/login" />} />

      {/* Fallback routes for other pages */}
      <Route path="/courses" element={isAuthenticated ? <Layout><div>Courses Page</div></Layout> : <Navigate to="/login" />} />
      <Route path="/assignments" element={isAuthenticated ? <Layout><div>Assignments Page</div></Layout> : <Navigate to="/login" />} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
