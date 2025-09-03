const express = require('express');
const cors = require('cors');
const axios = require('axios');
const {
  calculateStorageCost,
  calculateRechargeCost,
  calculateMaintenanceCost,
  applyRoofEfficiency
} = require('./costDataset');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Erode district location data with real characteristics
const erodeLocations = {
  'erode': {
    coordinates: [11.3410, 77.7172],
    groundwater_depth: 8.5,
    soil_type: 'Loamy',
    aquifer_type: 'Mixed',
    rainfall_factor: 1.0
  },
  'gobichettipalayam': {
    coordinates: [11.4564, 77.4426],
    groundwater_depth: 12.3,
    soil_type: 'Clayey',
    aquifer_type: 'Hard Rock',
    rainfall_factor: 0.95
  },
  'bhavani': {
    coordinates: [11.4481, 77.6814],
    groundwater_depth: 6.8,
    soil_type: 'Mixed',
    aquifer_type: 'Alluvial',
    rainfall_factor: 1.05
  },
  'sathyamangalam': {
    coordinates: [11.5051, 77.2378],
    groundwater_depth: 15.2,
    soil_type: 'Rocky',
    aquifer_type: 'Hard Rock',
    rainfall_factor: 0.85
  },
  'anthiyur': {
    coordinates: [11.5751, 77.5901],
    groundwater_depth: 4.5,
    soil_type: 'Loamy',
    aquifer_type: 'Alluvial',
    rainfall_factor: 1.1
  },
  'chennimalai': {
    coordinates: [11.1694, 77.6047],
    groundwater_depth: 7.2,
    soil_type: 'Sandy',
    aquifer_type: 'Mixed',
    rainfall_factor: 0.98
  },
  'perundurai': {
    coordinates: [11.2761, 77.5831],
    groundwater_depth: 9.1,
    soil_type: 'Sandy',
    aquifer_type: 'Alluvial',
    rainfall_factor: 1.02
  },
  'kodumudi': {
    coordinates: [11.0789, 77.8856],
    groundwater_depth: 5.3,
    soil_type: 'Sandy',
    aquifer_type: 'Alluvial',
    rainfall_factor: 1.08
  }
};

// Space-aware structure recommendation logic
function recommendStructure(spaceLength, spaceWidth, groundwaterDepth, soilType, aquiferType) {
  const area = spaceLength * spaceWidth;
  const aspectRatio = Math.max(spaceLength, spaceWidth) / Math.min(spaceLength, spaceWidth);
  
  // Safety check - groundwater level
  if (groundwaterDepth < 2) {
    return {
      structure: 'not_recommended',
      reason: 'Groundwater too shallow - risk of contamination',
      feasibility: 'Not Recommended'
    };
  }
  
  // Space-based logic
  if (area < 4) {
    // Very limited space
    if (aquiferType === 'Hard Rock') {
      return {
        structure: 'recharge_shaft',
        reason: 'Deep shaft suitable for hard rock aquifer and limited space',
        feasibility: 'Limited Feasibility'
      };
    } else {
      return {
        structure: 'storage_tank',
        reason: 'Storage tank recommended for very limited space',
        feasibility: 'Limited Feasibility'
      };
    }
  } else if (aspectRatio > 3) {
    // Long and narrow space
    return {
      structure: 'recharge_trench',
      reason: 'Trench optimal for long narrow spaces',
      feasibility: 'Feasible'
    };
  } else {
    // Square/rectangular space
    if (soilType === 'Clayey' && area > 10) {
      return {
        structure: 'recharge_trench',
        reason: 'Trench preferred for clayey soil to maximize surface area',
        feasibility: 'Feasible'
      };
    } else {
      return {
        structure: 'recharge_pit',
        reason: 'Pit is most cost-effective for this space configuration',
        feasibility: 'Feasible'
      };
    }
  }
}

