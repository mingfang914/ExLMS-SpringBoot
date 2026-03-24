import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, List, ListItemButton, ListItemIcon, ListItemText,
  Chip, LinearProgress, Button, Divider, CircularProgress, Alert,
  Accordion, AccordionSummary, AccordionDetails, Snackbar
} from '@mui/material'
import {
  PlayCircle as VideoIcon, Description as DocIcon, AttachFile as FileIcon,
  Code as EmbedIcon, CheckCircle as CheckIcon, Lock as LockIcon,
  ExpandMore as ExpandMoreIcon, Quiz as QuizIcon
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import courseService from '../../services/courseService'

const CONTENT_ICONS = {
  VIDEO: <VideoIcon color="primary" />,
  DOCUMENT: <DocIcon color="success" />,
  FILE: <FileIcon color="warning" />,
  EMBED: <EmbedIcon color="secondary" />,
}

/**
 * Convert a YouTube/Vimeo URL to an embeddable iframe src
 */
const toEmbedUrl = (url) => {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return url 
}

const processContent = (html) => {
  if (!html) return ''
  // Replace <oembed url="..."> with iframe for YouTube/Vimeo
  let processed = html.replace(/<oembed url="([^"]+)"><\/oembed>/g, (match, url) => {
    const embedUrl = toEmbedUrl(url)
    if (embedUrl) {
      return `<div class="iframe-container"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div>`
    }
    return match
  })
  return processed
}

