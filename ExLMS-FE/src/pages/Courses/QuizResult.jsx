import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Button, Divider, CircularProgress, Alert,
  List, ListItem, ListItemText, ListItemIcon, Chip
} from '@mui/material'
import {
  CheckCircle as CheckIcon, Cancel as ErrorIcon,
  HelpOutline as QuestionIcon, ArrowBack
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import courseService from '../../services/courseService'

const QuizResult = () => {
  const { groupId, courseId, attemptId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadResult = async () => {
      try {
        const data = await courseService.getQuizAttemptResult(attemptId)
        setResult(data)
      } catch (e) {
        alert(e.response?.data?.message || 'Không thể tải kết quả bài kiểm tra')
      } finally {
        setLoading(false)
      }
    }
    loadResult()
  }, [attemptId])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (!result) return <Alert severity="error">Không tìm thấy kết quả.</Alert>

  const isPassed = result.score >= (result.passingScore || 50)

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          {isPassed ? (
            <CheckIcon sx={{ fontSize: 80, color: 'success.main' }} />
          ) : (
            <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />
          )}
        </Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {isPassed ? 'Chúc mừng! Bạn đã đạt' : 'Rất tiếc! Bạn chưa đạt'}
        </Typography>
        <Typography variant="h2" color={isPassed ? 'success.main' : 'error.main'} fontWeight={800} sx={{ my: 2 }}>
          {(result.score || 0).toFixed(1)}%
        </Typography>
        <Typography color="text.secondary">
          Điểm cần đạt: {result.passingScore}%
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 4 }}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(`/groups/${groupId}/courses/${courseId}/view`)}>
            Quay lại khóa học
          </Button>
          <Button variant="contained" onClick={() => navigate(-2)}>
            Thoát
          </Button>
        </Box>
      </Paper>

      {/* Detailed Feedback (if visible) */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Chi tiết bài làm</Typography>
      <List>
        {(result.responses || []).map((resp, idx) => (
          <Paper key={resp.questionId || idx} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ mt: 0.5 }}>
                {resp.correct ? (
                  <CheckIcon color="success" />
                ) : (
                  <ErrorIcon color="error" />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>Câu {idx + 1}: {resp.questionContent}</Typography>
                <Box sx={{ mt: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Câu trả lời của bạn:</Typography>
                  <Typography variant="body1">{resp.content || '(Bỏ trống)'}</Typography>
                </Box>
                
                {!resp.correct && resp.explanation && (
                  <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'info.lighter', borderLeft: '4px solid', borderColor: 'info.main', borderRadius: '0 4px 4px 0' }}>
                    <Typography variant="body2" fontWeight={700} color="info.main">Giải thích:</Typography>
                    <Typography variant="body2">{resp.explanation}</Typography>
                  </Box>
                )}
              </Box>
              <Chip label={resp.correct ? `+${resp.points} điểm` : '0 điểm'} 
                    color={resp.correct ? 'success' : 'default'} size="small" />
            </Box>
          </Paper>
        ))}
      </List>
    </Box>
  )
}

export default QuizResult
