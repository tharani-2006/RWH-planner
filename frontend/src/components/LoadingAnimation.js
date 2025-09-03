import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  Avatar
} from '@mui/material';
import {
  Engineering,
  Calculate,
  LocationOn,
  WaterDrop,
  TrendingUp,
  CheckCircle
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingAnimation = ({ isLoading }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingSteps = [
    {
      icon: <LocationOn />,
      title: 'Analyzing Location',
      description: 'Processing groundwater and soil data for your area',
      color: '#1976d2'
    },
    {
      icon: <Calculate />,
      title: 'Space Optimization',
      description: 'Calculating optimal structure for your available space',
      color: '#2e7d32'
    },
    {
      icon: <Engineering />,
      title: 'AI Processing',
      description: 'Running machine learning models for predictions',
      color: '#ed6c02'
    },
    {
      icon: <WaterDrop />,
      title: 'Water Analysis',
      description: 'Computing harvesting potential and storage efficiency',
      color: '#0288d1'
    },
    {
      icon: <TrendingUp />,
      title: 'Cost Calculation',
      description: 'Generating cost estimates and payback analysis',
      color: '#7b1fa2'
    },
    {
      icon: <CheckCircle />,
      title: 'Finalizing Results',
      description: 'Preparing your personalized recommendations',
      color: '#388e3c'
    }
  ];

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    const stepDuration = 800; // ms per step
    const totalDuration = stepDuration * loadingSteps.length;
    
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) {
          return prev + (100 / (totalDuration / 50));
        }
        return 100;
      });
    }, 50);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading, loadingSteps.length]);

  if (!isLoading) return null;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '400px',
      p: 3
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          elevation={8}
          sx={{ 
            maxWidth: 500, 
            width: '100%',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            border: '2px solid #1976d2',
            borderRadius: 4
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    margin: '0 auto',
                    background: 'linear-gradient(45deg, #1976d2, #2e7d32)',
                    mb: 2
                  }}
                >
                  <Engineering sx={{ fontSize: '2.5rem' }} />
                </Avatar>
              </motion.div>
              
              <Typography variant="h5" color="primary" gutterBottom>
                🧠 AI Analysis in Progress
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Processing your data with advanced algorithms
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #1976d2, #2e7d32)',
                    borderRadius: 4
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {Math.round(progress)}% Complete
              </Typography>
            </Box>

            {/* Current Step */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 2, 
                  backgroundColor: 'white',
                  borderRadius: 2,
                  border: `2px solid ${loadingSteps[currentStep]?.color}`,
                  mb: 2
                }}>
                  <Avatar 
                    sx={{ 
                      backgroundColor: loadingSteps[currentStep]?.color,
                      mr: 2,
                      width: 48,
                      height: 48
                    }}
                  >
                    {loadingSteps[currentStep]?.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" color="primary">
                      {loadingSteps[currentStep]?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {loadingSteps[currentStep]?.description}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </AnimatePresence>

            {/* Step Indicators */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              {loadingSteps.map((step, index) => (
                <Chip
                  key={index}
                  size="small"
                  label={index + 1}
                  sx={{
                    backgroundColor: index <= currentStep ? step.color : '#e0e0e0',
                    color: index <= currentStep ? 'white' : '#666',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Box>

            {/* Fun Facts */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                💡 <strong>Did you know?</strong> A 100m² roof can collect up to 77,500 liters 
                of rainwater annually in Erode district!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default LoadingAnimation;
