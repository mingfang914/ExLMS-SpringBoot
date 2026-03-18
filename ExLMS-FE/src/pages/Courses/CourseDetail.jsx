import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Breadcrumbs,
  Link,
  LinearProgress,
  IconButton,
  Tooltip,
  Skeleton
} from '@mui/material'
import {
  PlayCircle as PlayIcon,
  Description as DocIcon,
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as PendingIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  NavigateNext as NextIcon
} from '@mui/icons-material'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import courseService from '../../services/courseService'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

const CourseDetail = () => {
  const { groupId, id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [focusMode, setFocusMode] = useState(false)

  // Mock chapters and lessons until backend is ready
  const mockChapters = [
    {
      id: 1,
      title: 'Introduction to Spring Boot',
      lessons: [
        { id: 101, title: 'What is Spring Boot?', type: 'VIDEO', completed: true },
        { id: 102, title: 'Setting up Development Environment', type: 'VIDEO', completed: true },
        { id: 103, title: 'Spring Boot Architecture', type: 'DOCUMENT', completed: false }
      ]
    },
    {
      id: 2,
      title: 'Building REST APIs',
      lessons: [
        { id: 201, title: 'REST Principles', type: 'DOCUMENT', completed: false },
        { id: 202, title: 'Creating your first Controller', type: 'VIDEO', completed: false },
        { id: 203, title: 'Handling HTTP Requests', type: 'VIDEO', completed: false }
      ]
    }
  ]

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true)
      try {
        const data = await courseService.getCourseById(groupId, id)
        setCourse(data)
        if (mockChapters[0]?.lessons[0]) setSelectedLesson(mockChapters[0].lessons[0])
      } catch (err) {
        // Fallback for demo
        setCourse({ title: 'Spring Boot Masterclass', groupName: 'Java Developers 2024' })
        if (mockChapters[0]?.lessons[0]) setSelectedLesson(mockChapters[0].lessons[0])
      } finally {
        setTimeout(() => setLoading(false), 800)
      }
    }
    fetchCourseData()
  }, [groupId, id])

  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ height: focusMode ? 'calc(100vh - 100px)' : 'auto' }}>
      
      {!focusMode && (
        <motion.div variants={itemVariants}>
          <Breadcrumbs aria-label="breadcrumb" separator={<NextIcon fontSize="small" />} sx={{ mb: 3 }}>
            <Link component={RouterLink} to="/groups" color="inherit" underline="hover">Groups</Link>
            <Link component={RouterLink} to={`/groups/${groupId}`} color="inherit" underline="hover">{course?.groupName || 'Group'}</Link>
            <Typography color="text.primary" fontWeight={600}>{loading ? <Skeleton width={150} /> : course?.title}</Typography>
          </Breadcrumbs>
        </motion.div>
      )}

      <Grid container spacing={3} sx={{ height: focusMode ? '100%' : 'auto' }}>
        
        {/* Left Column: Lesson Content */}
        <Grid item xs={12} md={focusMode ? 12 : 8} sx={{ transition: 'all 0.5s ease', height: focusMode ? '100%' : 'auto' }}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Paper className="glass-panel" sx={{ p: focusMode ? 0 : 3, mb: 3, borderRadius: 3, height: '100%', overflow: 'hidden', border: 'none' }}>
              {selectedLesson ? (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  
                  {!focusMode && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h4" fontWeight={700}>
                        {loading ? <Skeleton width="60%" /> : selectedLesson.title}
                      </Typography>
                      <Tooltip title="Focus Mode">
                        <IconButton onClick={() => setFocusMode(true)} sx={{ bgcolor: 'rgba(79, 70, 229, 0.1)' }}>
                          <FullscreenIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}

                  <Box 
                    sx={{ 
                      flexGrow: focusMode ? 1 : 0,
                      width: '100%', 
                      bgcolor: '#0f172a', 
                      borderRadius: focusMode ? 0 : 2, 
                      aspectRatio: focusMode ? 'auto' : '16/9', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
                    }}
                  >
                    {loading ? (
                      <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: 'grey.900' }} />
                    ) : (
                      <>
                        {selectedLesson.type === 'VIDEO' ? (
                          <PlayIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.7)', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }} />
                        ) : (
                          <DocIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.7)' }} />
                        )}
                        {focusMode && (
                          <Tooltip title="Exit Focus Mode">
                            <IconButton 
                              onClick={() => setFocusMode(false)} 
                              sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                            >
                              <FullscreenExitIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </Box>

                  {!focusMode && (
                    <Box sx={{ mt: 3, px: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>Lesson Details</Typography>
                      {loading ? (
                        <>
                          <Skeleton />
                          <Skeleton width="80%" />
                        </>
                      ) : (
                        <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
                          This is a placeholder description for the selected lesson. 
                          Dive deep into {selectedLesson.title} and understand the core concepts and applications.
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <Typography variant="h6" color="text.secondary">Select a lesson to start learning.</Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid>

        {/* Right Column: Course Sidebar (Curriculum) */}
        {!focusMode && (
          <Grid item xs={12} md={4}>
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }} 
                exit={{ opacity: 0, x: 20 }}
                style={{ height: '100%' }}
              >
                <Paper className="glass-panel" sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: 'none', height: '100%' }}>
                  <Box sx={{ p: 3, background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: 'white' }}>
                    <Typography variant="h6" fontWeight={700}>Course Content</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={500}>Progress</Typography>
                        <Typography variant="body2" fontWeight={700}>33%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={33} 
                        sx={{ 
                          height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', 
                          '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 3 } 
                        }} 
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto', p: 1 }}>
                    {loading ? (
                      <Box sx={{ p: 2 }}>
                        {[1, 2, 3].map(i => (
                          <Box key={i} sx={{ mb: 3 }}>
                            <Skeleton height={30} width="60%" sx={{ mb: 1 }} />
                            <Skeleton height={50} variant="rounded" sx={{ mb: 1 }} />
                            <Skeleton height={50} variant="rounded" />
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      mockChapters.map((chapter) => (
                        <Box key={chapter.id} sx={{ mb: 2 }}>
                          <Box sx={{ p: 1.5, pl: 2 }}>
                            <Typography variant="subtitle2" color="primary.main" fontWeight={700} textTransform="uppercase" letterSpacing={1}>
                              {chapter.title}
                            </Typography>
                          </Box>
                          <List sx={{ p: 0 }}>
                            {chapter.lessons.map((lesson) => {
                              const isSelected = selectedLesson?.id === lesson.id;
                              return (
                                <ListItem key={lesson.id} disablePadding sx={{ mb: 0.5 }}>
                                  <ListItemButton
                                    selected={isSelected}
                                    onClick={() => setSelectedLesson(lesson)}
                                    sx={{ 
                                      borderRadius: 2, 
                                      px: 2,
                                      transition: 'all 0.2s',
                                      '&.Mui-selected': {
                                        bgcolor: 'rgba(79, 70, 229, 0.08)',
                                        '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.12)' }
                                      },
                                      '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                                    }}
                                  >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      {lesson.completed ? <DoneIcon color="secondary" fontSize="small" /> : <PendingIcon sx={{ color: 'text.disabled' }} fontSize="small" />}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={lesson.title}
                                      primaryTypographyProps={{ 
                                        variant: 'body2', 
                                        fontWeight: isSelected ? 700 : 500,
                                        color: isSelected ? 'primary.main' : 'text.primary'
                                      }}
                                    />
                                    {lesson.type === 'VIDEO' ? <PlayIcon fontSize="small" sx={{ color: isSelected ? 'primary.main' : 'text.disabled' }} /> : <DocIcon fontSize="small" sx={{ color: isSelected ? 'primary.main' : 'text.disabled' }} />}
                                  </ListItemButton>
                                </ListItem>
                              )
                            })}
                          </List>
                        </Box>
                      ))
                    )}
                  </Box>
                </Paper>
              </motion.div>
            </AnimatePresence>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default CourseDetail