const GroupCourseDetail = () => {
  const { groupId, courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [chapters, setChapters] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [activeItem, setActiveItem] = useState(null) // Can be lesson or quiz
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'error' })
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
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

        // First item selected by default
        const firstLesson = withLessons[0]?.lessons?.[0]
        if (firstLesson) setActiveItem({ type: 'LESSON', ...firstLesson })
        else if (quizList[0]) setActiveItem({ type: 'QUIZ', ...quizList[0] })

        // Try to get enrollment (returns null if not enrolled)
        const enroll = await courseService.getMyEnrollment(courseId)
        setEnrollment(enroll)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, groupId])

  const handleEnroll = async () => {
    try {
      const enroll = await courseService.enrollCourse(courseId)
      setEnrollment(enroll)
      setSnackbar({ open: true, msg: 'Đăng ký khóa học thành công!', severity: 'success' })
    } catch (e) {
      const msg = e.response?.data?.message || 'Không thể đăng ký khóa học'
      setSnackbar({ open: true, msg, severity: 'error' })
    }
  }

  const handleMarkComplete = async () => {
    if (!activeItem || activeItem.type !== 'LESSON' || !enrollment) return
    setCompleting(true)
    try {
      await courseService.markLessonComplete(activeItem.chapter?.id || activeItem.chapterId, activeItem.id)
      // Refresh enrollment progress
      const updated = await courseService.getMyEnrollment(courseId)
      setEnrollment(updated)
    } catch (e) {
      alert(e.response?.data?.message || 'Lỗi đánh dấu hoàn thành')
    } finally {
      setCompleting(false)
    }
  }

  const handleStartQuiz = (quizId) => {
    navigate(`/groups/${groupId}/courses/${courseId}/quiz/${quizId}/take`)
  }

  const renderLessonContent = (lesson) => {
    if (!lesson) return null
    switch (lesson.contentType) {
      case 'VIDEO': {
        const embedSrc = toEmbedUrl(lesson.content)
        if (embedSrc) {
          return (
            <Box sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: 2, overflow: 'hidden' }}>
              <iframe
                src={embedSrc}
                title={lesson.title}
                frameBorder="0"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            </Box>
          )
        }
        // Direct video file
        return (
          <video controls style={{ width: '100%', borderRadius: 8 }}>
            <source src={lesson.content} />
            Trình duyệt không hỗ trợ video.
          </video>
        )
      }
      case 'DOCUMENT':
        return (
          <Box className="ck-content" sx={{ 
            p: 2,
            '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2 },
            '& .iframe-container': {
              position: 'relative',
              paddingTop: '56.25%',
              mb: 2,
              '& iframe': {
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                borderRadius: 2
              }
            },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              pl: 2, fontStyle: 'italic', color: 'text.secondary'
            },
            '& table': {
              width: '100%', borderCollapse: 'collapse', mb: 2,
              '& td, & th': { border: '1px solid', borderColor: 'divider', p: 1 }
            }
          }}
            dangerouslySetInnerHTML={{ __html: processContent(lesson.content) }}
          />
        )
      case 'EMBED':
        return (
          <Box sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: 2, overflow: 'hidden' }}>
            <iframe
              src={lesson.content}
              title={lesson.title}
              frameBorder="0"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          </Box>
        )
      case 'FILE':
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <FileIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
            <Typography variant="h6">{lesson.title}</Typography>
            <Button variant="contained" color="warning" sx={{ mt: 2 }} href={lesson.content} download>
              Tải xuống tệp
            </Button>
          </Box>
        )
      default:
        return <Typography color="text.secondary" sx={{ p: 2 }}>Không có nội dung.</Typography>
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
  if (!course) return <Alert severity="error">Không tìm thấy khóa học.</Alert>

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, p: 2, height: 'calc(100vh - 80px)' }}>
      {/* ── Sidebar: Chapters + Lessons ── */}
      <Paper sx={{ width: 300, flexShrink: 0, overflowY: 'auto', borderRadius: 2, p: 1 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography fontWeight={700} noWrap>{course.title}</Typography>
          {enrollment && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption">
                Tiến độ: {enrollment.progressPercent || 0}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={enrollment.progressPercent || 0}
                sx={{ mt: 0.5, borderRadius: 1, height: 6 }}
              />
            </Box>
          )}
          {!enrollment && (
            <Button variant="contained" size="small" fullWidth sx={{ mt: 1 }} onClick={handleEnroll}>
              Đăng ký học
            </Button>
          )}
        </Box>

        {chapters.map((ch, idx) => (
          <Accordion key={ch.id} defaultExpanded={idx === 0}
            sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Chương {idx + 1}: {ch.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List dense disablePadding>
                {(ch.lessons || []).map((lesson) => (
                  <ListItemButton
                    key={lesson.id}
                    selected={activeItem?.type === 'LESSON' && activeItem?.id === lesson.id}
                    onClick={() => setActiveItem({ type: 'LESSON', ...lesson, chapterId: ch.id })}
                    sx={{ pl: 2, borderRadius: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {CONTENT_ICONS[lesson.contentType] || <DocIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={lesson.title}
                      primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                    />
                    {lesson.completed && <CheckIcon fontSize="small" color="success" />}
                  </ListItemButton>
                ))}
                {/* Quizzes in this chapter */}
                {quizzes.filter(q => q.chapterId === ch.id).map(quiz => (
                  <ListItemButton
                    key={quiz.id}
                    selected={activeItem?.type === 'QUIZ' && activeItem?.id === quiz.id}
                    onClick={() => setActiveItem({ type: 'QUIZ', ...quiz })}
                    sx={{ pl: 2, borderRadius: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}><QuizIcon color="primary" /></ListItemIcon>
                    <ListItemText
                      primary={`[Quiz] ${quiz.title}`}
                      primaryTypographyProps={{ variant: 'body2', noWrap: true, color: 'primary.main' }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Top-level Quizzes */}
        <List dense sx={{ px: 1 }}>
          {quizzes.filter(q => !q.chapterId).map(quiz => (
            <ListItemButton
              key={quiz.id}
              selected={activeItem?.type === 'QUIZ' && activeItem?.id === quiz.id}
              onClick={() => setActiveItem({ type: 'QUIZ', ...quiz })}
              sx={{ borderRadius: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}><QuizIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary={`Bài kiểm tra: ${quiz.title}`}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600, color: 'primary.main' }}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* ── Main Content Area ── */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {activeItem?.type === 'LESSON' ? (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Chip
                  icon={CONTENT_ICONS[activeItem.contentType]}
                  label={activeItem.contentType}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="h5" fontWeight={700}>{activeItem.title}</Typography>
              </Box>
              {enrollment && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={handleMarkComplete}
                  disabled={completing}
                >
                  {completing ? <CircularProgress size={18} color="inherit" /> : 'Hoàn thành'}
                </Button>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {renderLessonContent(activeItem)}
          </Paper>
        ) : activeItem?.type === 'QUIZ' ? (
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            {/* Quiz Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'white', display: 'flex' }}>
                <QuizIcon sx={{ fontSize: 36 }} />
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">Bài kiểm tra</Typography>
                <Typography variant="h5" fontWeight={700}>{activeItem.title}</Typography>
              </Box>
            </Box>

            {activeItem.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {activeItem.description}
              </Typography>
            )}

            {/* Quiz Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              {[
                { label: 'Thời gian', value: activeItem.timeLimitSec ? `${Math.floor(activeItem.timeLimitSec / 60)} phút` : 'Không giới hạn' },
                { label: 'Số lần làm', value: activeItem.maxAttempts ?? '∞' },
                { label: 'Điểm đạt', value: `${activeItem.passingScore ?? 50}%` },
              ].map(stat => (
                <Paper key={stat.label} variant="outlined" sx={{ p: 2, flex: 1, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={700} color="primary.main">{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Paper>
              ))}
            </Box>

            {/* CTA */}
            {!enrollment ? (
              <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Bạn cần <strong>đăng ký khóa học</strong> để tham gia bài kiểm tra này.
                </Alert>
                <Button variant="contained" fullWidth size="large" onClick={handleEnroll} sx={{ py: 1.5 }}>
                  Đăng ký học ngay
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => handleStartQuiz(activeItem.id)}
                sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 700, borderRadius: 2 }}
              >
                Bắt đầu làm bài →
              </Button>
            )}
          </Paper>
        ) : (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary">
              Chọn một bài học từ danh sách bên trái để bắt đầu học
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
    <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
      <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.msg}</Alert>
    </Snackbar>
  </>
  )
}

export default GroupCourseDetail
