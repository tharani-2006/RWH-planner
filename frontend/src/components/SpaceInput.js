import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Alert,
  AlertTitle,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  ArrowBack, 
  ArrowForward, 
  Straighten, 
  CropFree,
  Recommend,
  Warning
} from '@mui/icons-material';

const SpaceInput = ({ onSubmit, onBack, loading, initialData, goal }) => {
  const [spaceLength, setSpaceLength] = useState(initialData?.spaceLength || '');
  const [spaceWidth, setSpaceWidth] = useState(initialData?.spaceWidth || '');
  const [errors, setErrors] = useState({});
  const [spaceAnalysis, setSpaceAnalysis] = useState(null);

  useEffect(() => {
    if (spaceLength && spaceWidth && !errors.spaceLength && !errors.spaceWidth) {
      analyzeSpace();
    }
  }, [spaceLength, spaceWidth, errors.spaceLength, errors.spaceWidth]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!spaceLength || parseFloat(spaceLength) <= 0) {
      newErrors.spaceLength = 'Please enter a valid length';
    } else if (parseFloat(spaceLength) > 100) {
      newErrors.spaceLength = 'Length seems too large. Please check your input.';
    }
    
    if (!spaceWidth || parseFloat(spaceWidth) <= 0) {
      newErrors.spaceWidth = 'Please enter a valid width';
    } else if (parseFloat(spaceWidth) > 100) {
      newErrors.spaceWidth = 'Width seems too large. Please check your input.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const analyzeSpace = () => {
    const length = parseFloat(spaceLength);
    const width = parseFloat(spaceWidth);
    const area = length * width;
    const aspectRatio = Math.max(length, width) / Math.min(length, width);
    
    let spaceType, recommendation, suitability, icon, color;
    
    if (area < 4) {
      spaceType = 'Very Limited Space';
      recommendation = 'Recharge Shaft or Storage Tank';
      suitability = 'limited';
      icon = '🔹';
      color = '#ff9800';
    } else if (aspectRatio > 3) {
      spaceType = 'Long & Narrow Space';
      recommendation = 'Recharge Trench';
      suitability = 'good';
      icon = '📏';
      color = '#2e7d32';
    } else if (area >= 4 && aspectRatio <= 3) {
      spaceType = 'Square/Rectangular Space';
      recommendation = 'Recharge Pit';
      suitability = 'excellent';
      icon = '⬜';
      color = '#1976d2';
    } else {
      spaceType = 'Irregular Space';
      recommendation = 'Custom Solution';
      suitability = 'moderate';
      icon = '🔷';
      color = '#9c27b0';
    }
    
    setSpaceAnalysis({
      area,
      aspectRatio,
      spaceType,
      recommendation,
      suitability,
      icon,
      color
    });
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        spaceLength: parseFloat(spaceLength),
        spaceWidth: parseFloat(spaceWidth)
      });
    }
  };

  const getSuitabilityColor = (suitability) => {
    switch (suitability) {
      case 'excellent': return '#4caf50';
      case 'good': return '#8bc34a';
      case 'moderate': return '#ff9800';
      case 'limited': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <Box className="step-content">
      <Typography variant="h5" gutterBottom align="center" color="primary">
        📐 Available Open Space
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Space-Smart Recommendations</AlertTitle>
        {goal === 'storage'
          ? 'For rooftop storage, we need to know your available roof space for tank placement and access.'
          : 'We\'ll analyze your ground space to recommend the most suitable recharge structure (pit, trench, or shaft).'
        }
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Straighten sx={{ mr: 1, verticalAlign: 'middle' }} />
                Space Dimensions
              </Typography>
              
              <TextField
                fullWidth
                label="Length"
                value={spaceLength}
                onChange={(e) => setSpaceLength(e.target.value)}
                error={!!errors.spaceLength}
                helperText={errors.spaceLength || 'Length of available space'}
                InputProps={{
                  endAdornment: <InputAdornment position="end">meters</InputAdornment>,
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Width"
                value={spaceWidth}
                onChange={(e) => setSpaceWidth(e.target.value)}
                error={!!errors.spaceWidth}
                helperText={errors.spaceWidth || 'Width of available space'}
                InputProps={{
                  endAdornment: <InputAdornment position="end">meters</InputAdornment>,
                }}
              />
              
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  💡 <strong>Tip:</strong> Measure the largest rectangular area where you can 
                  install a rainwater harvesting structure (garden, courtyard, open land).
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CropFree sx={{ mr: 1, verticalAlign: 'middle' }} />
                Space Visualizer
              </Typography>
              
              {spaceLength && spaceWidth && !errors.spaceLength && !errors.spaceWidth ? (
                <Box className="space-visualizer" sx={{ 
                  height: Math.min(200, Math.max(100, parseFloat(spaceWidth) * 10)),
                  width: '100%',
                  position: 'relative'
                }}>
                  <Box className="space-dimensions">
                    <Typography variant="h6">
                      {spaceLength}m × {spaceWidth}m
                    </Typography>
                    <Typography variant="body2">
                      Total Area: {(parseFloat(spaceLength) * parseFloat(spaceWidth)).toFixed(1)} m²
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    position: 'absolute', 
                    top: -10, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    fontSize: '0.8rem',
                    color: '#666'
                  }}>
                    {spaceLength}m
                  </Box>
                  
                  <Box sx={{ 
                    position: 'absolute', 
                    left: -30, 
                    top: '50%', 
                    transform: 'translateY(-50%) rotate(-90deg)',
                    fontSize: '0.8rem',
                    color: '#666'
                  }}>
                    {spaceWidth}m
                  </Box>
                </Box>
              ) : (
                <Box className="space-visualizer">
                  <Typography variant="body2" color="text.secondary">
                    Enter dimensions to see space visualization
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {spaceAnalysis && (
        <Card elevation={3} sx={{ mt: 3, border: `2px solid ${spaceAnalysis.color}` }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Recommend sx={{ mr: 1, color: spaceAnalysis.color }} />
              <Typography variant="h6" sx={{ color: spaceAnalysis.color }}>
                Space Analysis & Recommendation
              </Typography>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ color: spaceAnalysis.color }}>
                    {spaceAnalysis.icon}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {spaceAnalysis.spaceType}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>
                  Recommended Structure: <strong>{spaceAnalysis.recommendation}</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${spaceAnalysis.area.toFixed(1)} m² area`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    label={`${spaceAnalysis.aspectRatio.toFixed(1)}:1 ratio`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    label={`${spaceAnalysis.suitability} suitability`}
                    size="small"
                    sx={{ 
                      backgroundColor: getSuitabilityColor(spaceAnalysis.suitability),
                      color: 'white'
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                {spaceAnalysis.suitability === 'limited' && (
                  <Alert severity="warning" sx={{ p: 1 }}>
                    <Typography variant="body2">
                      <Warning sx={{ fontSize: '1rem', mr: 0.5 }} />
                      Consider storage tank option
                    </Typography>
                  </Alert>
                )}
                {spaceAnalysis.suitability === 'excellent' && (
                  <Alert severity="success" sx={{ p: 1 }}>
                    <Typography variant="body2">
                      Perfect for cost-effective pit
                    </Typography>
                  </Alert>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBack />}
          size="large"
          disabled={loading}
        >
          Back to Property
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
          size="large"
          disabled={!spaceLength || !spaceWidth || Object.keys(errors).length > 0 || loading}
        >
          {loading ? 'Analyzing...' : 'Get AI Recommendations'}
        </Button>
      </Box>
    </Box>
  );
};

export default SpaceInput;
