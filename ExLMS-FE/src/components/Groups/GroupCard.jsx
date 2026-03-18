import React from 'react'
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  Chip,
  Box,
  Avatar,
  Tooltip
} from '@mui/material'
import {
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  Public as PublicIcon,
  Lock as LockIcon
} from '@mui/icons-material'
import { Link } from 'react-router-dom'

const GroupCard = ({ group, onJoin }) => {
  const { id, name, description, ownerName, visibility, memberCount, category, status, coverUrl } = group

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
      <CardMedia
        component="img"
        height="140"
        image={coverUrl || 'https://via.placeholder.com/400x200?text=Study+Group'}
        alt={name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {name}
          </Typography>
          <Chip
            size="small"
            icon={visibility === 'PUBLIC' ? <PublicIcon /> : <LockIcon />}
            label={visibility}
            color={visibility === 'PUBLIC' ? 'success' : 'warning'}
            variant="outlined"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '3em',
          mb: 2
        }}>
          {description || 'No description provided.'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PeopleIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {memberCount} members
          </Typography>
        </Box>
        
        {category && (
          <Chip label={category} size="small" variant="filled" color="primary" sx={{ mt: 1 }} />
        )}
      </CardContent>
      <Box sx={{ p: 2, pt: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          By <strong>{ownerName}</strong>
        </Typography>
        <CardActions sx={{ p: 0 }}>
          <Button size="small" component={Link} to={`/groups/${id}`} startIcon={<VisibilityIcon />}>
            Details
          </Button>
          <Button size="small" variant="contained" onClick={() => onJoin(id)}>
            Join
          </Button>
        </CardActions>
      </Box>
    </Card>
  )
}

export default GroupCard
