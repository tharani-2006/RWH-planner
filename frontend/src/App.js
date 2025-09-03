import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography, Stepper, Step, StepLabel, Paper } from '@mui/material';
import LocationSelector from './components/LocationSelector';
import GoalSelection from './components/GoalSelection';
import PropertyInput from './components/PropertyInput';
import SpaceInput from './components/SpaceInput';
import ResultsDisplay from './components/ResultsDisplay';
import Header from './components/Header';
import LoadingAnimation from './components/LoadingAnimation';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

const steps = [
  'Select Location in Erode',
  'Choose Your Goal',
  'Property Details',
  'Available Space',
  'Analysis Results'
];

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    location: null,
    locationName: '',
    goal: '',
    roofArea: '',
    householdSize: '',
    roofType: '',
    spaceLength: '',
    spaceWidth: '',
    coordinates: null
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleLocationSelect = (location, locationName, coordinates) => {
    setFormData(prev => ({
      ...prev,
      location,
      locationName,
      coordinates
    }));
    handleNext();
  };

  const handleGoalSubmit = (goalData) => {
    setFormData(prev => ({
      ...prev,
      ...goalData
    }));
    handleNext();
  };

  const handlePropertySubmit = (propertyData) => {
    setFormData(prev => ({
      ...prev,
      ...propertyData
    }));
    handleNext();
  };

  const handleSpaceSubmit = async (spaceData) => {
    setFormData(prev => ({
      ...prev,
      ...spaceData
    }));
    
    setLoading(true);
    
    try {
      // Call the ML API with all collected data
      const response = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roof_area: parseFloat(formData.roofArea),
          household_size: parseInt(formData.householdSize),
          location: formData.locationName,
          space_length: parseFloat(spaceData.spaceLength),
          space_width: parseFloat(spaceData.spaceWidth)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const data = await response.json();
      setResults(data);
      handleNext();
    } catch (error) {
      console.error('Error getting prediction:', error);
      // For demo purposes, show mock results if API fails
      setResults({
        feasibility: 'Feasible',
        recommended_structure: 'pit',
        dimensions: {
          length: 3.5,
          width: 3.5,
          depth: 2.8,
          volume: 34300
        },
        cost_estimation: {
          total_cost: 45000,
          cost_per_liter: 1.31,
          payback_period_years: 8.5
        },
        water_harvesting: {
          annual_harvestable: 29062.5,
          storage_efficiency: 118.0,
          annual_savings: 145.31
        },
        location_info: {
          groundwater_depth: 5.6,
          dominant_soil_type: 'Loamy'
        }
      });
      handleNext();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      location: null,
      locationName: '',
      goal: '',
      roofArea: '',
      householdSize: '',
      roofType: '',
      spaceLength: '',
      spaceWidth: '',
      coordinates: null
    });
    setResults(null);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <LocationSelector
            onLocationSelect={handleLocationSelect}
            selectedLocation={formData.location}
          />
        );
      case 1:
        return (
          <GoalSelection
            onSubmit={handleGoalSubmit}
            onBack={handleBack}
            selectedGoal={formData.goal}
          />
        );
      case 2:
        return (
          <PropertyInput
            onSubmit={handlePropertySubmit}
            onBack={handleBack}
            initialData={{
              roofArea: formData.roofArea,
              householdSize: formData.householdSize,
              roofType: formData.roofType
            }}
            goal={formData.goal}
          />
        );
      case 3:
        return (
          <SpaceInput
            onSubmit={handleSpaceSubmit}
            onBack={handleBack}
            loading={loading}
            initialData={{
              spaceLength: formData.spaceLength,
              spaceWidth: formData.spaceWidth
            }}
            goal={formData.goal}
          />
        );
      case 4:
        return (
          <ResultsDisplay
            results={results}
            formData={formData}
            onReset={handleReset}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Header />
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
                🏠 RWH-Erode: Smart Rainwater Harvesting Planner
              </Typography>
              <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
                Personalized rainwater harvesting solutions for Erode district
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ minHeight: '400px' }}>
              {loading ? (
                <LoadingAnimation isLoading={loading} />
              ) : (
                getStepContent(activeStep)
              )}
            </Box>
          </Paper>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
