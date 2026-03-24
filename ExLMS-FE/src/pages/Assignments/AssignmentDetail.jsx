import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Divider, Alert,
  Chip, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Tooltip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Timeline as DueIcon,
  EmojiEvents as TrophyIcon,
  Edit as GradeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon,
  FilePresent as FileIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import assignmentService from '../../services/assignmentService';
import groupService from '../../services/groupService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import CKEditorWrapper from '../../components/Common/CKEditorWrapper';

const AssignmentDetail = () => {
  const { groupId, id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Submission state
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState(null); // ID of submission being edited

  // Grading state
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ score: 0, feedback: '', status: 'GRADED' });
  const [grading, setGrading] = useState(false);
  
  // Confirm Dialog state
  const [confirmCancel, setConfirmCancel] = useState(null); // ID of submission to cancel

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [asgnData, groupData] = await Promise.all([
          assignmentService.getAssignmentById(id),
          groupService.getGroupById(groupId)
        ]);

        setAssignment(asgnData);

        // Check role
        const currentUserRole = groupData?.currentUserRole;
        const instructorRoles = ['OWNER', 'EDITOR'];
        const isInstr = instructorRoles.includes(currentUserRole);
        setIsInstructor(isInstr);

        if (isInstr) {
          const subs = await assignmentService.getAllSubmissions(id);
          setSubmissions(subs);
        } else {
          const mySubs = await assignmentService.getMySubmissions(id);
          setMySubmissions(mySubs);
        }
      } catch (err) {
        setError('Không thể tải chi tiết bài tập');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, groupId, user?.id]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('request', new Blob([JSON.stringify({
        submissionType: assignment.submissionType === 'MIXED' ? (selectedFile ? 'FILE' : 'TEXT') : assignment.submissionType,
        textContent: submissionText
      })], { type: 'application/json' }));

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      if (editingSubmission) {
        await assignmentService.updateSubmission(editingSubmission, formData);
        alert('Cập nhật bài nộp thành công!');
      } else {
        await assignmentService.submitAssignment(id, formData);
        alert('Nộp bài thành công!');
      }

      // Refresh my submissions
      const mySubs = await assignmentService.getMySubmissions(id);
      setMySubmissions(mySubs);
      setSubmissionText('');
      setSelectedFile(null);
      setEditingSubmission(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi nộp bài');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmission = async () => {
    if (!confirmCancel) return;
    try {
      await assignmentService.deleteSubmission(confirmCancel);
      const mySubs = await assignmentService.getMySubmissions(id);
      setMySubmissions(mySubs);
      alert('Đã hủy nộp bài!');
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy bài nộp');
    } finally {
      setConfirmCancel(null);
    }
  };

  const startEditSubmission = (sub) => {
    setEditingSubmission(sub.id);
    setSubmissionText(sub.textContent || '');
    // Note: We can't really "edit" a file easily by showing it in the input, 
    // but the student can upload a new one to replace it.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGrade = async () => {
    setGrading(true);
    try {
      await assignmentService.gradeSubmission(gradingSubmission.id, gradeData);
      // Refresh submissions
      const subs = await assignmentService.getAllSubmissions(id);
      setSubmissions(subs);
      setGradingSubmission(null);
      alert('Đã lưu điểm thành công!');
    } catch (err) {
      alert('Lỗi khi chấm điểm');
    } finally {
      setGrading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await assignmentService.exportGrades(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Grades_${assignment.title}.xlsx`;
      a.click();
    } catch (err) {
      alert('Lỗi khi xuất tệp Excel');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  if (!assignment) return <Alert severity="warning" sx={{ m: 4 }}>Không tìm thấy thông tin bài tập</Alert>;

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        {/* Left Side: Assignment Info */}
        <Grid item xs={12} md={isInstructor ? 12 : 8}>
          <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>{assignment.title}</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip
                    icon={<DueIcon />}
                    label={`Hạn nộp: ${format(new Date(assignment.dueAt), 'HH:mm dd/MM/yyyy', { locale: vi })}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    icon={<TrophyIcon />}
                    label={`Điểm tối đa: ${assignment.maxScore}`}
                    color="secondary"
                  />
                  {assignment.allowLate && (
                    <Chip label={`Cho phép nộp muộn (Trừ ${assignment.latePenaltyPercent}%)`} color="warning" size="small" />
                  )}
                </Box>
              </Box>
              {isInstructor && (
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
                  Xuất Excel
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom>Hướng dẫn</Typography>
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}
              dangerouslySetInnerHTML={{ __html: assignment.description }}
            />
          </Paper>

          {/* Instructor View: List of Submissions */}
          {isInstructor && (
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>Danh sách nộp bài</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sinh viên</TableCell>
                      <TableCell>Thời gian nộp</TableCell>
                      <TableCell>Lần nộp</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Điểm</TableCell>
                      <TableCell>Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{sub.studentName}</Typography>
                          <Typography variant="caption" color="textSecondary">{sub.studentEmail}</Typography>
                        </TableCell>
                        <TableCell>
                          {format(new Date(sub.submittedAt), 'HH:mm dd/MM/yyyy')}
                          {sub.isLate && <Chip label="Muộn" color="error" size="small" sx={{ ml: 1 }} />}
                        </TableCell>
                        <TableCell>Lần {sub.attemptNumber}</TableCell>
                        <TableCell>
                          <Chip
                            label={sub.gradeStatus === 'GRADED' ? 'Đã chấm' : 'Chờ chấm'}
                            color={sub.gradeStatus === 'GRADED' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {sub.score !== null && sub.score !== undefined ? `${sub.score}/${assignment.maxScore}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Chấm điểm">
                            <IconButton color="primary" onClick={() => {
                              setGradingSubmission(sub);
                              setGradeData({
                                score: sub.score || 0,
                                feedback: sub.feedback || '',
                                status: 'GRADED'
                              });
                            }}>
                              <GradeIcon />
                            </IconButton>
                          </Tooltip>
                          {sub.fileUrl && (
                            <Tooltip title="Tải tệp nộp">
                              <IconButton color="secondary" component="a" href={sub.fileUrl} download>
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Grid>

        {/* Right Side: Student Submission Form & History */}
        {!isInstructor && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Nộp bài của bạn</Typography>
              <Divider sx={{ mb: 2 }} />

              <Box component="form" onSubmit={handleSubmission}>
                {(assignment.submissionType === 'TEXT' || assignment.submissionType === 'MIXED') && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Nội dung văn bản</Typography>
                    <CKEditorWrapper
                      value={submissionText}
                      onChange={setSubmissionText}
                      placeholder="Nhập câu trả lời của bạn..."
                      minHeight="200px"
                    />
                  </Box>
                )}

                {(assignment.submissionType === 'FILE' || assignment.submissionType === 'MIXED') && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>Tệp đính kèm ({assignment.allowedFileTypes})</Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<UploadIcon />}
                      sx={{ py: 2, borderStyle: 'dashed' }}
                    >
                      {selectedFile ? selectedFile.name : 'Chọn tệp nộp'}
                      <input type="file" hidden onChange={handleFileChange} accept={assignment.allowedFileTypes} />
                    </Button>
                    {selectedFile && (
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Dung lượng: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    )}
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={submitting || (assignment.submissionType === 'FILE' && !selectedFile && !editingSubmission)}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                >
                  {submitting ? 'Đang nộp...' : (editingSubmission ? 'Cập nhật bài nộp' : 'Bắt đầu nộp bài')}
                </Button>
                {editingSubmission && (
                  <Button 
                    fullWidth 
                    sx={{ mt: 1 }} 
                    onClick={() => {
                      setEditingSubmission(null);
                      setSubmissionText('');
                      setSelectedFile(null);
                    }}
                  >
                    Hủy sửa
                  </Button>
                )}
              </Box>
            </Paper>

            <Typography variant="h6" fontWeight="bold" gutterBottom>Lịch sử nộp bài</Typography>
            {mySubmissions.map((sub, idx) => (
              <Paper key={sub.id} sx={{ p: 2, borderRadius: 2, mb: 2, borderLeft: '4px solid', borderColor: sub.gradeStatus === 'GRADED' ? 'success.main' : 'warning.main' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Lần nộp {sub.attemptNumber}</Typography>
                  <Typography variant="caption" color="textSecondary">{format(new Date(sub.submittedAt), 'HH:mm dd/MM/yyyy')}</Typography>
                </Box>
                {sub.isLate && <Chip label="Nộp muộn" color="error" size="small" sx={{ mb: 1 }} />}
                {sub.gradeStatus === 'GRADED' ? (
                  <Box sx={{ mt: 1, p: 1, bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 1 }}>
                    <Typography variant="subtitle2">Điểm: {sub.score}/{assignment.maxScore}</Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>Góp ý: {sub.feedback}</Typography>
                  </Box>
                ) : (
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="textSecondary italic">Đang chờ chấm điểm...</Typography>
                      <Box>
                        <Button size="small" onClick={() => startEditSubmission(sub)}>Sửa</Button>
                        <Button size="small" color="error" onClick={() => setConfirmCancel(sub.id)}>Hủy</Button>
                      </Box>
                    </Box>
                  )}

                  {/* Added submission content preview for student */}
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                    {sub.textContent && (
                      <Box 
                        sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: sub.fileUrl ? 1 : 0 }} 
                        dangerouslySetInnerHTML={{ __html: sub.textContent }} 
                      />
                    )}
                    {sub.fileUrl && (
                      <Button 
                        startIcon={<FileIcon />} 
                        size="small" 
                        component="a" 
                        href={sub.fileUrl} 
                        download={sub.fileName}
                        target="_blank"
                      >
                        {sub.fileName}
                      </Button>
                    )}
                  </Box>
              </Paper>
            ))}
          </Grid>
        )}
      </Grid>

      {/* Grading Dialog */}
      <Dialog open={!!gradingSubmission} onClose={() => setGradingSubmission(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Chấm điểm bài nộp</DialogTitle>
        <DialogContent dividers>
          {gradingSubmission && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">{gradingSubmission.studentName}</Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>Lần nộp: {gradingSubmission.attemptNumber} | {gradingSubmission.isLate ? 'NỘP MUỘN' : 'Đúng hạn'}</Typography>

              <Box sx={{ my: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Nội dung sinh viên nộp:</Typography>
                {gradingSubmission.textContent && (
                  <Box 
                    sx={{ mb: 2, color: 'text.primary' }} 
                    dangerouslySetInnerHTML={{ __html: gradingSubmission.textContent }} 
                  />
                )}
                {gradingSubmission.fileName && (
                  <Button 
                    startIcon={<FileIcon />} 
                    color="primary" 
                    component="a" 
                    href={gradingSubmission.fileUrl} 
                    download={gradingSubmission.fileName}
                    target="_blank"
                  >
                    {gradingSubmission.fileName}
                  </Button>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Điểm"
                    type="number"
                    fullWidth
                    value={gradeData.score}
                    onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                    InputProps={{ endAdornment: <Typography variant="body2">/{assignment.maxScore}</Typography> }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Nhận xét / Góp ý"
                    fullWidth
                    multiline
                    rows={4}
                    value={gradeData.feedback}
                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setGradingSubmission(null)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleGrade}
            disabled={grading}
            startIcon={grading && <CircularProgress size={20} />}
          >
            Lưu điểm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Deletion Dialog */}
      <Dialog open={!!confirmCancel} onClose={() => setConfirmCancel(null)}>
        <DialogTitle>Xác nhận hủy nộp bài</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn hủy bài nộp này? Hành động này không thể hoàn tác.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancel(null)}>Đóng</Button>
          <Button variant="contained" color="error" onClick={handleCancelSubmission}>Xác nhận hủy</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentDetail;
