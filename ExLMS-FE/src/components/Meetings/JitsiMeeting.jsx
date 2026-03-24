import React, { useEffect, useRef } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'

const JitsiMeeting = ({ roomName, displayName, email, isInstructor = false, onMeetingEnd }) => {
  const jitsiContainerRef = useRef(null)

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      console.error('Jitsi Meet External API not loaded')
      return
    }

    const instructorButtons = [
      'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
      'fodeviceselection', 'hangup', 'profile', 'recording',
      'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
      'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
      'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
      'security', 'chat'
    ]

    const memberButtons = [
      'microphone', 'camera', 'closedcaptions', 'fullscreen',
      'fodeviceselection', 'hangup', 'profile', 'raisehand',
      'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
      'tileview', 'videobackgroundblur', 'download', 'help', 'chat'
    ]

    const domain = 'meet.jit.si'
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: displayName,
        email: email
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: isInstructor ? instructorButtons : memberButtons,
      },
      configOverwrite: {
        startWithAudioMuted: true,
        disableInviteFunctions: false,
      }
    }

    const api = new window.JitsiMeetExternalAPI(domain, options)

    api.addEventListeners({
      readyToClose: () => {
        if (onMeetingEnd) onMeetingEnd()
      },
      videoConferenceTerminated: () => {
        if (onMeetingEnd) onMeetingEnd()
      }
    })

    return () => {
      api.dispose()
    }
  }, [roomName, displayName, email, onMeetingEnd])

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 200px)', bgcolor: 'black', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
      <Box ref={jitsiContainerRef} sx={{ width: '100%', height: '100%' }} />
      {!window.JitsiMeetExternalAPI && (
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'white' }}>
          <CircularProgress color="inherit" sx={{ mb: 2 }} />
          <Typography>Loading Meeting Room...</Typography>
        </Box>
      )}
    </Box>
  )
}

export default JitsiMeeting