// Calculate optimized dimensions based on space and structure type
function calculateDimensions(structure, spaceLength, spaceWidth, volume, groundwaterDepth) {
  const maxDepth = Math.min(groundwaterDepth - 1, 4); // 1m above groundwater, max 4m
  
  switch (structure) {
    case 'recharge_pit':
      const pitDepth = Math.min(maxDepth, 3);
      const pitArea = Math.min(volume / pitDepth, spaceLength * spaceWidth * 0.8);
      const pitSide = Math.sqrt(pitArea);
      return {
        length: Math.min(pitSide, spaceLength * 0.9),
        width: Math.min(pitSide, spaceWidth * 0.9),
        depth: pitDepth,
        volume: pitArea * pitDepth
      };
      
    case 'recharge_trench':
      const trenchDepth = Math.min(maxDepth, 2.5);
      const trenchWidth = Math.min(1.5, spaceWidth * 0.8);
      const trenchLength = Math.min(volume / (trenchDepth * trenchWidth), spaceLength * 0.9);
      return {
        length: trenchLength,
        width: trenchWidth,
        depth: trenchDepth,
        volume: trenchLength * trenchWidth * trenchDepth
      };
      
    case 'recharge_shaft':
      const shaftDepth = Math.min(maxDepth, 6);
      const shaftArea = Math.min(volume / shaftDepth, 4); // Max 2m x 2m shaft
      const shaftSide = Math.sqrt(shaftArea);
      return {
        length: shaftSide,
        width: shaftSide,
        depth: shaftDepth,
        volume: shaftArea * shaftDepth
      };
      
    case 'storage_tank':
      const tankHeight = 2.5; // Standard tank height
      const tankArea = volume / tankHeight;
      const tankSide = Math.sqrt(tankArea);
      return {
        length: Math.min(tankSide, spaceLength * 0.7),
        width: Math.min(tankSide, spaceWidth * 0.7),
        depth: tankHeight,
        volume: tankArea * tankHeight
      };
      
    default:
      return {
        length: 0,
        width: 0,
        depth: 0,
        volume: 0
      };
  }
}

// Enhanced cost calculation with dataset and roof type efficiency
function calculateCost(structure, dimensions, soilType, spaceLength, spaceWidth, roofType, goal) {
  const volume = dimensions.volume;
  const depth = dimensions.depth;

  let costResult;

  if (goal === 'storage') {
    // Calculate storage system cost
    costResult = calculateStorageCost(volume, 'plastic');
  } else {
    // Calculate recharge structure cost
    const structureType = structure.includes('pit') ? 'pit' :
                         structure.includes('trench') ? 'trench' : 'shaft';
    costResult = calculateRechargeCost(volume, structureType, depth);
  }

  // Apply soil difficulty multipliers
  const soilMultipliers = {
    'Sandy': 1.0,
    'Loamy': 1.2,
    'Clayey': 1.5,
    'Rocky': 2.0,
    'Mixed': 1.3
  };

  // Space constraint multiplier
  const spaceArea = spaceLength * spaceWidth;
  const spaceMultiplier = spaceArea < 10 ? 1.3 : (spaceArea < 25 ? 1.1 : 1.0);

  const soilMultiplier = soilMultipliers[soilType] || 1.2;

  // Calculate final cost with multipliers
  const adjustedCost = costResult.cost * soilMultiplier * spaceMultiplier;

  // Calculate maintenance cost
  const systemType = goal === 'storage' ? 'storage' : 'recharge';
  const maintenanceCost = calculateMaintenanceCost(systemType, volume);

  return {
    total_cost: Math.round(adjustedCost),
    breakdown: {
      ...costResult.breakdown,
      soilAdjustment: Math.round(costResult.cost * (soilMultiplier - 1)),
      spaceAdjustment: Math.round(costResult.cost * (spaceMultiplier - 1)),
      annualMaintenance: Math.round(maintenanceCost)
    },
    description: costResult.description,
    paybackPeriod: calculatePaybackPeriod(adjustedCost, volume, roofType)
  };
}

// Calculate payback period based on water savings
function calculatePaybackPeriod(totalCost, volume, roofType) {
  // Average water cost in Tamil Nadu: ₹15 per 1000 liters
  const waterCostPerLiter = 0.015;

  // Apply roof efficiency
  const roofEfficiency = applyRoofEfficiency(volume, roofType);
  const effectiveVolume = roofEfficiency.adjustedWater;

  // Annual water savings (assuming 70% utilization)
  const annualSavings = effectiveVolume * 0.7 * waterCostPerLiter * 12; // 12 months

  if (annualSavings <= 0) return 999; // Invalid case

  return Math.round((totalCost / annualSavings) * 10) / 10; // Round to 1 decimal
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RWH-Erode Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Get location data
app.get('/api/locations', (req, res) => {
  const locations = Object.keys(erodeLocations).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    ...erodeLocations[key]
  }));
  
  res.json({
    locations,
    total: locations.length
  });
});

