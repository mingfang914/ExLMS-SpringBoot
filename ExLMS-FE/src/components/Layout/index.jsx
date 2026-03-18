import React from 'react'
import { Box, Toolbar, CssBaseline } from '@mui/material'
import Header from './Header'
import Sidebar from './Sidebar'
import PageTransition from '../Common/PageTransition'

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      <CssBaseline />
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - 240px)` },
          mt: 8, // margin top to account for standard AppBar height
          backgroundImage: 'radial-gradient(circle at 50% 0%, #f1f5f9 0%, #f8fafc 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // Center content horizontally if needed
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '1200px' }}>
          <PageTransition>
            {children}
          </PageTransition>
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
