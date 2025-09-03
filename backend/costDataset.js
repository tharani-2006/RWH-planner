// Indian Standard Cost Dataset for Rainwater Harvesting Components
// All costs in INR (Indian Rupees) - 2024 rates

const costDataset = {
  // Storage Tanks (per liter capacity)
  storageTanks: {
    plastic: {
      small: { capacity: [500, 2000], costPerLiter: 12, description: "HDPE/PVC tanks" },
      medium: { capacity: [2000, 10000], costPerLiter: 10, description: "Rotomolded tanks" },
      large: { capacity: [10000, 50000], costPerLiter: 8, description: "Industrial grade tanks" }
    },
    cement: {
      small: { capacity: [1000, 5000], costPerLiter: 15, description: "RCC overhead tanks" },
      medium: { capacity: [5000, 20000], costPerLiter: 12, description: "Underground cement tanks" },
      large: { capacity: [20000, 100000], costPerLiter: 10, description: "Large RCC structures" }
    },
    metal: {
      small: { capacity: [500, 3000], costPerLiter: 18, description: "Stainless steel tanks" },
      medium: { capacity: [3000, 15000], costPerLiter: 15, description: "Galvanized steel tanks" },
      large: { capacity: [15000, 50000], costPerLiter: 12, description: "Industrial steel tanks" }
    }
  },

  // Recharge Structures (per cubic meter)
  rechargeStructures: {
    pit: {
      shallow: { depth: [1, 3], costPerCubicMeter: 2500, description: "Basic recharge pit with filter media" },
      medium: { depth: [3, 6], costPerCubicMeter: 3000, description: "Standard recharge pit with layers" },
      deep: { depth: [6, 12], costPerCubicMeter: 3500, description: "Deep recharge pit with bore connection" }
    },
    trench: {
      shallow: { depth: [0.5, 1.5], costPerCubicMeter: 2000, description: "Surface recharge trench" },
      medium: { depth: [1.5, 3], costPerCubicMeter: 2500, description: "Standard recharge trench" },
      deep: { depth: [3, 5], costPerCubicMeter: 3000, description: "Deep infiltration trench" }
    },
    shaft: {
      small: { diameter: [1, 2], costPerMeter: 8000, description: "Small diameter recharge shaft" },
      medium: { diameter: [2, 3], costPerMeter: 12000, description: "Medium diameter recharge shaft" },
      large: { diameter: [3, 5], costPerMeter: 18000, description: "Large diameter recharge shaft" }
    }
  },

  // Filtration Systems
  filters: {
    firstFlush: {
      basic: { capacity: [100, 500], cost: 3500, description: "Basic first flush diverter" },
      advanced: { capacity: [500, 2000], cost: 8000, description: "Automatic first flush diverter" },
      commercial: { capacity: [2000, 10000], cost: 15000, description: "Commercial grade diverter" }
    },
    sandFilter: {
      small: { flowRate: [1, 5], cost: 5000, description: "Small sand filter unit" },
      medium: { flowRate: [5, 20], cost: 12000, description: "Medium sand filter system" },
      large: { flowRate: [20, 100], cost: 25000, description: "Large sand filter system" }
    },
    carbonFilter: {
      basic: { capacity: [500, 2000], cost: 8000, description: "Activated carbon filter" },
      advanced: { capacity: [2000, 10000], cost: 18000, description: "Multi-stage carbon filter" }
    }
  },

  // Piping and Accessories (per meter/unit)
  piping: {
    pvc: {
      small: { diameter: [25, 50], costPerMeter: 120, description: "PVC pipes 25-50mm" },
      medium: { diameter: [75, 100], costPerMeter: 180, description: "PVC pipes 75-100mm" },
      large: { diameter: [125, 200], costPerMeter: 280, description: "PVC pipes 125-200mm" }
    },
    hdpe: {
      small: { diameter: [25, 50], costPerMeter: 150, description: "HDPE pipes 25-50mm" },
      medium: { diameter: [75, 100], costPerMeter: 220, description: "HDPE pipes 75-100mm" },
      large: { diameter: [125, 200], costPerMeter: 350, description: "HDPE pipes 125-200mm" }
    }
  },

  // Pumps and Motors
  pumps: {
    submersible: {
      small: { power: [0.5, 1], cost: 8000, description: "0.5-1 HP submersible pump" },
      medium: { power: [1, 3], cost: 15000, description: "1-3 HP submersible pump" },
      large: { power: [3, 7.5], cost: 35000, description: "3-7.5 HP submersible pump" }
    },
    centrifugal: {
      small: { power: [0.5, 1], cost: 6000, description: "0.5-1 HP centrifugal pump" },
      medium: { power: [1, 3], cost: 12000, description: "1-3 HP centrifugal pump" },
      large: { power: [3, 7.5], cost: 28000, description: "3-7.5 HP centrifugal pump" }
    }
  },

  // Labor Costs (per day/activity)
  labor: {
    excavation: { costPerCubicMeter: 800, description: "Manual excavation work" },
    masonry: { costPerDay: 1200, description: "Skilled mason work" },
    plumbing: { costPerDay: 1000, description: "Plumbing installation" },
    electrical: { costPerDay: 1500, description: "Electrical connections" },
    supervision: { costPerDay: 2000, description: "Technical supervision" }
  },

  // Maintenance Costs (annual)
  maintenance: {
    storage: {
      cleaning: { costPerYear: 2000, description: "Tank cleaning and disinfection" },
      pumpMaintenance: { costPerYear: 3000, description: "Pump servicing and repairs" },
      pipeReplacement: { costPerYear: 1500, description: "Pipe maintenance and replacement" }
    },
    recharge: {
      desilting: { costPerYear: 5000, description: "Pit/trench desilting" },
      filterReplacement: { costPerYear: 3000, description: "Filter media replacement" },
      inspection: { costPerYear: 1000, description: "Annual inspection and minor repairs" }
    }
  },

  // Regional Multipliers for different states/regions
  regionalMultipliers: {
    tamilnadu: {
      erode: 1.0,
      chennai: 1.3,
      coimbatore: 1.1,
      madurai: 0.9,
      salem: 0.95
    },
    kerala: 1.2,
    karnataka: 1.1,
    andhraPradesh: 0.9,
    telangana: 1.0
  },

  // Roof Type Efficiency Factors
  roofEfficiency: {
    non_absorptive: {
      factor: 0.95,
      description: "Concrete, metal sheets, tiles - 95% collection efficiency"
    },
    absorptive: {
      factor: 0.75,
      description: "Mud, porous tiles, thatch - 75% collection efficiency"
    }
  }
};