// Main assessment endpoint with space-aware logic
app.post('/api/assess', async (req, res) => {
  try {
    const {
      location,
      roofArea,
      householdSize,
      roofType,
      goal,
      spaceLength,
      spaceWidth
    } = req.body;
    
    // Validate input
    if (!location || !roofArea || !householdSize || !roofType || !goal || !spaceLength || !spaceWidth) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['location', 'roofArea', 'householdSize', 'roofType', 'goal', 'spaceLength', 'spaceWidth']
      });
    }
    
    // Get location data
    const locationKey = location.toLowerCase();
    const locationData = erodeLocations[locationKey];
    
    if (!locationData) {
      return res.status(400).json({
        error: 'Location not found',
        availableLocations: Object.keys(erodeLocations)
      });
    }
    
    // Try to get ML prediction first
    let mlPrediction = null;
    try {
      const mlResponse = await axios.post('http://localhost:5001/predict', {
        roof_area: roofArea,
        household_size: householdSize,
        location: location,
        space_length: spaceLength,
        space_width: spaceWidth
      }, { timeout: 5000 });
      
      mlPrediction = mlResponse.data;
    } catch (mlError) {
      console.log('ML API not available, using fallback logic');
    }
    
    // If ML prediction available, use it; otherwise use our logic
    if (mlPrediction) {
      // Enhance ML prediction with space-aware logic
      const spaceRecommendation = recommendStructure(
        spaceLength,
        spaceWidth,
        locationData.groundwater_depth,
        locationData.soil_type,
        locationData.aquifer_type
      );
      
      res.json({
        ...mlPrediction,
        space_analysis: {
          available_area: spaceLength * spaceWidth,
          aspect_ratio: Math.max(spaceLength, spaceWidth) / Math.min(spaceLength, spaceWidth),
          space_recommendation: spaceRecommendation.structure,
          space_reason: spaceRecommendation.reason
        },
        enhanced_by: 'space_aware_logic'
      });
    } else {
      // Fallback calculation
      const averageRainfall = 775; // mm for Erode
      const runoffCoefficient = 0.8;
      const annualHarvestable = roofArea * averageRainfall * runoffCoefficient * locationData.rainfall_factor;
      
      // Calculate required storage (30% of annual harvestable)
      const requiredVolume = Math.max(annualHarvestable * 0.3, householdSize * 500);
      
      // Get structure recommendation
      const recommendation = recommendStructure(
        spaceLength,
        spaceWidth,
        locationData.groundwater_depth,
        locationData.soil_type,
        locationData.aquifer_type
      );
      
      // Calculate dimensions
      const dimensions = calculateDimensions(
        recommendation.structure,
        spaceLength,
        spaceWidth,
        requiredVolume,
        locationData.groundwater_depth
      );
      
      // Apply roof efficiency to harvestable water
      const roofEfficiency = applyRoofEfficiency(annualHarvestable, roofType);

      // Calculate cost
      const costResult = calculateCost(
        recommendation.structure,
        dimensions,
        locationData.soil_type,
        spaceLength,
        spaceWidth,
        roofType,
        goal
      );
      
      // Calculate metrics with roof efficiency
      const adjustedHarvestable = roofEfficiency.adjustedWater;
      const storageEfficiency = (dimensions.volume / adjustedHarvestable) * 100;
      const costPerLiter = costResult.total_cost / dimensions.volume;
      
      res.json({
        feasibility: recommendation.feasibility,
        recommended_structure: recommendation.structure.replace('_', ' '),
        recommendation_reason: recommendation.reason,
        dimensions: {
          length: Math.round(dimensions.length * 100) / 100,
          width: Math.round(dimensions.width * 100) / 100,
          depth: Math.round(dimensions.depth * 100) / 100,
          volume: Math.round(dimensions.volume)
        },
        cost_estimation: {
          total_cost: costResult.total_cost,
          cost_per_liter: Math.round(costPerLiter * 100) / 100,
          payback_period_years: costResult.paybackPeriod,
          breakdown: costResult.breakdown,
          description: costResult.description
        },
        water_harvesting: {
          annual_harvestable: Math.round(annualHarvestable),
          roof_adjusted_harvestable: Math.round(adjustedHarvestable),
          roof_efficiency: roofEfficiency.efficiency,
          roof_type: roofType,
          storage_efficiency: Math.round(storageEfficiency * 10) / 10,
          annual_savings: Math.round(annualSavings)
        },
        location_info: {
          groundwater_depth: locationData.groundwater_depth,
          dominant_soil_type: locationData.soil_type,
          aquifer_type: locationData.aquifer_type
        },
        space_analysis: {
          available_area: spaceLength * spaceWidth,
          aspect_ratio: Math.max(spaceLength, spaceWidth) / Math.min(spaceLength, spaceWidth),
          space_utilization: (dimensions.length * dimensions.width) / (spaceLength * spaceWidth) * 100
        },
        runoff_coefficient: runoffCoefficient,
        data_source: 'backend_calculation'
      });
    }
    
  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    availableRoutes: [
      'GET /api/health',
      'GET /api/locations',
      'POST /api/assess'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RWH-Erode Backend API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗺️  Locations: http://localhost:${PORT}/api/locations`);
  console.log(`🏠 Assessment: POST http://localhost:${PORT}/api/assess`);
});
