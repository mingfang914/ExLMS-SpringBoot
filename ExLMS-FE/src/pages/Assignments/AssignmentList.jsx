import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Chip,
  Grid, CircularProgress, Alert, Divider, IconButton, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Description as DescriptionIcon,
  FilePresent as FileIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import assignmentService from '../../services/assignmentService';
import groupService from '../../services/groupService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useSelector } from 'react-redux';

const AssignmentList = ({ courseId, isInstructor: isInstructorProp }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInstructor, setIsInstructor] = useState(isInstructorProp || false);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Determine role if not provided
      if (isInstructorProp === undefined) {
        const groupData = await groupService.getGroupById(groupId);
        const currentUserRole = groupData?.currentUserRole;
        const instructorRoles = ['OWNER', 'EDITOR'];
        setIsInstructor(instructorRoles.includes(currentUserRole));
      } else {
        setIsInstructor(isInstructorProp);
      }

      let data = [];
      if (courseId) {
        data = await assignmentService.getAssignmentsByCourse(courseId);
      } else {
        data = await assignmentService.getAssignmentsByGroup(groupId);
      }
      setAssignments(data);
    } catch (err) {
      setError('Không thể tải danh sách bài tập');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [groupId, courseId, isInstructorProp, user?.id]);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài tập này không?')) {
      try {
        await assignmentService.deleteAssignment(id);
        setAssignments(assignments.filter(a => a.id !== id));
        alert('Đã xóa bài tập thành công!');
      } catch (err) {
        alert('Không thể xóa bài tập');
      }
    }
  };

  const getStatusChip = (asgn) => {
    const now = new Date();
    const due = new Date(asgn.dueAt);

    if (asgn.status === 'CLOSED') return <Chip label="Đã đóng" color="error" size="small" />;
    if (asgn.status === 'DRAFT') return <Chip label="Nháp" color="default" size="small" />;
    if (now > due) return <Chip label="Hết hạn" color="warning" size="small" />;
    return <Chip label="Đang mở" color="success" size="small" />;
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: courseId ? 0 : 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon color="primary" /> Bài tập
        </Typography>
        {isInstructor && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/groups/${groupId}/assignments/create`)}
          >
            Create
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {assignments.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {isInstructor ? "Chưa có bài tập nào. Hãy tạo bài tập đầu tiên!" : "Hiện chưa có bài tập nào được giao."}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {assignments.map((asgn) => (
            <Grid item xs={12} key={asgn.id}>
              <Card
                sx={{
                  '&:hover': { boxShadow: 4 },
                  transition: 'box-shadow 0.2s'
                }}
              >
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {asgn.title}
                      </Typography>
                      {getStatusChip(asgn)}
                    </Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                      dangerouslySetInnerHTML={{ __html: asgn.description }}
                    />
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimelineIcon fontSize="inherit" />
                        Hạn: {format(new Date(asgn.dueAt), 'HH:mm dd/MM/yyyy', { locale: vi })}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {asgn.submissionType === 'FILE' ? <FileIcon fontSize="inherit" /> : <DescriptionIcon fontSize="inherit" />}
                        Loại: {asgn.submissionType === 'FILE' ? 'Nộp tệp' : 'Văn bản'}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        Điểm tối đa: {asgn.maxScore}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/groups/${groupId}/assignments/${asgn.id}`)}
                    >
                      {isInstructor ? 'Xem & Chấm điểm' : 'Chi tiết'}
                    </Button>
                    {isInstructor && (
                      <>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" color="primary" onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/groups/${groupId}/assignments/${asgn.id}/edit`);
                          }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error" onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(asgn.id);
                          }}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AssignmentList;
