import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Alert,
  Chip,
  TextField,
  Skeleton
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  DescriptionOutlined as DocIcon,
  Schedule as DueIcon,
  EmojiEvents as TrophyIcon,
  TaskAlt as SuccessIcon
} from '@mui/icons-material'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import assignmentService from '../../services/assignmentService'
import FileUpload from '../../components/Common/FileUpload'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

const AssignmentDetail = () => {
  const { groupId, id } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submissionText, setSubmissionText] = useState('')
  const [fileKey, setFileKey] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Mock data
  const mockAssignment = {
    id: 1,
    title: 'Final Project Proposal',
    description: 'Please submit your project proposal document here. It should include the problem statement, proposed solution, and technology stack. Don\'t stress, take your time to brainstorm the best ideas!',
    dueDate: '2026-03-25T23:59:00',
    maxScore: 100,
    status: 'Pending', // Pending, Submitted, Graded
    mySubmission: null
  }

  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true)
      try {
        // const data = await assignmentService.getAssignmentById(groupId, id)
        // setAssignment(data)
        setTimeout(() => {
          setAssignment(mockAssignment)
          setLoading(false)
        }, 800)
      } catch (err) {
        setError('Failed to load assignment details.')
        setLoading(false)
      }
    }
    fetchAssignment()
  }, [groupId, id])

  const handleUploadSuccess = (key) => {
    setFileKey(key)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // await assignmentService.submitAssignment(groupId, id, { text: submissionText, fileKey })
      setTimeout(() => {
        setAssignment({
          ...assignment,
          status: 'Submitted',
          mySubmission: { text: submissionText, fileKey, submittedAt: new Date().toISOString() }
        })
        setSubmitting(false)
        setShowConfetti(true)
      }, 1500)
    } catch (err) {
      alert('Failed to submit assignment.')
      setSubmitting(false)
    }
  }

  if (error) return <Alert severity="error">{error}</Alert>

  const getStatusColor = (status) => {
    if (status === 'Graded') return 'secondary' // Emerald
    if (status === 'Submitted') return 'primary' // Indigo
    return 'warning'
  }

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 6 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          
          {/* Instructions Card */}
          <motion.div variants={itemVariants}>
            <Paper className="glass-panel" sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, mb: 4, border: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                {loading ? (
                  <Skeleton width="60%" height={60} />
                ) : (
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {assignment.title}
                  </Typography>
                )}
                {!loading && (
                  <Chip
                    label={assignment.status}
                    color={getStatusColor(assignment.status)}
                    sx={{ fontWeight: 700, px: 1, fontSize: '0.9rem', borderRadius: 2 }}
                  />
                )}
              </Box>
              
              {!loading && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 5, p: 2, bgcolor: 'rgba(79, 70, 229, 0.04)', borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <DueIcon sx={{ mr: 1.5, color: '#4f46e5' }} />
                    <Box>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Due Date</Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {new Date(assignment.dueDate).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <TrophyIcon sx={{ mr: 1.5, color: '#f59e0b' }} />
                    <Box>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>Max Points</Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">{assignment.maxScore}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#4f46e5' }}>Instructions</Typography>
                {loading ? (
                  <>
                    <Skeleton /><Skeleton /><Skeleton width="80%" />
                  </>
                ) : (
                  <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary', fontSize: '1.05rem' }}>
                    {assignment.description}
                  </Typography>
                )}
              </Box>
            </Paper>
          </motion.div>

          {/* Submission Area */}
          <motion.div variants={itemVariants}>
            <Paper className="glass-panel" sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: 'none', position: 'relative', overflow: 'hidden' }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>Your Work</Typography>
              
              {loading ? (
                <Skeleton variant="rounded" height={200} sx={{ mt: 3 }} />
              ) : assignment.status === 'Pending' ? (
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    placeholder="Type your response here or leave a note for the instructor..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    sx={{ 
                      mb: 4, 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        transition: 'all 0.2s',
                        '&.Mui-focused': { bgcolor: '#fff', boxShadow: '0 4px 20px rgba(79, 70, 229, 0.1)' }
                      }
                    }}
                  />
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: 'text.secondary' }}>Attach Files (Optional)</Typography>
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 3, p: 1 }}>
                    <FileUpload onUploadSuccess={handleUploadSuccess} />
                  </Box>
                  
                  <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="secondary" // Emerald Green to reduce stress
                      size="large"
                      onClick={handleSubmit}
                      disabled={submitting || (!submissionText && !fileKey)}
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                      className="hover-lift"
                      sx={{ 
                        px: 6, py: 1.5, borderRadius: 3, fontSize: '1.1rem', fontWeight: 600,
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' // Emerald shadow
                      }}
                    >
                      {submitting ? 'Turning In...' : 'Turn In Assignment'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <AnimatePresence>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ marginTop: 20 }}
                  >
                    <Box sx={{ p: 4, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: 3, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: '#10b981' }}>
                        <SuccessIcon sx={{ fontSize: 32, mr: 1.5 }} />
                        <Typography variant="h6" fontWeight={700}>Successfully Submitted!</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Submitted on: {new Date(assignment.mySubmission?.submittedAt).toLocaleString([], { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                      {assignment.mySubmission?.text && (
                        <Box sx={{ mt: 3, p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                            {assignment.mySubmission.text}
                          </Typography>
                        </Box>
                      )}
                      {assignment.mySubmission?.fileKey && (
                        <Button startIcon={<DocIcon />} sx={{ mt: 3, borderRadius: 2, bgcolor: 'white' }} variant="outlined" color="primary">
                          View Attached Documentation
                        </Button>
                      )}
                    </Box>
                  </motion.div>
                </AnimatePresence>
              )}
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <AnimatePresence>
            {!loading && assignment?.status === 'Graded' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.3 }}
              >
                <Paper sx={{ p: 4, borderRadius: 4, bgcolor: '#10b981', color: 'white', border: 'none', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}>
                  <Typography variant="h6" fontWeight={600} sx={{ opacity: 0.9 }}>Your Grade</Typography>
                  <Typography variant="h1" sx={{ fontWeight: 800, mt: 1, mb: 2, fontSize: '4.5rem' }}>95<span style={{fontSize: '2rem', opacity: 0.8}}>/100</span></Typography>
                  <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
                  <Typography variant="subtitle1" fontWeight={700} mb={1}>Instructor Feedback:</Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6, opacity: 0.95 }}>
                    "Excellent work! The proposal is very clear and well-structured. You demonstrated a deep understanding of the problem domain."
                  </Typography>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AssignmentDetail
