import React, { useState, useEffect } from 'react'
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Skeleton,
  LinearProgress
} from '@mui/material'
import {
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Notifications as NotificationIcon,
  TrendingUp as ProgressIcon,
  PlayCircleOutline as CourseIcon
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'

const chartData = [
  { name: 'Mon', hours: 2 },
  { name: 'Tue', hours: 3.5 },
  { name: 'Wed', hours: 1 },
  { name: 'Thu', hours: 4 },
  { name: 'Fri', hours: 2.5 },
  { name: 'Sat', hours: 5 },
  { name: 'Sun', hours: 3 },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const stats = [
    { label: 'Joined Groups', value: 5, icon: <GroupIcon />, color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' },
    { label: 'Courses in Progress', value: 3, icon: <CourseIcon />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Pending Assignments', value: 2, icon: <AssignmentIcon />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Upcoming Meetings', value: 1, icon: <EventIcon />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  ]

  const upcomingMeetings = [
    { id: 1, title: 'Java Programming Workshop', time: 'Today, 2:00 PM', group: 'CS 2024' },
    { id: 2, title: 'Weekly Team Sync', time: 'Tomorrow, 10:00 AM', group: 'Study Group A' },
  ]

  const recentActivities = [
    { id: 1, type: 'assignment', text: 'New assignment: Spring Boot Project', time: '2 hours ago' },
    { id: 2, type: 'notification', text: 'Course "Introduction to React" updated', time: '5 hours ago' },
    { id: 3, type: 'forum', text: 'Your post "How to use Redux?" got a new reply', time: '1 day ago' },
  ]

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 6 }}>
      <motion.div variants={itemVariants}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              Welcome back, {user?.name || user?.email?.split('@')[0] || 'Student'}! 👋
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Here is what's happening with your learning progress today.
            </Typography>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div variants={itemVariants} style={{ height: '100%' }}>
              <Card className="glass-panel hover-lift" sx={{ height: '100%', border: 'none' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  {loading ? (
                    <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
                  ) : (
                    <Avatar sx={{ bgcolor: stat.bg, color: stat.color, width: 56, height: 56, mr: 2 }}>
                      {stat.icon}
                    </Avatar>
                  )}
                  <Box>
                    {loading ? (
                      <>
                        <Skeleton variant="text" width={40} height={40} />
                        <Skeleton variant="text" width={100} />
                      </>
                    ) : (
                      <>
                        <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>{stat.value}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>{stat.label}</Typography>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}

        {/* Learning Chart */}
        <Grid item xs={12} md={8}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card className="glass-panel" sx={{ height: '100%', border: 'none', display: 'flex', flexDirection: 'column' }}>
              <CardHeader 
                title={<Typography variant="h6" fontWeight={700}>Learning Hours</Typography>}
                sx={{ pb: 0 }}
              />
              <CardContent sx={{ flexGrow: 1, minHeight: 300, pt: 2 }}>
                {loading ? (
                  <Skeleton variant="rounded" width="100%" height="100%" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                      />
                      <Area type="monotone" dataKey="hours" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Course Progress */}
        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card className="glass-panel" sx={{ height: '100%', border: 'none' }}>
              <CardHeader title={<Typography variant="h6" fontWeight={700}>Current Course</Typography>} />
              <CardContent>
                {loading ? (
                  <Box>
                    <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
                    <Skeleton variant="text" height={30} width="80%" />
                    <Skeleton variant="text" height={20} width="40%" sx={{ mb: 2 }} />
                    <Skeleton variant="rounded" height={8} />
                  </Box>
                ) : (
                  <Box>
                    <Box 
                      sx={{ 
                        height: 120, 
                        borderRadius: 2, 
                        mb: 2, 
                        backgroundImage: 'url(https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                      }}
                    >
                      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>React JS Advanced Practices</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>12 / 24 Lessons completed</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={50} 
                        sx={{ 
                          flexGrow: 1, 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'rgba(79, 70, 229, 0.1)',
                          '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: '#4f46e5' }
                        }} 
                      />
                      <Typography variant="body2" fontWeight={600} sx={{ ml: 2, color: '#4f46e5' }}>50%</Typography>
                    </Box>
                    <Button variant="contained" color="primary" fullWidth sx={{ mt: 3, borderRadius: 2 }}>
                      Continue Learning
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recent Activities Area */}
        <Grid item xs={12} md={7}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card className="glass-panel" sx={{ height: '100%', border: 'none' }}>
              <CardHeader 
                title={<Typography variant="h6" fontWeight={700}>Recent Activities</Typography>} 
                action={<Button size="small" component={Link} to="/activities">View All</Button>}
              />
              <CardContent sx={{ p: 0, pb: '16px !important' }}>
                <List sx={{ px: 2 }}>
                  {loading ? (
                    Array.from(new Array(3)).map((_, i) => (
                      <ListItem key={i} sx={{ px: 1 }}>
                        <ListItemAvatar><Skeleton variant="circular" width={40} height={40} /></ListItemAvatar>
                        <ListItemText primary={<Skeleton width="60%" />} secondary={<Skeleton width="30%" />} />
                      </ListItem>
                    ))
                  ) : (
                    recentActivities.map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <ListItem sx={{ 
                          px: 2, py: 1.5, borderRadius: 2, mb: 1,
                          transition: 'background-color 0.2s',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                        }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: activity.type === 'assignment' ? 'warning.light' : 'info.light', color: 'white' }}>
                              {activity.type === 'assignment' ? <AssignmentIcon /> : <NotificationIcon />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="body2" fontWeight={600}>{activity.text}</Typography>}
                            secondary={<Typography variant="caption" color="text.secondary">{activity.time}</Typography>}
                          />
                        </ListItem>
                      </React.Fragment>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Sidebar Widgets (Upcoming) */}
        <Grid item xs={12} md={5}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card className="glass-panel" sx={{ height: '100%', border: 'none' }}>
              <CardHeader 
                title={<Typography variant="h6" fontWeight={700}>Upcoming Meetings</Typography>} 
                action={<Button size="small" component={Link} to="/calendar">Calendar</Button>}
              />
              <CardContent sx={{ p: 0, pb: '16px !important' }}>
                <List sx={{ px: 2 }}>
                  {loading ? (
                    Array.from(new Array(2)).map((_, i) => (
                      <ListItem key={i} sx={{ px: 1 }}>
                        <ListItemAvatar><Skeleton variant="circular" width={40} height={40} /></ListItemAvatar>
                        <ListItemText primary={<Skeleton width="70%" />} secondary={<Skeleton width="40%" />} />
                      </ListItem>
                    ))
                  ) : (
                    upcomingMeetings.map((meeting, index) => (
                      <React.Fragment key={meeting.id}>
                        <ListItem sx={{ 
                          px: 2, py: 1.5, borderRadius: 2, mb: 1,
                          border: '1px solid rgba(0,0,0,0.05)',
                          bgcolor: 'rgba(255,255,255,0.5)'
                        }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'error.light', color: 'white', variant: 'rounded', borderRadius: 2 }}>
                              <EventIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="body2" fontWeight={600}>{meeting.title}</Typography>}
                            secondary={
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444', marginRight: 6 }}></span>
                                {meeting.time} • {meeting.group}
                              </Typography>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

      </Grid>
    </Box>
  )
}

export default Dashboard
