import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, Grid, 
  MenuItem, Switch, FormControlLabel, Divider, CircularProgress, Alert,
  Container
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import assignmentService from '../../services/assignmentService';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import CKEditorWrapper from '../../components/Common/CKEditorWrapper';

const AssignmentForm = () => {
  const { groupId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxScore: 100,
    assignedAt: new Date().toISOString().slice(0, 16),
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    submissionType: 'FILE',
    allowedFileTypes: '.pdf,.docx,.zip',
    maxFileSizeMb: 50,
    allowLate: false,
    latePenaltyPercent: 0,
    status: 'PUBLISHED'
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const fetchAssignment = async () => {
        try {
          setFetching(true);
          const data = await assignmentService.getAssignmentById(id);
          setFormData({
            ...data,
            assignedAt: new Date(data.assignedAt).toISOString().slice(0, 16),
            dueAt: new Date(data.dueAt).toISOString().slice(0, 16),
          });
        } catch (err) {
          setError('Không thể tải thông tin bài tập');
        } finally {
          setFetching(false);
        }
      };
      fetchAssignment();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (new Date(formData.dueAt) <= new Date(formData.assignedAt)) {
      setError('Hạn nộp phải sau ngày giao bài');
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await assignmentService.updateAssignment(id, formData);
        alert('Cập nhật bài tập thành công!');
      } else {
        await assignmentService.createAssignment(groupId, formData);
        alert('Tạo bài tập thành công!');
      }
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu bài tập');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button 
        startIcon={<BackIcon />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Quay lại
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {isEdit ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
        </Typography>
        <Divider sx={{ my: 2 }} />

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Tiêu đề bài tập"
                fullWidth
                required
                value={formData.title}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Mô tả / Hướng dẫn</Typography>
              <CKEditorWrapper
                value={formData.description}
                onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                placeholder="Nhập hướng dẫn chi tiết cho bài tập..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="assignedAt"
                label="Ngày giao bài"
                type="datetime-local"
                fullWidth
                required
                value={formData.assignedAt}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dueAt"
                label="Hạn nộp"
                type="datetime-local"
                fullWidth
                required
                value={formData.dueAt}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="submissionType"
                label="Loại bài nộp"
                select
                fullWidth
                value={formData.submissionType}
                onChange={handleChange}
              >
                <MenuItem value="FILE">Tệp đính kèm</MenuItem>
                <MenuItem value="TEXT">Văn bản trực tiếp</MenuItem>
                <MenuItem value="MIXED">Cả hai</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="maxScore"
                label="Điểm tối đa"
                type="number"
                fullWidth
                value={formData.maxScore}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}><Divider>Cấu hình nâng cao</Divider></Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="allowedFileTypes"
                label="Định dạng cho phép"
                fullWidth
                value={formData.allowedFileTypes}
                onChange={handleChange}
                disabled={formData.submissionType === 'TEXT'}
                helperText="Ví dụ: .pdf,.docx,.zip"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="maxFileSizeMb"
                label="Dung lượng tối đa (MB)"
                type="number"
                fullWidth
                value={formData.maxFileSizeMb}
                onChange={handleChange}
                disabled={formData.submissionType === 'TEXT'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch 
                    name="allowLate" 
                    checked={formData.allowLate} 
                    onChange={handleChange} 
                  />
                }
                label="Cho phép nộp muộn"
              />
            </Grid>
            {formData.allowLate && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="latePenaltyPercent"
                  label="Phần trăm trừ điểm (nộp muộn)"
                  type="number"
                  fullWidth
                  value={formData.latePenaltyPercent}
                  onChange={handleChange}
                  InputProps={{ endAdornment: <Typography variant="body2">%</Typography> }}
                />
              </Grid>
            )}

            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => navigate(-1)}>Hủy</Button>
              <Button 
                type="submit" 
                variant="contained" 
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo bài tập')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AssignmentForm;
