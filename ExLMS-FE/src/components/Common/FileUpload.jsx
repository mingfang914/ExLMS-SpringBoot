import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  IconButton,
  Paper
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  AttachFile as FileIcon
} from '@mui/icons-material'
import fileService from '../../services/fileService'

const FileUpload = ({ onUploadSuccess, accept = "*", label = "Upload File" }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      // Mock progress since Axios doesn't support it easily in a mock environment
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 10))
      }, 200)

      const fileKey = await fileService.uploadFile(file)
      
      clearInterval(interval)
      setProgress(100)
      
      if (onUploadSuccess) {
        onUploadSuccess(fileKey)
      }
    } catch (err) {
      setError('Failed to upload file.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setProgress(0)
    setError(null)
  }

  return (
    <Box>
      {!file ? (
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadIcon />}
          fullWidth
          sx={{ py: 3, borderStyle: 'dashed' }}
        >
          {label}
          <input
            type="file"
            hidden
            accept={accept}
            onChange={handleFileChange}
          />
        </Button>
      ) : (
        <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <FileIcon color="primary" />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 'bold' }}>
              {file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
            {uploading && (
              <LinearProgress variant="determinate" value={progress} sx={{ mt: 1, height: 4, borderRadius: 2 }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!uploading && (
              <Button size="small" variant="contained" onClick={handleUpload}>
                Upload
              </Button>
            )}
            <IconButton size="small" onClick={handleRemove} disabled={uploading}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  )
}

export default FileUpload
