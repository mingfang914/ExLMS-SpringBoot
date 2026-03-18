import api from './api'

const calendarService = {
  getEvents: async (start, end) => {
    // In a real app, you would fetch events from the backend within a date range
    // For now, we return mock data
    const mockEvents = [
      {
        id: 'event1',
        title: 'Assignment Due: Project Proposal',
        start: '2026-03-25T23:59:00',
        allDay: false,
        backgroundColor: '#f44336', // Red for assignments
        borderColor: '#f44336',
        extendedProps: {
          type: 'ASSIGNMENT_DUE',
          groupId: 'group1',
          assignmentId: 'assign1'
        }
      },
      {
        id: 'event2',
        title: 'Meeting: Spring Boot Q&A',
        start: '2026-03-26T15:00:00',
        end: '2026-03-26T16:00:00',
        backgroundColor: '#2196f3', // Blue for meetings
        borderColor: '#2196f3',
        extendedProps: {
          type: 'MEETING',
          groupId: 'group1',
          meetingId: 'meet1'
        }
      },
      {
        id: 'event3',
        title: 'Course Start: Introduction to React',
        start: '2026-03-20',
        allDay: true,
        backgroundColor: '#4caf50', // Green for courses
        borderColor: '#4caf50',
        extendedProps: {
          type: 'COURSE_START',
          courseId: 'course1'
        }
      }
    ]
    return Promise.resolve(mockEvents)
  }
}

export default calendarService
