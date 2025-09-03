import React from 'react';
import { AppBar, Toolbar, Typography, Box, Chip } from '@mui/material';
import { WaterDrop, LocationOn, Engineering } from '@mui/icons-material';

const Header = () => {
  return (
    <AppBar position="static" elevation={0} sx={{ 
      background: 'linear-gradient(135deg, #1976d2 0%, #2e7d32 100%)',
      borderBottom: '4px solid #fff'
    }}>
      <Toolbar>
        <WaterDrop sx={{ mr: 2, fontSize: '2rem' }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          RWH-Erode
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            icon={<LocationOn />}
            label="Erode District"
            variant="outlined"
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
          <Chip
            icon={<Engineering />}
            label="AI-Powered"
            variant="outlined"
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
