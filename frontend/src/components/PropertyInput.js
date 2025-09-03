import React, { useState } from 'react';
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
  Slider,
  Chip
} from '@mui/material';
import { Home, People, ArrowBack, ArrowForward, Calculate } from '@mui/icons-material';

const PropertyInput = ({ onSubmit, onBack, initialData, goal }) => {
  const [roofArea, setRoofArea] = useState(initialData?.roofArea || '');
  const [householdSize, setHouseholdSize] = useState(initialData?.householdSize || 4);
  const [roofType, setRoofType] = useState(initialData?.roofType || '');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!roofArea || parseFloat(roofArea) <= 0) {
      newErrors.roofArea = 'Please enter a valid roof area';
    } else if (parseFloat(roofArea) > 10000) {
      newErrors.roofArea = 'Roof area seems too large. Please check your input.';
    }
    
    if (householdSize < 1 || householdSize > 50) {
      newErrors.householdSize = 'Household size should be between 1 and 50';
    }

    if (!roofType) {
      newErrors.roofType = 'Please select your roof type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        roofArea: parseFloat(roofArea),
        householdSize: parseInt(householdSize),
        roofType: roofType
      });
    }
  };

  const calculatePotentialWater = () => {
    if (roofArea) {
      // Using 775mm average rainfall for Erode and 0.8 runoff coefficient
      const annualPotential = parseFloat(roofArea) * 775 * 0.8;
      return Math.round(annualPotential);
    }
    return 0;
  };

  const getHouseholdSizeLabel = (size) => {
    if (size <= 2) return 'Small Family';
    if (size <= 5) return 'Medium Family';
    if (size <= 8) return 'Large Family';
    return 'Extended Family';
  };

  const getRoofAreaCategory = (area) => {
    if (area <= 50) return 'Small House';
    if (area <= 150) return 'Medium House';
    if (area <= 300) return 'Large House';
    return 'Very Large Property';
  };

  return (
    <Box className="step-content">
      <Typography variant="h5" gutterBottom align="center" color="primary">
        🏠 Tell Us About Your Property
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Why We Need This Information</AlertTitle>
        {goal === 'storage'
          ? 'Roof area determines tank size needed, and household size helps calculate daily water requirements for storage.'
          : 'Roof area determines recharge potential, and household size helps us size the recharge structure for your water needs.'
        }
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Home color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Roof Area</Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Roof Area"
                value={roofArea}
                onChange={(e) => setRoofArea(e.target.value)}
                error={!!errors.roofArea}
                helperText={errors.roofArea || 'Enter the total roof area of your building'}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                }}
                sx={{ mb: 2 }}
              />
              
              {roofArea && !errors.roofArea && (
                <Box>
                  <Chip 
                    label={getRoofAreaCategory(parseFloat(roofArea))}
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Alert severity="success" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <Calculate sx={{ fontSize: '1rem', mr: 1 }} />
                      Potential annual collection: <strong>{calculatePotentialWater().toLocaleString()} liters</strong>
                    </Typography>
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Household Size</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Number of people living in your household
              </Typography>
              
              <Box sx={{ px: 2 }}>
                <Slider
                  value={householdSize}
                  onChange={(e, newValue) => setHouseholdSize(newValue)}
                  min={1}
                  max={15}
                  step={1}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 5, label: '5' },
                    { value: 10, label: '10' },
                    { value: 15, label: '15+' }
                  ]}
                  valueLabelDisplay="on"
                  sx={{ mb: 2 }}
                />
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Chip 
                  label={`${householdSize} people - ${getHouseholdSizeLabel(householdSize)}`}
                  color="secondary"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Daily water need: ~{householdSize * 150} liters
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Roof Type Selection */}
        <Grid item xs={12}>
          <Card elevation={2} sx={{ border: errors.roofType ? '2px solid #f44336' : '2px solid transparent' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Home color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Roof Type</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Different roof types have different water collection efficiency
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card
                    elevation={roofType === 'non_absorptive' ? 4 : 1}
                    sx={{
                      cursor: 'pointer',
                      border: roofType === 'non_absorptive' ? '3px solid #1976d2' : '2px solid #e0e0e0',
                      background: roofType === 'non_absorptive' ? '#e3f2fd' : 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}
                    onClick={() => setRoofType('non_absorptive')}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h4" sx={{ mb: 1 }}>🏢</Typography>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Non-Absorptive
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Concrete, Metal Sheets, Tiles
                      </Typography>
                      <Chip
                        label="95% Collection Efficiency"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
                        Best for maximum water collection
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card
                    elevation={roofType === 'absorptive' ? 4 : 1}
                    sx={{
                      cursor: 'pointer',
                      border: roofType === 'absorptive' ? '3px solid #2e7d32' : '2px solid #e0e0e0',
                      background: roofType === 'absorptive' ? '#e8f5e8' : 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}
                    onClick={() => setRoofType('absorptive')}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h4" sx={{ mb: 1 }}>🏠</Typography>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Absorptive
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Mud, Porous Tiles, Thatch
                      </Typography>
                      <Chip
                        label="75% Collection Efficiency"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
                        Natural materials, lower efficiency
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {errors.roofType && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.roofType}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {roofArea && householdSize && roofType && !errors.roofArea && (
        <Card elevation={3} sx={{ mt: 3, background: 'linear-gradient(135deg, #e8f5e8 0%, #f3e5f5 100%)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              📊 Quick Assessment
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {calculatePotentialWater().toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Liters/year potential
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary">
                    {Math.round(calculatePotentialWater() / (householdSize * 150 * 365) * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Of annual water needs
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {Math.round(calculatePotentialWater() / 365)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Liters/day average
                  </Typography>
                </Box>
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
        >
          Back to Location
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          endIcon={<ArrowForward />}
          size="large"
          disabled={!roofArea || !householdSize || Object.keys(errors).length > 0}
        >
          Next: Available Space
        </Button>
      </Box>
    </Box>
  );
};

export default PropertyInput;
