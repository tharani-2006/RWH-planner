import numpy as np
import pandas as pd
from tensorflow import keras
import joblib
import json

class SimplePredictionService:
    def __init__(self, model_dir='models'):
        self.model_dir = model_dir
        self.models = {}
        self.scaler = None
        self.label_encoders = {}
        self.metadata = {}
        self.average_rainfall = 775  # mm per year for Erode
        
        self.load_models()
        self.load_location_data()
    
    def load_models(self):
        """Load all trained models and preprocessors"""
        try:
            # Load metadata
            with open(f'{self.model_dir}/metadata.json', 'r') as f:
                self.metadata = json.load(f)
            
            # Load preprocessors
            self.scaler = joblib.load(f'{self.model_dir}/scaler.pkl')
            self.label_encoders = joblib.load(f'{self.model_dir}/label_encoders.pkl')
            
            # Load Keras models
            for model_name in self.metadata['models']:
                model_path = f'{self.model_dir}/{model_name}_model.keras'
                self.models[model_name] = keras.models.load_model(model_path)
            
            print(f"✅ Loaded {len(self.models)} models successfully")
            
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            raise
    
    def load_location_data(self):
        """Load groundwater and soil data for location lookup"""
        try:
            # Load groundwater data
            gw_df = pd.read_csv('../Station Ground Water Level Information (1).csv', skiprows=1)
            gw_df = gw_df.dropna()
            
            def extract_avg_depth(range_str):
                try:
                    if ' - ' in str(range_str):
                        parts = str(range_str).split(' - ')
                        return (float(parts[0]) + float(parts[1])) / 2
                    else:
                        return float(range_str)
                except:
                    return np.nan
            
            gw_df['avg_groundwater_depth'] = gw_df['Observed Range of Water Level'].apply(extract_avg_depth)
            gw_df = gw_df.dropna(subset=['avg_groundwater_depth'])
            gw_df['location'] = gw_df['Station'].str.replace(r'(_\d+|Pz|_Pz)', '', regex=True)
            
            # Load soil data
            soil_df = pd.read_csv('../erode_soil_dataset.csv')
            soil_df = soil_df.dropna(subset=['Town'])
            soil_df = soil_df[soil_df['Town'] != '']
            
            self.gw_data = gw_df
            self.soil_data = soil_df
            
            print(f"✅ Loaded location data: {len(gw_df)} groundwater stations, {len(soil_df)} soil locations")
            
        except Exception as e:
            print(f"❌ Error loading location data: {e}")
            # Use default data
            self.gw_data = None
            self.soil_data = None
    
    def get_location_info(self, location_name):
        """Get groundwater and soil information for a location"""
        
        if self.gw_data is None or self.soil_data is None:
            return self.get_default_location_info()
        
        # Find groundwater data
        gw_match = self.gw_data[self.gw_data['location'].str.contains(location_name, case=False, na=False)]
        if gw_match.empty:
            groundwater_depth = self.gw_data['avg_groundwater_depth'].mean()
        else:
            groundwater_depth = gw_match['avg_groundwater_depth'].iloc[0]
        
        # Find soil data
        soil_match = self.soil_data[self.soil_data['Town'].str.contains(location_name, case=False, na=False)]
        if soil_match.empty:
            # Use Erode as default
            soil_match = self.soil_data[self.soil_data['Town'] == 'Erode']
            if soil_match.empty:
                return self.get_default_location_info()
        
        soil_data = soil_match.iloc[0]
        
        return {
            'groundwater_depth': float(groundwater_depth),
            'sandy_percentage': float(soil_data['Sandy Soil (%)']),
            'loamy_percentage': float(soil_data['Loamy Soil (%)']),
            'clayey_percentage': float(soil_data['Clayey Soil (%)']),
            'rocky_percentage': float(soil_data['Rocky/Hard Soil (%)'])
        }
    
    def get_default_location_info(self):
        """Default location info for Erode"""
        return {
            'groundwater_depth': 8.5,
            'sandy_percentage': 30.0,
            'loamy_percentage': 40.0,
            'clayey_percentage': 20.0,
            'rocky_percentage': 10.0
        }
    
    def predict(self, roof_area, household_size, location='Erode'):
        """Make predictions for rainwater harvesting"""
        
        # Get location information
        location_info = self.get_location_info(location)
        
        # Prepare input features
        features = [
            roof_area,
            household_size,
            location_info['groundwater_depth'],
            location_info['sandy_percentage'],
            location_info['loamy_percentage'],
            location_info['clayey_percentage'],
            location_info['rocky_percentage']
        ]
        
        X = np.array(features).reshape(1, -1)
        X_scaled = self.scaler.transform(X)
        
        # Make predictions
        predictions = {}
        
        # Predict structure type
        structure_pred = self.models['structure_type'].predict(X_scaled, verbose=0)
        structure_idx = np.argmax(structure_pred, axis=1)[0]
        structure_types = self.label_encoders['structure_type'].classes_
        predictions['structure_type'] = structure_types[structure_idx]
        
        # Predict dimensions and cost
        for target in ['pit_depth', 'pit_length', 'pit_width', 'volume', 'cost']:
            pred = self.models[target].predict(X_scaled, verbose=0)[0][0]
            predictions[target] = max(0, float(pred))  # Ensure non-negative
        
        # Calculate additional metrics
        runoff_coeffs = {'Sandy': 0.15, 'Loamy': 0.25, 'Clayey': 0.35, 'Rocky': 0.45}
        
        # Determine dominant soil type
        soil_percentages = {
            'Sandy': location_info['sandy_percentage'],
            'Loamy': location_info['loamy_percentage'],
            'Clayey': location_info['clayey_percentage'],
            'Rocky': location_info['rocky_percentage']
        }
        dominant_soil = max(soil_percentages, key=soil_percentages.get)
        runoff_coeff = runoff_coeffs[dominant_soil]
        
        # Annual harvestable water
        annual_harvestable = roof_area * self.average_rainfall * runoff_coeff
        
        # Storage efficiency
        storage_efficiency = min(100, (predictions['volume'] / annual_harvestable) * 100) if annual_harvestable > 0 else 0
        
        # Cost per liter
        cost_per_liter = predictions['cost'] / predictions['volume'] if predictions['volume'] > 0 else 0
        
        # Annual savings (assuming 5 INR per 1000L)
        annual_savings = (annual_harvestable / 1000) * 5
        payback_years = predictions['cost'] / annual_savings if annual_savings > 0 else float('inf')
        
        # Format response
        return {
            'feasibility': 'Feasible' if predictions['volume'] > 1000 else 'Limited Feasibility',
            'recommended_structure': predictions['structure_type'],
            'dimensions': {
                'length': round(predictions['pit_length'], 2),
                'width': round(predictions['pit_width'], 2),
                'depth': round(predictions['pit_depth'], 2),
                'volume': round(predictions['volume'], 2)
            },
            'cost_estimation': {
                'total_cost': round(predictions['cost'], 2),
                'cost_per_liter': round(cost_per_liter, 2),
                'payback_period_years': round(min(payback_years, 50), 1)
            },
            'water_harvesting': {
                'annual_harvestable': round(annual_harvestable, 2),
                'storage_efficiency': round(storage_efficiency, 1),
                'annual_savings': round(annual_savings, 2)
            },
            'location_info': {
                'groundwater_depth': location_info['groundwater_depth'],
                'dominant_soil_type': dominant_soil,
                'soil_composition': {
                    'sandy': location_info['sandy_percentage'],
                    'loamy': location_info['loamy_percentage'],
                    'clayey': location_info['clayey_percentage'],
                    'rocky': location_info['rocky_percentage']
                }
            },
            'runoff_coefficient': runoff_coeff
        }

# Test the service
def test_service():
    """Test function for the prediction service"""
    try:
        service = SimplePredictionService()
        
        # Test predictions
        test_cases = [
            {'roof_area': 150, 'household_size': 5, 'location': 'Erode'},
            {'roof_area': 200, 'household_size': 6, 'location': 'Gobichettipalayam'},
            {'roof_area': 100, 'household_size': 4, 'location': 'Bhavani'}
        ]
        
        print("\n🧪 Testing predictions...")
        for i, test_case in enumerate(test_cases, 1):
            print(f"\nTest Case {i}: {test_case}")
            result = service.predict(**test_case)
            
            print(f"  Structure: {result['recommended_structure']}")
            print(f"  Dimensions: {result['dimensions']['length']}m x {result['dimensions']['width']}m x {result['dimensions']['depth']}m")
            print(f"  Volume: {result['dimensions']['volume']:,.0f} liters")
            print(f"  Cost: ₹{result['cost_estimation']['total_cost']:,.0f}")
            print(f"  Annual Harvestable: {result['water_harvesting']['annual_harvestable']:,.0f} liters")
            print(f"  Payback: {result['cost_estimation']['payback_period_years']} years")
        
        print("\n✅ Prediction service is working correctly!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_service()
