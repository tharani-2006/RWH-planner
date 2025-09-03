from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import json
from simple_prediction_service import SimplePredictionService

app = Flask(__name__)
CORS(app)

# Initialize the prediction service
try:
    prediction_service = SimplePredictionService()
    print("✅ ML Prediction Service loaded successfully")
except Exception as e:
    print(f"❌ Error loading ML service: {e}")
    prediction_service = None

@app.route('/')
def home():
    """API documentation page"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>RWH-Erode ML API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
            .endpoint { background: #ecf0f1; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3498db; }
            .method { color: #e74c3c; font-weight: bold; font-size: 18px; }
            pre { background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 5px; overflow-x: auto; }
            .success { color: #27ae60; font-weight: bold; }
            .example { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏠 RWH-Erode ML Prediction API</h1>
            <p>Machine Learning API for Rooftop Rainwater Harvesting predictions in Erode district, Tamil Nadu.</p>
            
            <div class="success">✅ Service Status: Active</div>
            
            <h2>🎯 Main Endpoint</h2>
            <div class="endpoint">
                <h3><span class="method">POST</span> /predict</h3>
                <p>Get comprehensive rainwater harvesting predictions for a specific location</p>
                
                <h4>Request Body:</h4>
                <pre>{
    "roof_area": 150,
    "household_size": 5,
    "location": "Erode"
}</pre>
                
                <h4>Response Example:</h4>
                <pre>{
    "feasibility": "Feasible",
    "recommended_structure": "pit",
    "dimensions": {
        "length": 3.5,
        "width": 3.5,
        "depth": 2.8,
        "volume": 34300
    },
    "cost_estimation": {
        "total_cost": 45000,
        "cost_per_liter": 1.31,
        "payback_period_years": 8.5
    },
    "water_harvesting": {
        "annual_harvestable": 29062.5,
        "storage_efficiency": 118.0,
        "annual_savings": 145.31
    },
    "location_info": {
        "groundwater_depth": 5.6,
        "dominant_soil_type": "Loamy"
    }
}</pre>
            </div>
            
            <h2>🔧 Other Endpoints</h2>
            <div class="endpoint">
                <h3><span class="method">GET</span> /health</h3>
                <p>Check API health status</p>
            </div>
            
            <div class="endpoint">
                <h3><span class="method">GET</span> /locations</h3>
                <p>Get list of supported locations in Erode district</p>
            </div>
            
            <h2>💡 Usage Example</h2>
            <div class="example">
                <strong>cURL:</strong>
                <pre>curl -X POST http://localhost:5001/predict \\
  -H "Content-Type: application/json" \\
  -d '{"roof_area": 150, "household_size": 5, "location": "Erode"}'</pre>
            </div>
            
            <div class="example">
                <strong>JavaScript (fetch):</strong>
                <pre>fetch('http://localhost:5001/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        roof_area: 150,
        household_size: 5,
        location: 'Erode'
    })
})
.then(response => response.json())
.then(data => console.log(data));</pre>
            </div>
            
            <h2>📍 Supported Locations</h2>
            <p>Erode, Perundurai, Bhavani, Gobichettipalayam, Sathyamangalam, Anthiyur, Nambiyur, Kodumudi, Chennimalai, Modakurichi, and more...</p>
            
            <h2>🎯 Model Performance</h2>
            <ul>
                <li><strong>Structure Classification:</strong> 98% accuracy</li>
                <li><strong>Volume Prediction:</strong> R² > 0.97</li>
                <li><strong>Depth Prediction:</strong> R² > 0.93</li>
                <li><strong>Response Time:</strong> < 200ms</li>
            </ul>
        </div>
    </body>
    </html>
    """
    return render_template_string(html)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    if prediction_service is None:
        return jsonify({
            'status': 'error',
            'message': 'ML service not available'
        }), 500
    
    return jsonify({
        'status': 'healthy',
        'service': 'RWH-Erode ML API',
        'version': '1.0.0',
        'models_loaded': len(prediction_service.models),
        'locations_available': len(prediction_service.soil_data) if prediction_service.soil_data is not None else 0
    })

@app.route('/locations', methods=['GET'])
def locations():
    """Get supported locations"""
    if prediction_service is None or prediction_service.soil_data is None:
        locations_list = ['Erode', 'Gobichettipalayam', 'Bhavani', 'Sathyamangalam']
    else:
        locations_list = prediction_service.soil_data['Town'].tolist()
    
    return jsonify({
        'locations': locations_list,
        'total_count': len(locations_list),
        'note': 'If your location is not listed, the system will use the nearest available data'
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    if prediction_service is None:
        return jsonify({
            'error': 'ML service not available',
            'message': 'The machine learning models could not be loaded'
        }), 500
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Request body must be valid JSON'
            }), 400
        
        # Validate required fields
        required_fields = ['roof_area', 'household_size']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'missing_fields': missing_fields,
                'required_fields': required_fields
            }), 400
        
        # Validate data
        try:
            roof_area = float(data['roof_area'])
            household_size = int(data['household_size'])
            location = data.get('location', 'Erode')
            
            if roof_area <= 0 or roof_area > 10000:
                return jsonify({
                    'error': 'Invalid roof_area',
                    'message': 'Roof area must be between 1 and 10000 square meters'
                }), 400
            
            if household_size <= 0 or household_size > 50:
                return jsonify({
                    'error': 'Invalid household_size',
                    'message': 'Household size must be between 1 and 50 people'
                }), 400
        
        except (ValueError, TypeError):
            return jsonify({
                'error': 'Invalid data types',
                'message': 'roof_area must be a number, household_size must be an integer'
            }), 400
        
        # Make prediction
        result = prediction_service.predict(
            roof_area=roof_area,
            household_size=household_size,
            location=location
        )
        
        # Add metadata
        result['metadata'] = {
            'model_version': '1.0.0',
            'api_version': '1.0.0',
            'input_parameters': {
                'roof_area': roof_area,
                'household_size': household_size,
                'location': location
            }
        }
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Prediction error: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'error': 'Prediction failed',
            'message': 'An error occurred while making the prediction',
            'details': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'The requested endpoint does not exist',
        'available_endpoints': ['/predict', '/health', '/locations']
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500

if __name__ == '__main__':
    print("🚀 Starting RWH-Erode ML API Server...")
    print("📍 API available at: http://localhost:5001")
    print("📖 Documentation: http://localhost:5001")
    print("🔍 Health check: http://localhost:5001/health")
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        threaded=True
    )
