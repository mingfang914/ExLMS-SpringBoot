import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, TextField, Button, Paper, Select, MenuItem,
  FormControl, InputLabel, Accordion, AccordionSummary, AccordionDetails,
  IconButton, Chip, Divider, Alert, CircularProgress, Snackbar
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon, Add as AddIcon, Delete as DeleteIcon,
  DragIndicator as DragIcon, Save as SaveIcon, VideoLibrary as VideoIcon,
  Description as DocIcon, AttachFile as FileIcon, Code as EmbedIcon,
  Quiz as QuizIcon, Edit as EditIcon, BarChart as BarChartIcon
} from '@mui/icons-material'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import courseService from '../../services/courseService'

const CONTENT_TYPES = [
  { value: 'DOCUMENT', label: 'Nội dung bài học', icon: <DocIcon /> },
]

// Custom Upload Adapter for CKEditor
class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }
  upload() {
    return this.loader.file.then(file => new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('upload', file);
      const token = localStorage.getItem('token');
      fetch('/api/cke/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
        .then(res => res.json())
        .then(res => {
          if (res.uploaded) resolve({ default: res.url });
          else reject(res.error?.message || 'Upload failed');
        })
        .catch(err => reject(err));
    }));
  }
  abort() { }
} function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}

const CKEditorWrapper = ({ value, onChange, lessonId }) => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let editorInstance = null;
    let isMounted = true;
    const initEditor = async () => {
      if (!containerRef.current || editorRef.current) return;

      console.log(`[CKEditor] Initializing for lesson ${lessonId}...`);

      // Wait for script if needed
      if (!window.ClassicEditor) {
        console.warn(`[CKEditor] ClassicEditor global not found, waiting...`);
        let attempts = 0;
        while (!window.ClassicEditor && attempts < 100) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }
      }

      if (!isMounted) return;

      if (window.ClassicEditor && containerRef.current) {
        console.log(`[CKEditor] Script found, creating editor instance...`);
        try {
          editorInstance = await window.ClassicEditor.create(containerRef.current, {
            extraPlugins: [MyCustomUploadAdapterPlugin],
            placeholder: 'Nhập nội dung bài học (Hỗ trợ định dạng, Video, Ảnh)...',
          });

          if (!isMounted) {
            editorInstance.destroy();
            return;
          }

          editorRef.current = editorInstance;
          editorInstance.setData(value || '');
          setIsReady(true);

          editorInstance.model.document.on('change:data', () => {
            const data = editorInstance.getData();
            onChange(data);
          });
          console.log(`[CKEditor] Lesson ${lessonId} initialized successfully.`);
        } catch (err) {
          console.error(`[CKEditor] Lesson ${lessonId} initialization failed:`, err);
        }
      } else {
        console.error(`[CKEditor] Failed to find ClassicEditor global after waiting.`);
      }
    };

    initEditor();

    return () => {

      isMounted = false;
      if (editorRef.current) {
        console.log(`[CKEditor] Destroying editor for lesson ${lessonId}`);
        editorRef.current.destroy()
          .then(() => {
            editorRef.current = null;
          })
          .catch(err => console.error('Error destroying editor:', err));
      }
    };
  }, [lessonId]); // Re-run if lessonId changes

  return (
    <Box sx={{
      mt: 1,
      minHeight: '300px',
      border: isReady ? 'none' : '1px dashed #ccc',
      borderRadius: 1,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {!isReady && (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          <CircularProgress size={24} sx={{ mb: 1 }} /><br />
          Đang tải bộ soạn thảo...
        </Box>
      )}
      <Box sx={{ '& .ck-editor__editable': { minHeight: '300px' } }}>
        <div ref={containerRef} />
      </Box>
    </Box>
  );
};

const CourseEditor = () => {
  const { groupId, courseId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(courseId)

  const [course, setCourse] = useState({ title: '', description: '', status: 'DRAFT', startDate: '', endDate: '' })
  const [chapters, setChapters] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' })
  const [expandedChapter, setExpandedChapter] = useState(null)

  useEffect(() => {
    if (isEdit) {
      const load = async () => {
        try {
          const data = await courseService.getCourseById(groupId, courseId)
          setCourse({
            title: data.title,
            description: data.description || '',
            status: data.status,
            startDate: data.startDate ? data.startDate.split('T')[0] : '',
            endDate: data.endDate ? data.endDate.split('T')[0] : ''
          })
          const [chapterList, quizList] = await Promise.all([
            courseService.getChapters(courseId),
            courseService.getQuizzesByCourseId(courseId)
          ])
          
          setQuizzes(quizList)

          const chapterWithLessons = await Promise.all(
            chapterList.map(async (ch) => ({
              ...ch,
              lessons: await courseService.getLessons(ch.id).catch(() => [])
            }))
          )
          setChapters(chapterWithLessons)
        } finally {
          setLoading(false)
        }
      }
      load()
    }
  }, [courseId, groupId, isEdit])

  const showSnack = (msg, severity = 'success') =>
    setSnackbar({ open: true, msg, severity })

  // ──────────── Course ────────────
  const handleSaveCourse = async () => {
    setSaving(true)
    try {
      let savedCourse
      if (isEdit) {
        savedCourse = await courseService.updateCourse(groupId, courseId, course)
      } else {
        savedCourse = await courseService.createCourse(groupId, course)
        navigate(`/groups/${groupId}/courses/${savedCourse.id}/edit`, { replace: true })
      }
      showSnack('Đã lưu khóa học!')
    } catch (e) {
      showSnack(e.response?.data?.message || 'Lỗi lưu khóa học', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ──────────── Chapters ────────────
  const handleAddChapter = async () => {
    if (!courseId) { showSnack('Vui lòng lưu khóa học trước!', 'warning'); return }
    try {
      const ch = await courseService.createChapter(courseId, { title: 'Chương mới', description: '' })
      setChapters(prev => [...prev, { ...ch, lessons: [] }])
      setExpandedChapter(ch.id)
    } catch (e) {
      showSnack('Lỗi tạo chương', 'error')
    }
  }

  const handleDeleteChapter = async (chapterId) => {
    try {
      await courseService.deleteChapter(courseId, chapterId)
      setChapters(prev => prev.filter(c => c.id !== chapterId))
      showSnack('Đã xóa chương!')
    } catch (e) {
      showSnack('Lỗi xóa chương', 'error')
    }
  }

  const handleSaveChapter = async (ch) => {
    try {
      await courseService.updateChapter(courseId, ch.id, { title: ch.title, description: ch.description })
      showSnack('Đã lưu chương!')
    } catch (e) {
      showSnack('Lỗi lưu chương', 'error')
    }
  }

  const updateChapterField = (chapterId, field, value) =>
    setChapters(prev => prev.map(c => c.id === chapterId ? { ...c, [field]: value } : c))

  // ──────────── Lessons ────────────
  const handleAddLesson = async (chapterId) => {
    try {
      const lesson = await courseService.createLesson(chapterId, {
        title: 'Bài học mới',
        contentType: 'DOCUMENT',
        content: '',
      })
      setChapters(prev => prev.map(c =>
        c.id === chapterId ? { ...c, lessons: [...(c.lessons || []), lesson] } : c))
    } catch (e) {
      showSnack('Lỗi tạo bài học', 'error')
    }
  }

  const handleDeleteLesson = async (chapterId, lessonId) => {
    try {
      await courseService.deleteLesson(chapterId, lessonId)
      setChapters(prev => prev.map(c =>
        c.id === chapterId ? { ...c, lessons: c.lessons.filter(l => l.id !== lessonId) } : c))
      showSnack('Đã xóa bài học!')
    } catch (e) {
      showSnack('Lỗi xóa bài học', 'error')
    }
  }

  const handleSaveLesson = async (chapterId, lesson) => {
    try {
      await courseService.updateLesson(chapterId, lesson.id, {
        title: lesson.title,
        content: lesson.content,
        contentType: 'DOCUMENT',
      })
      showSnack('Bài học đã được lưu!')
    } catch (e) {
      showSnack('Lỗi lưu bài học', 'error')
    }
  }

  const updateLessonField = (chapterId, lessonId, field, value) =>
    setChapters(prev => prev.map(c =>
      c.id === chapterId
        ? {
          ...c, lessons: c.lessons.map(l =>
            l.id === lessonId ? { ...l, [field]: value } : l)
        } : c))

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        {isEdit ? '✏️ Chỉnh sửa khóa học' : '➕ Tạo khóa học mới'}
      </Typography>

      {/* ── Course Info ── */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Thông tin khóa học</Typography>
        <TextField
          label="Tên khóa học *" fullWidth sx={{ mb: 2 }}
          value={course.title}
          onChange={e => setCourse(p => ({ ...p, title: e.target.value }))}
        />
        <TextField
          label="Mô tả" fullWidth multiline rows={3} sx={{ mb: 2 }}
          value={course.description}
          onChange={e => setCourse(p => ({ ...p, description: e.target.value }))}
        />
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Ngày bắt đầu" type="date" sx={{ flex: 1 }}
            InputLabelProps={{ shrink: true }}
            value={course.startDate}
            onChange={e => setCourse(p => ({ ...p, startDate: e.target.value }))}
          />
          <TextField
            label="Ngày kết thúc" type="date" sx={{ flex: 1 }}
            InputLabelProps={{ shrink: true }}
            value={course.endDate}
            onChange={e => setCourse(p => ({ ...p, endDate: e.target.value }))}
          />
        </Box>
        <FormControl sx={{ minWidth: 180, mr: 2 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select value={course.status} label="Trạng thái"
            onChange={e => setCourse(p => ({ ...p, status: e.target.value }))}>
            <MenuItem value="DRAFT">📝 Nháp</MenuItem>
            <MenuItem value="PUBLISHED">🌐 Công khai</MenuItem>
            <MenuItem value="ARCHIVED">📦 Lưu trữ</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveCourse} disabled={saving}>
          {saving ? <CircularProgress size={20} color="inherit" /> : 'Lưu khóa học'}
        </Button>
      </Paper>

      {/* ── Chapters ── */}
      {isEdit && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Danh sách chương ({chapters.length})</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" component={RouterLink} to={`/groups/${groupId}/courses/${courseId}/quiz/create`}>
                Tạo Bài Kiểm Tra
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddChapter}>
                Thêm chương
              </Button>
            </Box>
          </Box>

          {chapters.map((ch, idx) => (
            <Accordion key={ch.id} expanded={expandedChapter === ch.id}
              onChange={(_, exp) => setExpandedChapter(exp ? ch.id : null)}
              sx={{ mb: 1, borderRadius: 2, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography fontWeight={600}>
                  Chương {idx + 1}: {ch.title}
                </Typography>
                <Chip label={`${ch.lessons?.length || 0} bài`} size="small" sx={{ ml: 2 }} />
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField label="Tên chương" size="small" sx={{ flex: 1 }}
                    value={ch.title}
                    onChange={e => updateChapterField(ch.id, 'title', e.target.value)} />
                  <Button size="small" onClick={() => handleSaveChapter(ch)}>Lưu</Button>
                  <IconButton color="error" onClick={() => handleDeleteChapter(ch.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Bài học trong chương</Typography>

                {(ch.lessons || []).map((lesson, lIdx) => (
                  <Paper key={lesson.id} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                      <TextField label="Tên bài học" size="small" sx={{ flex: 1 }}
                        value={lesson.title}
                        onChange={e => updateLessonField(ch.id, lesson.id, 'title', e.target.value)} />
                      <Button size="small" onClick={() => handleSaveLesson(ch.id, lesson)}>Lưu</Button>
                      <IconButton color="error" size="small" onClick={() => handleDeleteLesson(ch.id, lesson.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Unified CKEditor for all content */}
                    <CKEditorWrapper
                      lessonId={lesson.id}
                      value={lesson.content}
                      onChange={val => updateLessonField(ch.id, lesson.id, 'content', val)}
                    />

                  </Paper>
                ))}

                <Button size="small" startIcon={<AddIcon />} onClick={() => handleAddLesson(ch.id)}
                  sx={{ mt: 1 }}>
                  Thêm bài học
                </Button>
              </AccordionDetails>
            </Accordion>
          ))}

          {/* Intermingle Quizzes and Chapters? 
              Assuming for now we list Chapters then Quizzes that are 'đồng cấp' (chapterId is null)
          */}
          {quizzes.filter(q => !q.chapterId).map((q, qIdx) => (
            <Paper key={q.id} sx={{ p: 2, mb: 1, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <QuizIcon color="primary" />
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>Bài kiểm tra: {q.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {q.timeLimitSec ? `${q.timeLimitSec} giây` : 'Không giới hạn thời gian'} • {q.maxAttempts} lần làm
                </Typography>
              </Box>
              <IconButton component={RouterLink} to={`/groups/${groupId}/courses/${courseId}/quiz/${q.id}/stats`} title="Thống kê">
                <BarChartIcon fontSize="small" color="primary" />
              </IconButton>
              <IconButton component={RouterLink} to={`/groups/${groupId}/courses/${courseId}/quiz/${q.id}/edit`} title="Chỉnh sửa">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton color="error" title="Xóa">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))}

          {chapters.length === 0 && quizzes.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              Chưa có nội dung nào. Hãy bắt đầu bằng cách thêm chương hoặc bài kiểm tra đầu tiên!
            </Paper>
          )}
        </>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.msg}</Alert>
      </Snackbar>
    </Box>
  )
}

export default CourseEditor
