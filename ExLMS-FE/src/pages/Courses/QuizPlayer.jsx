import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, Paper, Button, Radio, RadioGroup, FormControlLabel,
  Checkbox, TextField, Divider, LinearProgress, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid
} from '@mui/material'
import {
  Timer as TimerIcon, NavigateNext, NavigateBefore, Send as SendIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import courseService from '../../services/courseService'

const QuizPlayer = () => {
  const { groupId, courseId, quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [currentQIdx, setCurrentQIdx] = useState(0)
  // answers: { [questionId]: UUID | UUID[] | string }
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef()
  const startedRef = useRef(false)

  useEffect(() => {
    const start = async () => {
      if (startedRef.current) return
      startedRef.current = true
      try {
        const quizData = await courseService.getQuizById(quizId)
        setQuiz(quizData)
        const attemptData = await courseService.startQuizAttempt(quizId)
        setAttempt(attemptData)
        if (quizData.timeLimitSec) {
          setTimeLeft(quizData.timeLimitSec)
        }
      } catch (e) {
        const msg = e.response?.data?.message || ''
        // If max attempts exceeded, try to redirect to last result
        if (msg.includes('hết lượt') || msg.includes('attempts')) {
          try {
            const prevAttempts = await courseService.getMyQuizAttempts(quizId)
            // Find the last SUBMITTED attempt
            const lastSubmitted = prevAttempts
              .filter(a => a.submittedAt)
              .sort((a, b) => (b.attemptNumber || 0) - (a.attemptNumber || 0))[0]
            if (lastSubmitted) {
              navigate(`/groups/${groupId}/courses/${courseId}/quiz/attempts/${lastSubmitted.id}/result`, { replace: true })
              return
            }
          } catch (_) {}
        }
        setError(msg || 'Không thể bắt đầu bài kiểm tra.')
      } finally {
        setLoading(false)
      }
    }
    start()
  }, [quizId])

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0 && attempt) handleFinalSubmit()
      return
    }
    timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [timeLeft])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleSingleAnswer = (qId, answerId) => {
    setAnswers(prev => ({ ...prev, [qId]: answerId }))
  }

  const handleMultiAnswer = (qId, answerId, checked) => {
    setAnswers(prev => {
      const prev_ids = prev[qId] || []
      const next = checked ? [...prev_ids, answerId] : prev_ids.filter(id => id !== answerId)
      return { ...prev, [qId]: next }
    })
  }

  const handleTextAnswer = (qId, text) => {
    setAnswers(prev => ({ ...prev, [qId]: text }))
  }

  const buildPayload = () => {
    if (!quiz) return { answers: [] }
    return {
      answers: quiz.questions.map(q => {
        const val = answers[q.id]
        const base = { questionId: q.id }
        switch (q.questionType) {
          case 'SINGLE_CHOICE':
          case 'TRUE_FALSE':
            return { ...base, selectedAnswerId: val || null }
          case 'MULTIPLE_CHOICE':
            return { ...base, selectedAnswerIds: val || [] }
          case 'FILL_BLANK':
          case 'SHORT_ANSWER':
          default:
            return { ...base, textResponse: val || '' }
        }
      })
    }
  }

  const handleFinalSubmit = async () => {
    if (submitting) return
    clearInterval(timerRef.current)
    setSubmitting(true)
    try {
      await courseService.submitQuizAttempt(attempt.id, buildPayload())
      navigate(`/groups/${groupId}/courses/${courseId}/quiz/attempts/${attempt.id}/result`)
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi nộp bài')
      setSubmitting(false)
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (error) return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 4 }}>
      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      <Button variant="outlined" onClick={() => navigate(-1)}>Quay lại</Button>
    </Box>
  )
  if (!quiz || !quiz.questions || quiz.questions.length === 0)
    return <Alert severity="warning">Bài kiểm tra này chưa có câu hỏi nào.</Alert>

  const currentQ = quiz.questions[currentQIdx]
  const progress = ((currentQIdx + 1) / quiz.questions.length) * 100
  const answeredCount = Object.keys(answers).filter(k => {
    const v = answers[k]; return v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  }).length

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2, position: 'sticky', top: 16, zIndex: 10, bgcolor: 'background.paper' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>{quiz.title}</Typography>
          <Typography variant="caption" color="text.secondary">
            Câu {currentQIdx + 1} / {quiz.questions.length} &nbsp;•&nbsp; Đã trả lời: {answeredCount}/{quiz.questions.length}
          </Typography>
        </Box>
        {timeLeft !== null && (
          <Chip
            icon={<TimerIcon />}
            label={formatTime(timeLeft)}
            color={timeLeft < 60 ? 'error' : 'primary'}
            variant={timeLeft < 60 ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700, fontSize: '1.1rem', px: 1 }}
          />
        )}
      </Paper>

      <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, borderRadius: 1, height: 8 }} />

      {/* Question Navigator (mini dots) */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {quiz.questions.map((q, i) => {
          const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '' &&
            (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : true)
          return (
            <Button
              key={q.id}
              size="small"
              variant={i === currentQIdx ? 'contained' : 'outlined'}
              color={isAnswered ? 'success' : 'primary'}
              onClick={() => setCurrentQIdx(i)}
              sx={{ minWidth: 36, px: 0, py: 0.5, fontSize: '0.75rem' }}
            >
              {i + 1}
            </Button>
          )
        })}
      </Box>

      {/* Question Area */}
      <Paper sx={{ p: 4, borderRadius: 2, minHeight: 280 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip label={currentQ.questionType.replace('_', ' ')} size="small" />
          <Typography variant="caption" color="text.secondary">{currentQ.points} điểm</Typography>
        </Box>
        <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>{currentQ.content}</Typography>
        <Divider sx={{ my: 2 }} />

        {/* SINGLE_CHOICE / TRUE_FALSE */}
        {(currentQ.questionType === 'SINGLE_CHOICE' || currentQ.questionType === 'TRUE_FALSE') && (
          <RadioGroup
            value={answers[currentQ.id] || ''}
            onChange={(e) => handleSingleAnswer(currentQ.id, e.target.value)}
          >
            {currentQ.answers.map((a) => (
              <FormControlLabel
                key={a.id}
                value={a.id}
                control={<Radio />}
                label={a.content}
                sx={{
                  mb: 1, px: 2, py: 0.5, borderRadius: 2, border: '1px solid',
                  borderColor: answers[currentQ.id] === a.id ? 'primary.main' : 'divider',
                  bgcolor: answers[currentQ.id] === a.id ? 'primary.50' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              />
            ))}
          </RadioGroup>
        )}

        {/* MULTIPLE_CHOICE */}
        {currentQ.questionType === 'MULTIPLE_CHOICE' && (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {currentQ.answers.map((a) => {
              const selected = (answers[currentQ.id] || []).includes(a.id)
              return (
                <FormControlLabel
                  key={a.id}
                  control={
                    <Checkbox
                      checked={selected}
                      onChange={(e) => handleMultiAnswer(currentQ.id, a.id, e.target.checked)}
                    />
                  }
                  label={a.content}
                  sx={{
                    mb: 1, px: 2, py: 0.5, borderRadius: 2, border: '1px solid',
                    borderColor: selected ? 'primary.main' : 'divider',
                    bgcolor: selected ? 'primary.50' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                />
              )
            })}
          </Box>
        )}

        {/* FILL_BLANK / SHORT_ANSWER */}
        {(currentQ.questionType === 'FILL_BLANK' || currentQ.questionType === 'SHORT_ANSWER') && (
          <TextField
            fullWidth
            multiline={currentQ.questionType === 'SHORT_ANSWER'}
            rows={currentQ.questionType === 'SHORT_ANSWER' ? 4 : 1}
            variant="outlined"
            placeholder={currentQ.questionType === 'FILL_BLANK' ? 'Điền vào chỗ trống...' : 'Viết câu trả lời của bạn...'}
            value={answers[currentQ.id] || ''}
            onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
            sx={{ mt: 1 }}
          />
        )}
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          startIcon={<NavigateBefore />}
          disabled={currentQIdx === 0}
          onClick={() => setCurrentQIdx(p => p - 1)}
        >
          Câu trước
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<SendIcon />}
          onClick={() => setIsConfirmOpen(true)}
        >
          Nộp bài ({answeredCount}/{quiz.questions.length})
        </Button>
        {currentQIdx < quiz.questions.length - 1 ? (
          <Button
            endIcon={<NavigateNext />}
            variant="contained"
            onClick={() => setCurrentQIdx(p => p + 1)}
          >
            Câu tiếp theo
          </Button>
        ) : (
          <Button
            endIcon={<CheckIcon />}
            variant="contained"
            color="success"
            onClick={() => setIsConfirmOpen(true)}
          >
            Hoàn tất & Nộp
          </Button>
        )}
      </Box>

      {/* Confirm Dialog */}
      <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
        <DialogTitle>Xác nhận nộp bài</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Bạn đã trả lời <strong>{answeredCount}/{quiz.questions.length}</strong> câu.
          </Typography>
          {answeredCount < quiz.questions.length && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Còn {quiz.questions.length - answeredCount} câu chưa được trả lời. Sau khi nộp bạn không thể chỉnh sửa.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmOpen(false)}>Quay lại làm tiếp</Button>
          <Button onClick={handleFinalSubmit} variant="contained" color="success" disabled={submitting}>
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Xác nhận nộp bài'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QuizPlayer
