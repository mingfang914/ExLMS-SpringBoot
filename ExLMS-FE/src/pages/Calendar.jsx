import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import calendarService from '../services/calendarService'

const Calendar = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const data = await calendarService.getEvents()
        setEvents(data)
      } catch (err) {
        setError('Failed to load calendar events.')
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedEvent(null)
  }

  const handleNavigate = () => {
    if (!selectedEvent) return
    const { type, groupId, assignmentId, meetingId, courseId } = selectedEvent.extendedProps
    handleDialogClose()

    switch (type) {
      case 'ASSIGNMENT_DUE':
        navigate(`/groups/${groupId}/assignments/${assignmentId}`)
        break
      case 'MEETING':
        navigate(`/groups/${groupId}/meetings/${meetingId}`)
        break
      case 'COURSE_START':
        navigate(`/groups/${groupId}/courses/${courseId}`)
        break
      default:
        break
    }
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        My Calendar
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            events={events}
            eventClick={handleEventClick}
            height="auto"
            editable
            selectable
          />
        </Paper>
      )}

      {selectedEvent && (
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>{selectedEvent.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {selectedEvent.start && `Starts: ${new Date(selectedEvent.start).toLocaleString()}`}
              <br />
              {selectedEvent.end && `Ends: ${new Date(selectedEvent.end).toLocaleString()}`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Close</Button>
            <Button onClick={handleNavigate} variant="contained">
              Go to Event
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}

export default Calendar
