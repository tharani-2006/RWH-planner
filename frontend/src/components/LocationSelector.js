import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  AlertTitle
} from '@mui/material';
import { Search, LocationOn, CheckCircle } from '@mui/icons-material';

// Erode district locations with their characteristics
const erodeLocations = [
  {
    id: 'erode',
    name: 'Erode',
    type: 'City',
    population: 'Large',
    groundwater: 'Medium',
    soil: 'Loamy',
    coordinates: [11.3410, 77.7172],
    description: 'District headquarters with mixed urban-rural areas'
  },
  {
    id: 'gobichettipalayam',
    name: 'Gobichettipalayam',
    type: 'Town',
    population: 'Medium',
    groundwater: 'Deep',
    soil: 'Clayey',
    coordinates: [11.4564, 77.4426],
    description: 'Industrial town with textile manufacturing'
  },
  {
    id: 'bhavani',
    name: 'Bhavani',
    type: 'Town',
    population: 'Medium',
    groundwater: 'Medium',
    soil: 'Mixed',
    coordinates: [11.4481, 77.6814],
    description: 'Historic town at river confluence'
  },
  {
    id: 'sathyamangalam',
    name: 'Sathyamangalam',
    type: 'Town',
    population: 'Medium',
    groundwater: 'Deep',
    soil: 'Rocky',
    coordinates: [11.5051, 77.2378],
    description: 'Forest border town with wildlife sanctuary'
  },
  {
    id: 'anthiyur',
    name: 'Anthiyur',
    type: 'Village',
    population: 'Small',
    groundwater: 'Shallow',
    soil: 'Loamy',
    coordinates: [11.5751, 77.5901],
    description: 'Agricultural village with good water table'
  },
  {
    id: 'chennimalai',
    name: 'Chennimalai',
    type: 'Town',
    population: 'Small',
    groundwater: 'Medium',
    soil: 'Sandy',
    coordinates: [11.1694, 77.6047],
    description: 'Handloom weaving center'
  },
  {
    id: 'perundurai',
    name: 'Perundurai',
    type: 'Town',
    population: 'Medium',
    groundwater: 'Medium',
    soil: 'Sandy',
    coordinates: [11.2761, 77.5831],
    description: 'Railway junction town'
  },
  {
    id: 'kodumudi',
    name: 'Kodumudi',
    type: 'Village',
    population: 'Small',
    groundwater: 'Shallow',
    soil: 'Sandy',
    coordinates: [11.0789, 77.8856],
    description: 'Riverside village with good infiltration'
  }
];

const LocationSelector = ({ onLocationSelect, selectedLocation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(erodeLocations);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = erodeLocations.filter(location =>
      location.name.toLowerCase().includes(term) ||
      location.type.toLowerCase().includes(term) ||
      location.description.toLowerCase().includes(term)
    );
    setFilteredLocations(filtered);
  };

  const handleLocationClick = (location) => {
    onLocationSelect(location.id, location.name, location.coordinates);
  };

  const getGroundwaterColor = (level) => {
    switch (level) {
      case 'Shallow': return '#4caf50';
      case 'Medium': return '#ff9800';
      case 'Deep': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getSoilColor = (soil) => {
    switch (soil) {
      case 'Sandy': return '#ffc107';
      case 'Loamy': return '#8bc34a';
      case 'Clayey': return '#795548';
      case 'Rocky': return '#607d8b';
      case 'Mixed': return '#9c27b0';
      default: return '#9e9e9e';
    }
  };

  return (
    <Box className="step-content">
      <Typography variant="h5" gutterBottom align="center" color="primary">
        📍 Select Your Location in Erode District
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Location-Specific Analysis</AlertTitle>
        Each location in Erode has unique groundwater levels and soil conditions. 
        Select your area for personalized recommendations.
      </Alert>

      <TextField
        fullWidth
        placeholder="Search locations in Erode district..."
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={2}>
        {filteredLocations.map((location) => (
          <Grid item xs={12} sm={6} md={4} key={location.id}>
            <Card 
              className={`location-card ${selectedLocation === location.id ? 'selected' : ''}`}
              elevation={selectedLocation === location.id ? 8 : 2}
            >
              <CardActionArea onClick={() => handleLocationClick(location)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h3">
                      {location.name}
                    </Typography>
                    {selectedLocation === location.id && (
                      <CheckCircle color="primary" sx={{ ml: 'auto' }} />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {location.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    <Chip 
                      label={location.type} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      label={`${location.population} Population`} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      label={`${location.groundwater} Groundwater`}
                      size="small"
                      sx={{ 
                        backgroundColor: getGroundwaterColor(location.groundwater),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    <Chip 
                      label={`${location.soil} Soil`}
                      size="small"
                      sx={{ 
                        backgroundColor: getSoilColor(location.soil),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredLocations.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No locations found matching "{searchTerm}"
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try searching for towns, villages, or area types in Erode district
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          💡 <strong>Tip:</strong> Each location has been analyzed for groundwater depth and soil composition 
          to provide you with the most accurate rainwater harvesting recommendations.
        </Typography>
      </Box>
    </Box>
  );
};

export default LocationSelector;
