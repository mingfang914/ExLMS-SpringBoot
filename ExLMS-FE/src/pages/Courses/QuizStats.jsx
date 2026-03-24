import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Grid, Card, CardContent, Divider,
  List, ListItem, ListItemText, LinearProgress, CircularProgress,
  Alert, Breadcrumbs, Link, Button
} from '@mui/material'
import {
  TrendingUp, People, Timer, AssignmentTurnedIn,
  TrendingDown, HelpOutline, NavigateNext as NextIcon
} from '@mui/icons-material'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import courseService from '../../services/courseService'

const QuizStats = () => {
  const { groupId, courseId, quizId } = useParams()
  const [stats, setStats] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [statsData, quizData] = await Promise.all([
          courseService.getQuizStats(quizId),
          courseService.getQuizById(quizId)
        ])
        setStats(statsData)
        setQuiz(quizData)
      } catch (err) {
        setError('Không thể tải thống kê bài kiểm tra.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [quizId])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">{error}</Alert>
  if (!stats) return <Alert severity="info">Chưa có lượt làm bài nào.</Alert>

  return (
    <Box sx={{ p: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" separator={<NextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/groups" color="inherit" underline="hover">Groups</Link>
        <Link component={RouterLink} to={`/groups/${groupId}`} color="inherit" underline="hover">Khóa học</Link>
        <Link component={RouterLink} to={`/groups/${groupId}/courses/${courseId}/edit`} color="inherit" underline="hover">Chỉnh sửa</Link>
        <Typography color="text.primary" fontWeight={600}>Thống kê: {quiz?.title}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
        Thống kê kết quả: {quiz?.title}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tổng lượt làm bài" value={stats.totalAttempts} icon={<People color="primary" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Điểm trung bình" value={`${stats.averageScore.toFixed(1)}%`} icon={<TrendingUp color="secondary" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tỷ lệ đạt" value={`${stats.passRate.toFixed(1)}%`} icon={<AssignmentTurnedIn sx={{ color: '#10b981' }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Thời gian TB" value="--" icon={<Timer color="info" />} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper className="glass-panel" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Phân phối điểm</Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ mt: 2 }}>
              {Object.entries(stats.scoreDistribution).map(([range, count]) => (
                <Box key={range} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>{range}%</Typography>
                    <Typography variant="body2" color="text.secondary">{count} lượt</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(count / stats.totalAttempts) * 100} 
                    sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.05)' }} 
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper className="glass-panel" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
              <TrendingDown sx={{ mr: 1 }} /> Câu hỏi hay sai nhất
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {stats.mostWrongQuestions.map((q, idx) => (
                <ListItem key={q.questionId} divider={idx !== stats.mostWrongQuestions.length - 1}>
                  <ListItemText
                    primary={q.content}
                    secondary={`${q.wrongCount} lượt sai (${q.wrongPercentage.toFixed(1)}%)`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600, noWrap: true }}
                  />
                </ListItem>
              ))}
              {stats.mostWrongQuestions.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 2 }}>Thông tin đang được cập nhật...</Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

const StatCard = ({ title, value, icon }) => (
  <Card className="glass-panel" sx={{ height: '100%', borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography color="text.secondary" variant="body2" fontWeight={600}>{title}</Typography>
        {icon}
      </Box>
      <Typography variant="h4" fontWeight={800}>{value}</Typography>
    </CardContent>
  </Card>
)

export default QuizStats
