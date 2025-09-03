import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Button,
  Alert,
  AlertTitle,
  Chip,
  Avatar
} from '@mui/material';
import {
  WaterDrop,
  Nature,
  ArrowBack,
  ArrowForward,
  Storage
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const GoalSelection = ({ onSubmit, onBack, selectedGoal }) => {
  const [goal, setGoal] = useState(selectedGoal || '');

  const goals = [
    {
      id: 'storage',
      title: 'Rainwater Storage & Reuse',
      subtitle: 'For City Homes & Limited Space',
      description: 'Store rainwater in tanks for daily use like washing, gardening, and non-potable needs. Perfect for urban areas with no space for ground structures.',
      icon: <Storage />,
      color: '#1976d2',
      benefits: [
        'Immediate water availability',
        'Reduced water bills',
        'Perfect for apartments/small homes',
        'Rooftop installation'
      ],
      bestFor: 'Urban homes, apartments, limited ground space',
      arDemo: 'Rooftop tank system with pipes and filters'
    },
    {
      id: 'recharge',
      title: 'Artificial Groundwater Recharge',
      subtitle: 'For Villages & Large Properties',
      description: 'Direct rainwater into underground pits to recharge groundwater aquifers. Increases water table levels and benefits the entire community.',
      icon: <Nature />,
      color: '#2e7d32',
      benefits: [
        'Increases groundwater levels',
        'Benefits entire community',
        'Long-term water security',
        'Ecological restoration'
      ],
      bestFor: 'Villages, farms, large properties with ground space',
      arDemo: 'Underground recharge pit with filtration layers'
    }
  ];

  const handleGoalSelect = (goalId) => {
    setGoal(goalId);
  };

  const handleSubmit = () => {
    if (goal) {
      onSubmit({ goal });
    }
  };

  return (
    <Box className="step-content">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h4" gutterBottom align="center" color="primary">
          🎯 What's Your Goal?
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Choose your rainwater harvesting objective
        </Typography>
      </motion.div>

      <Alert severity="info" sx={{ mb: 4 }}>
        <AlertTitle>Choose Based on Your Situation</AlertTitle>
        Your selection will determine the type of system we recommend and the AR visualization you'll see.
      </Alert>

      <Grid container spacing={3}>
        {goals.map((goalOption, index) => (
          <Grid item xs={12} md={6} key={goalOption.id}>
            <motion.div
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.2, duration: 0.6 }}
            >
              <Card
                elevation={goal === goalOption.id ? 8 : 2}
                sx={{
                  height: '100%',
                  border: goal === goalOption.id ? `3px solid ${goalOption.color}` : '2px solid transparent',
                  background: goal === goalOption.id 
                    ? `linear-gradient(135deg, ${goalOption.color}10, ${goalOption.color}05)`
                    : 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 24px ${goalOption.color}30`
                  }
                }}
              >
                <CardActionArea onClick={() => handleGoalSelect(goalOption.id)} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          backgroundColor: goalOption.color,
                          width: 56,
                          height: 56,
                          mr: 2
                        }}
                      >
                        {goalOption.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          {goalOption.title}
                        </Typography>
                        <Chip 
                          label={goalOption.subtitle}
                          size="small"
                          sx={{ 
                            backgroundColor: `${goalOption.color}20`,
                            color: goalOption.color,
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      {goal === goalOption.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Avatar sx={{ backgroundColor: goalOption.color, width: 32, height: 32 }}>
                            ✓
                          </Avatar>
                        </motion.div>
                      )}
                    </Box>

                    {/* Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                      {goalOption.description}
                    </Typography>

                    {/* Benefits */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Key Benefits:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {goalOption.benefits.map((benefit, idx) => (
                          <Typography key={idx} variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <WaterDrop sx={{ fontSize: '1rem', mr: 1, color: goalOption.color }} />
                            {benefit}
                          </Typography>
                        ))}
                      </Box>
                    </Box>

                    {/* Best For */}
                    <Alert 
                      severity="success" 
                      sx={{ 
                        backgroundColor: `${goalOption.color}10`,
                        border: `1px solid ${goalOption.color}30`
                      }}
                    >
                      <Typography variant="body2">
                        <strong>Best for:</strong> {goalOption.bestFor}
                      </Typography>
                    </Alert>

                    {/* AR Demo Info */}
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: 2,
                      border: `2px dashed ${goalOption.color}`
                    }}>
                      <Typography variant="body2" color="text.secondary" align="center">
                        <strong>AR Demo:</strong> {goalOption.arDemo}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Comparison Table */}
      {goal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card elevation={3} sx={{ mt: 4, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" align="center">
                📊 Quick Comparison
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Space Required</Typography>
                    <Typography variant="h6" color="primary">
                      {goal === 'storage' ? 'Rooftop Only' : 'Ground Space'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Water Access</Typography>
                    <Typography variant="h6" color="primary">
                      {goal === 'storage' ? 'Immediate' : 'Long-term'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Community Impact</Typography>
                    <Typography variant="h6" color="primary">
                      {goal === 'storage' ? 'Individual' : 'Community-wide'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBack />}
          size="large"
        >
          Back to Location
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          endIcon={<ArrowForward />}
          size="large"
          disabled={!goal}
          sx={{
            background: goal ? `linear-gradient(45deg, ${goals.find(g => g.id === goal)?.color}, ${goals.find(g => g.id === goal)?.color}80)` : undefined,
            px: 4
          }}
        >
          Continue to Property Details
        </Button>
      </Box>
    </Box>
  );
};

export default GoalSelection;
