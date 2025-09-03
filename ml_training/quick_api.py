from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from tensorflow import keras
import joblib
import json

app = Flask(__name__)
CORS(app)

# Global variables for models
models = {}
scaler = None
label_encoders = {}
gw_data = None
soil_data = None

def load_everything():
    """Load models and data"""
    global models, scaler, label_encoders, gw_data, soil_data
    
    try:
        # Load models
        with open('models/metadata.json', 'r') as f:
            metadata = json.load(f)
        
        scaler = joblib.load('models/scaler.pkl')
        label_encoders = joblib.load('models/label_encoders.pkl')
        
        for model_name in metadata['models']:
            models[model_name] = keras.models.load_model(f'models/{model_name}_model.keras')
        
        # Load data
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
        
        soil_df = pd.read_csv('../erode_soil_dataset.csv')
        soil_df = soil_df.dropna(subset=['Town'])
        soil_df = soil_df[soil_df['Town'] != '']
        
        gw_data = gw_df
        soil_data = soil_df
        
        print(f"✅ Loaded {len(models)} models and data successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error loading: {e}")
        return False

def get_location_info(location_name):
    """Get location information"""
    if gw_data is None or soil_data is None:
        return {
            'groundwater_depth': 8.5,
            'sandy_percentage': 30.0,
            'loamy_percentage': 40.0,
            'clayey_percentage': 20.0,
            'rocky_percentage': 10.0
        }
    
    # Find groundwater data
    gw_match = gw_data[gw_data['location'].str.contains(location_name, case=False, na=False)]
    if gw_match.empty:
        groundwater_depth = gw_data['avg_groundwater_depth'].mean()
    else:
        groundwater_depth = gw_match['avg_groundwater_depth'].iloc[0]
    
    # Find soil data
    soil_match = soil_data[soil_data['Town'].str.contains(location_name, case=False, na=False)]
    if soil_match.empty:
        soil_match = soil_data[soil_data['Town'] == 'Erode']
        if soil_match.empty:
            return {
                'groundwater_depth': 8.5,
                'sandy_percentage': 30.0,
                'loamy_percentage': 40.0,
                'clayey_percentage': 20.0,
                'rocky_percentage': 10.0
            }
    
    soil_data_row = soil_match.iloc[0]
    
    return {
        'groundwater_depth': float(groundwater_depth),
        'sandy_percentage': float(soil_data_row['Sandy Soil (%)']),
        'loamy_percentage': float(soil_data_row['Loamy Soil (%)']),
        'clayey_percentage': float(soil_data_row['Clayey Soil (%)']),
        'rocky_percentage': float(soil_data_row['Rocky/Hard Soil (%)'])
    }

@app.route('/')
def home():
    return """
    <h1>🏠 RWH-Erode ML API</h1>
    <p>Machine Learning API for Rainwater Harvesting predictions</p>
    <h2>Endpoints:</h2>
    <ul>
        <li><strong>POST /predict</strong> - Get predictions</li>
        <li><strong>GET /health</strong> - Health check</li>
    </ul>
    <h2>Example:</h2>
    <pre>
    curl -X POST http://localhost:5001/predict \\
      -H "Content-Type: application/json" \\
      -d '{"roof_area": 150, "household_size": 5, "location": "Erode"}'
    </pre>
    """

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy' if models else 'error',
        'models_loaded': len(models),
        'service': 'RWH-Erode ML API'
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        roof_area = float(data.get('roof_area', 0))
        household_size = int(data.get('household_size', 0))
        location = data.get('location', 'Erode')
        
        if roof_area <= 0 or household_size <= 0:
            return jsonify({'error': 'Invalid input values'}), 400
        
        # Get location info
        location_info = get_location_info(location)
        
        # Prepare features
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
        X_scaled = scaler.transform(X)
        
        # Make predictions
        predictions = {}
        
        # Structure type
        structure_pred = models['structure_type'].predict(X_scaled, verbose=0)
        structure_idx = np.argmax(structure_pred, axis=1)[0]
        structure_types = label_encoders['structure_type'].classes_
        predictions['structure_type'] = structure_types[structure_idx]
        
        # Other predictions
        for target in ['pit_depth', 'pit_length', 'pit_width', 'volume', 'cost']:
            pred = models[target].predict(X_scaled, verbose=0)[0][0]
            predictions[target] = max(0, float(pred))
        
        # Calculate additional metrics
        soil_percentages = {
            'Sandy': location_info['sandy_percentage'],
            'Loamy': location_info['loamy_percentage'],
            'Clayey': location_info['clayey_percentage'],
            'Rocky': location_info['rocky_percentage']
        }
        dominant_soil = max(soil_percentages, key=soil_percentages.get)
        
        runoff_coeffs = {'Sandy': 0.15, 'Loamy': 0.25, 'Clayey': 0.35, 'Rocky': 0.45}
        runoff_coeff = runoff_coeffs[dominant_soil]
        
        annual_harvestable = roof_area * 775 * runoff_coeff  # 775mm rainfall
        storage_efficiency = min(100, (predictions['volume'] / annual_harvestable) * 100) if annual_harvestable > 0 else 0
        cost_per_liter = predictions['cost'] / predictions['volume'] if predictions['volume'] > 0 else 0
        annual_savings = (annual_harvestable / 1000) * 5
        payback_years = predictions['cost'] / annual_savings if annual_savings > 0 else float('inf')
        
        # Format response
        result = {
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
                'soil_composition': location_info
            },
            'runoff_coefficient': runoff_coeff
        }
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting RWH-Erode ML API...")
    
    if load_everything():
        print("📍 API available at: http://localhost:5001")
        app.run(host='0.0.0.0', port=5001, debug=True)
    else:
        print("❌ Failed to load models and data")
