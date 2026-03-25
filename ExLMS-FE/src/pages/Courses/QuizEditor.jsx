import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, TextField, Select, MenuItem, FormControl, InputLabel,
  Button, IconButton, Switch, FormControlLabel, Chip, Divider, Accordion,
  AccordionSummary, AccordionDetails, Alert, Snackbar, CircularProgress
} from '@mui/material'
import {
  Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon,
  ExpandMore as ExpandMoreIcon, RadioButtonChecked, CheckBox as CheckBoxIcon,
  ShortText as ShortTextIcon
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import courseService from '../../services/courseService'

const QUESTION_TYPES = [
  { value: 'SINGLE_CHOICE', label: 'Trắc nghiệm 1 đáp án', icon: <RadioButtonChecked /> },
  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm nhiều đáp án', icon: <CheckBoxIcon /> },
  { value: 'TRUE_FALSE', label: 'Đúng / Sai', icon: '✓/✗' },
  { value: 'FILL_BLANK', label: 'Điền vào chỗ trống', icon: '___' },
  { value: 'SHORT_ANSWER', label: 'Tự luận ngắn', icon: <ShortTextIcon /> },
]

const emptyAnswer = () => ({ content: '', isCorrect: false, orderIndex: 0 })
const emptyQuestion = () => ({
  content: '', questionType: 'SINGLE_CHOICE', points: 1, explanation: '',
  answers: [emptyAnswer(), emptyAnswer()]
})

const QuizEditor = () => {
  const { groupId, courseId, quizId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(quizId)

  const [quiz, setQuiz] = useState({
    title: '', description: '',
    timeLimitSec: null, maxAttempts: 1, passingScore: 50,
    shuffleQuestions: false, resultVisibility: 'IMMEDIATE',
  })
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' })

  useEffect(() => {
    if (isEdit) {
      const loadQuiz = async () => {
        try {
          const data = await courseService.getQuizById(quizId)
          setQuiz({
            title: data.title,
            description: data.description || '',
            timeLimitSec: data.timeLimitSec,
            maxAttempts: data.maxAttempts,
            passingScore: data.passingScore,
            shuffleQuestions: data.shuffleQuestions,
            resultVisibility: data.resultVisibility,
            chapterId: data.chapterId
          })
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions.map(q => ({
              ...q,
              answers: q.answers.map(a => ({ ...a, isCorrect: a.correct }))
            })))
          }
        } catch (e) {
          showSnack('Lỗi tải dữ liệu bài kiểm tra', 'error')
        } finally {
          setLoading(false)
        }
      }
      loadQuiz()
    }
  }, [quizId, isEdit])

  const showSnack = (msg, severity = 'success') => setSnackbar({ open: true, msg, severity })

  // ── Quiz config ──
  const updateQuiz = (field, value) => setQuiz(p => ({ ...p, [field]: value }))

  // ── Questions ──
  const addQuestion = () => setQuestions(p => [...p, emptyQuestion()])

  const updateQuestion = (qIdx, field, value) =>
    setQuestions(p => p.map((q, i) => i === qIdx ? { ...q, [field]: value } : q))

  const deleteQuestion = (qIdx) =>
    setQuestions(p => p.filter((_, i) => i !== qIdx))

  // ── Answers ──
  const addAnswer = (qIdx) =>
    setQuestions(p => p.map((q, i) => i === qIdx ? { ...q, answers: [...q.answers, emptyAnswer()] } : q))

  const updateAnswer = (qIdx, aIdx, field, value) =>
    setQuestions(p => p.map((q, i) => i === qIdx
      ? { ...q, answers: q.answers.map((a, j) => j === aIdx ? { ...a, [field]: value } : a) }
      : q))

  const deleteAnswer = (qIdx, aIdx) =>
    setQuestions(p => p.map((q, i) => i === qIdx
      ? { ...q, answers: q.answers.filter((_, j) => j !== aIdx) }
      : q))

  const setCorrectAnswer = (qIdx, aIdx, single) =>
    setQuestions(p => p.map((q, i) => i === qIdx ? {
      ...q,
      answers: q.answers.map((a, j) => ({
        ...a,
        isCorrect: single ? j === aIdx : (j === aIdx ? !a.isCorrect : a.isCorrect)
      }))
    } : q))

  // ── Submit ──
  const handleSave = async () => {
    if (!quiz.title.trim()) { showSnack('Vui lòng nhập tên bài kiểm tra', 'error'); return }
    setSaving(true)
    try {
      const payload = {
        ...quiz,
        timeLimitSec: quiz.timeLimitSec ? parseInt(quiz.timeLimitSec) : null,
        questions: questions.map((q, i) => ({
          content: q.content,
          questionType: q.questionType,
          points: q.points || 1,
          explanation: q.explanation,
          orderIndex: i,
          answers: q.answers.map((a, j) => ({ content: a.content, correct: a.isCorrect, orderIndex: j }))
        }))
      }
      if (isEdit) {
        await courseService.updateQuiz(quizId, payload)
        showSnack('Cập nhật bài kiểm tra thành công!')
      } else {
        await courseService.createQuiz(courseId, payload)
        showSnack('Tạo bài kiểm tra thành công!')
      }
      setTimeout(() => navigate(-1), 1000)
    } catch (e) {
      showSnack(e.response?.data?.message || `Lỗi ${isEdit ? 'cập nhật' : 'tạo'} bài kiểm tra`, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        {isEdit ? '✏️ Chỉnh sửa bài kiểm tra' : '📝 Tạo bài kiểm tra'}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* ── Quiz Config ── */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Cấu hình bài kiểm tra</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Tên bài kiểm tra *" fullWidth value={quiz.title}
            onChange={e => updateQuiz('title', e.target.value)} />
          <TextField label="Mô tả" fullWidth multiline rows={2} value={quiz.description}
            onChange={e => updateQuiz('description', e.target.value)} />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField label="Thời gian làm bài (giây, bỏ trống = không giới hạn)"
              type="number" sx={{ flex: 1, minWidth: 240 }}
              inputProps={{ min: 0 }}
              value={quiz.timeLimitSec || ''}
              onChange={e => updateQuiz('timeLimitSec', e.target.value || null)} />
            <TextField label="Số lần làm lại tối đa" type="number" sx={{ width: 180 }}
              inputProps={{ min: 1 }}
              value={quiz.maxAttempts}
              onChange={e => updateQuiz('maxAttempts', Math.max(1, parseInt(e.target.value) || 1))} />
            <TextField label="Điểm qua môn (%)" type="number" sx={{ width: 150 }}
              inputProps={{ min: 0, max: 100 }}
              value={quiz.passingScore}
              onChange={e => updateQuiz('passingScore', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControlLabel
              control={<Switch checked={quiz.shuffleQuestions}
                onChange={e => updateQuiz('shuffleQuestions', e.target.checked)} />}
              label="Xáo trộn thứ tự câu hỏi"
            />
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Hiển thị kết quả</InputLabel>
              <Select value={quiz.resultVisibility} label="Hiển thị kết quả"
                onChange={e => updateQuiz('resultVisibility', e.target.value)}>
                <MenuItem value="IMMEDIATE">Ngay sau khi nộp</MenuItem>
                <MenuItem value="AFTER_DEADLINE">Sau hạn chót</MenuItem>
                <MenuItem value="MANUAL">Thủ công (GV mở)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* ── Questions ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Danh sách câu hỏi ({questions.length})</Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addQuestion}>
          Thêm câu hỏi
        </Button>
      </Box>

      {questions.map((q, qIdx) => (
        <Accordion key={qIdx} defaultExpanded sx={{ mb: 1.5, borderRadius: 2, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Chip label={`Câu ${qIdx + 1}`} size="small" sx={{ mr: 1 }} />
            <Typography noWrap sx={{ flex: 1 }}>{q.content || 'Nhập nội dung câu hỏi...'}</Typography>
            <Chip label={QUESTION_TYPES.find(t => t.value === q.questionType)?.label || q.questionType}
              size="small" color="primary" variant="outlined" sx={{ mr: 1 }} />
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); deleteQuestion(qIdx) }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField label="Nội dung câu hỏi *" fullWidth value={q.content}
                onChange={e => updateQuestion(qIdx, 'content', e.target.value)} />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Loại câu hỏi</InputLabel>
                <Select value={q.questionType} label="Loại câu hỏi"
                  onChange={e => updateQuestion(qIdx, 'questionType', e.target.value)}>
                  {QUESTION_TYPES.map(t => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Điểm" type="number" sx={{ width: 80 }} value={q.points}
                inputProps={{ min: 1 }}
                onChange={e => updateQuestion(qIdx, 'points', Math.max(1, parseInt(e.target.value) || 1))} />
            </Box>

            {/* Answers — only for choice questions */}
            {['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE'].includes(q.questionType) && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Đáp án (chọn đáp án đúng bằng cách click ✓):
                </Typography>
                {(q.questionType === 'TRUE_FALSE'
                  ? [{ content: 'Đúng', isCorrect: q.answers[0]?.isCorrect }, { content: 'Sai', isCorrect: q.answers[1]?.isCorrect }]
                  : q.answers
                ).map((a, aIdx) => (
                  <Box key={aIdx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <Button
                      variant={a.isCorrect ? 'contained' : 'outlined'}
                      color={a.isCorrect ? 'success' : 'inherit'}
                      size="small" sx={{ minWidth: 36 }}
                      onClick={() => setCorrectAnswer(qIdx, aIdx, q.questionType === 'SINGLE_CHOICE')}
                    >✓</Button>
                    <TextField
                      size="small" fullWidth
                      placeholder={`Đáp án ${aIdx + 1}`}
                      value={q.questionType === 'TRUE_FALSE' ? a.content : a.content}
                      disabled={q.questionType === 'TRUE_FALSE'}
                      onChange={e => updateAnswer(qIdx, aIdx, 'content', e.target.value)}
                    />
                    {q.questionType !== 'TRUE_FALSE' && (
                      <IconButton size="small" color="error" onClick={() => deleteAnswer(qIdx, aIdx)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
                {q.questionType !== 'TRUE_FALSE' && (
                  <Button size="small" startIcon={<AddIcon />} onClick={() => addAnswer(qIdx)}>
                    Thêm đáp án
                  </Button>
                )}
              </Box>
            )}

            {q.questionType === 'FILL_BLANK' && (
              <TextField label="Đáp án chuẩn (hệ thống tự so sánh)" fullWidth size="small"
                value={q.answers[0]?.content || ''}
                onChange={e => updateAnswer(qIdx, 0, 'content', e.target.value)}
                placeholder="Nhập đáp án đúng..." />
            )}

            {q.questionType === 'SHORT_ANSWER' && (
              <Alert severity="info">
                Câu tự luận ngắn — giáo viên chấm thủ công. Không cần nhập đáp án mẫu.
              </Alert>
            )}

            {/* Explanation */}
            {q.questionType !== 'SHORT_ANSWER' && (
              <TextField label="Giải thích đáp án (hiển thị sau khi nộp)" fullWidth multiline rows={2}
                sx={{ mt: 2 }} size="small" value={q.explanation}
                onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)} />
            )}
          </AccordionDetails>
        </Accordion>
      ))}

        <Button variant="contained" startIcon={<SaveIcon />} size="large" sx={{ mt: 2 }}
          onClick={handleSave} disabled={saving} fullWidth>
          {saving ? <CircularProgress size={22} color="inherit" /> : (isEdit ? 'Cập nhật bài kiểm tra' : 'Tạo bài kiểm tra')}
        </Button>
      </>)}

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.msg}</Alert>
      </Snackbar>
    </Box>
  )
}

export default QuizEditor
