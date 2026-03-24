import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Grid, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Divider, Alert, Breadcrumbs, Link,
  LinearProgress, IconButton, Tooltip, Skeleton, Button
} from '@mui/material'
import {
  PlayCircle as PlayIcon, Description as DocIcon, CheckCircle as DoneIcon,
  RadioButtonUnchecked as PendingIcon, Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon, NavigateNext as NextIcon,
  Quiz as QuizIcon
} from '@mui/icons-material'
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom'
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
  const { groupId, id: courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [chapters, setChapters] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [focusMode, setFocusMode] = useState(false)

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true)
      try {
        const [courseData, chapterList, quizList] = await Promise.all([
          courseService.getCourseById(groupId, courseId),
          courseService.getChapters(courseId),
          courseService.getQuizzesByCourseId(courseId)
        ])
        setCourse(courseData)
        setQuizzes(quizList)

        const withLessons = await Promise.all(
          chapterList.map(async (ch) => ({
            ...ch,
            lessons: await courseService.getLessons(ch.id).catch(() => [])
          }))
        )
        setChapters(withLessons)

        const firstLesson = withLessons[0]?.lessons?.[0]
        if (firstLesson) setSelectedItem({ type: 'LESSON', ...firstLesson })
        else if (quizList[0]) setSelectedItem({ type: 'QUIZ', ...quizList[0] })
      } catch (err) {
        setError('Không thể tải dữ liệu khóa học.')
      } finally {
        setLoading(false)
      }
    }
    fetchCourseData()
  }, [groupId, courseId])

  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ height: focusMode ? 'calc(100vh - 100px)' : 'auto', p: 3 }}>
      
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
        
        {/* Left Column: Content */}
        <Grid item xs={12} md={focusMode ? 12 : 8} sx={{ transition: 'all 0.5s ease', height: focusMode ? '100%' : 'auto' }}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Paper className="glass-panel" sx={{ p: focusMode ? 0 : 3, mb: 3, borderRadius: 3, height: '100%', overflow: 'hidden', border: 'none' }}>
              {selectedItem ? (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {!focusMode && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h4" fontWeight={700}>
                        {loading ? <Skeleton width="60%" /> : selectedItem.title}
                      </Typography>
                      <Tooltip title="Focus Mode">
                        <IconButton onClick={() => setFocusMode(true)} sx={{ bgcolor: 'rgba(79, 70, 229, 0.1)' }}>
                          <FullscreenIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}

                  <Box sx={{ 
                    flexGrow: focusMode ? 1 : 0, 
                    width: '100%', bgcolor: '#0f172a', 
                    borderRadius: focusMode ? 0 : 2, 
                    aspectRatio: focusMode ? 'auto' : '16/9', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    position: 'relative', overflow: 'hidden', 
                    boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)' 
                  }}>
                    {loading ? (
                      <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: 'grey.900' }} />
                    ) : (
                      <>
                        {selectedItem.type === 'QUIZ' ? (
                          <Box sx={{ textAlign: 'center', color: 'white' }}>
                            <QuizIcon sx={{ fontSize: 80, mb: 2, color: 'secondary.main' }} />
                            <Typography variant="h5" fontWeight={700}>{selectedItem.title}</Typography>
                            <Button 
                              variant="contained" color="secondary" sx={{ mt: 3 }}
                              onClick={() => navigate(`/groups/${groupId}/courses/${courseId}/quiz/${selectedItem.id}/take`)}
                            >
                              Bắt đầu làm bài
                            </Button>
                          </Box>
                        ) : (
                          <>
                            {selectedItem.contentType === 'VIDEO' ? (
                              <PlayIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.7)' }} />
                            ) : (
                              <DocIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.7)' }} />
                            )}
                          </>
                        )}
                        {focusMode && (
                          <IconButton 
                            onClick={() => setFocusMode(false)} 
                            sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
                          >
                            <FullscreenExitIcon />
                          </IconButton>
                        )}
                      </>
                    )}
                  </Box>

                  {!focusMode && (
                    <Box sx={{ mt: 3, px: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>Chi tiết</Typography>
                      <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
                        {selectedItem.description || 'Không có mô tả.'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ p: 10, textAlign: 'center' }}>
                  <Typography color="text.secondary">Chọn nội dung để bắt đầu học.</Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid>

        {/* Right Column: Sidebar */}
        {!focusMode && (
          <Grid item xs={12} md={4}>
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <Paper className="glass-panel" sx={{ borderRadius: 3, overflow: 'hidden', border: 'none' }}>
                  <Box sx={{ p: 3, background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: 'white' }}>
                    <Typography variant="h6" fontWeight={700}>Nội dung khóa học</Typography>
                  </Box>
                  
                  <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', p: 1 }}>
                    {loading ? <Skeleton height={200} /> : (
                      <>
                        {chapters.map((ch) => (
                          <Box key={ch.id} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ p: 1, pl: 2, fontWeight: 700, color: 'primary.main' }}>
                              {ch.title}
                            </Typography>
                            <List sx={{ p: 0 }}>
                              {(ch.lessons || []).map((lesson) => (
                                <ListItem key={lesson.id} disablePadding>
                                  <ListItemButton 
                                    selected={selectedItem?.id === lesson.id}
                                    onClick={() => setSelectedItem({ type: 'LESSON', ...lesson })}
                                    sx={{ borderRadius: 2 }}
                                  >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      {lesson.completed ? <DoneIcon color="secondary" fontSize="small" /> : <PendingIcon fontSize="small" />}
                                    </ListItemIcon>
                                    <ListItemText primary={lesson.title} primaryTypographyProps={{ variant: 'body2' }} />
                                  </ListItemButton>
                                </ListItem>
                              ))}
                              {quizzes.filter(q => q.chapterId === ch.id).map(quiz => (
                                <ListItem key={quiz.id} disablePadding>
                                  <ListItemButton
                                    selected={selectedItem?.id === quiz.id}
                                    onClick={() => setSelectedItem({ type: 'QUIZ', ...quiz })}
                                    sx={{ borderRadius: 2 }}
                                  >
                                    <ListItemIcon sx={{ minWidth: 36 }}><QuizIcon color="secondary" fontSize="small" /></ListItemIcon>
                                    <ListItemText primary={quiz.title} primaryTypographyProps={{ variant: 'body2' }} />
                                  </ListItemButton>
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        ))}
                        {quizzes.filter(q => !q.chapterId).map(quiz => (
                          <ListItem key={quiz.id} disablePadding sx={{ px: 1 }}>
                            <ListItemButton
                              selected={selectedItem?.id === quiz.id}
                              onClick={() => setSelectedItem({ type: 'QUIZ', ...quiz })}
                              sx={{ borderRadius: 2 }}
                            >
                              <ListItemIcon sx={{ minWidth: 36 }}><QuizIcon color="secondary" fontSize="small" /></ListItemIcon>
                              <ListItemText primary={quiz.title} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </>
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