// Cost Calculation Functions
const calculateStorageCost = (capacity, material = 'plastic') => {
  const tanks = costDataset.storageTanks[material];
  let selectedTank;
  
  for (const [size, specs] of Object.entries(tanks)) {
    if (capacity >= specs.capacity[0] && capacity <= specs.capacity[1]) {
      selectedTank = specs;
      break;
    }
  }
  
  if (!selectedTank) {
    // Use large category for very large capacities
    selectedTank = tanks.large;
  }
  
  return {
    cost: capacity * selectedTank.costPerLiter,
    description: selectedTank.description,
    breakdown: {
      tankCost: capacity * selectedTank.costPerLiter,
      installation: capacity * selectedTank.costPerLiter * 0.2,
      accessories: 5000
    }
  };
};

const calculateRechargeCost = (volume, type = 'pit', depth = 3) => {
  const structures = costDataset.rechargeStructures[type];
  let selectedStructure;
  
  if (type === 'shaft') {
    // For shaft, calculate based on depth and diameter
    const diameter = Math.sqrt(volume / (Math.PI * depth / 4));
    selectedStructure = structures.medium; // Default to medium
    return {
      cost: depth * selectedStructure.costPerMeter,
      description: selectedStructure.description,
      breakdown: {
        excavation: volume * costDataset.labor.excavation.costPerCubicMeter,
        structure: depth * selectedStructure.costPerMeter * 0.6,
        filterMedia: volume * 500,
        accessories: 8000
      }
    };
  } else {
    // For pit and trench
    for (const [size, specs] of Object.entries(structures)) {
      if (depth >= specs.depth[0] && depth <= specs.depth[1]) {
        selectedStructure = specs;
        break;
      }
    }
    
    if (!selectedStructure) {
      selectedStructure = structures.medium;
    }
    
    return {
      cost: volume * selectedStructure.costPerCubicMeter,
      description: selectedStructure.description,
      breakdown: {
        excavation: volume * costDataset.labor.excavation.costPerCubicMeter,
        structure: volume * selectedStructure.costPerCubicMeter * 0.5,
        filterMedia: volume * 800,
        accessories: 5000
      }
    };
  }
};

const calculateMaintenanceCost = (systemType, capacity) => {
  const maintenance = costDataset.maintenance[systemType];
  let totalCost = 0;
  
  for (const [activity, specs] of Object.entries(maintenance)) {
    totalCost += specs.costPerYear;
  }
  
  // Scale based on capacity
  const scaleFactor = Math.max(1, capacity / 5000);
  return totalCost * scaleFactor;
};

const applyRoofEfficiency = (collectedWater, roofType) => {
  const efficiency = costDataset.roofEfficiency[roofType];
  return {
    adjustedWater: collectedWater * efficiency.factor,
    efficiency: efficiency.factor,
    description: efficiency.description
  };
};

module.exports = {
  costDataset,
  calculateStorageCost,
  calculateRechargeCost,
  calculateMaintenanceCost,
  applyRoofEfficiency
};
