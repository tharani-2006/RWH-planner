import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import json
import os

class SimpleRWHTrainer:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.models = {}
        self.average_rainfall = 775  # mm per year for Erode
        
    def load_and_process_data(self):
        """Load and process the real data"""
        print("Loading data...")
        
        # Load groundwater data
        gw_df = pd.read_csv('../Station Ground Water Level Information (1).csv', skiprows=1)
        gw_df = gw_df.dropna()
        
        # Extract average groundwater depth
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
        soil_df = soil_df.dropna(subset=['Town'])  # Only drop rows where Town is NaN
        soil_df = soil_df[soil_df['Town'] != '']  # Remove empty town names
        
        # Determine dominant soil type
        soil_columns = ['Sandy Soil (%)', 'Loamy Soil (%)', 'Clayey Soil (%)', 'Rocky/Hard Soil (%)']
        soil_df['dominant_soil_type'] = soil_df[soil_columns].idxmax(axis=1)
        soil_mapping = {
            'Sandy Soil (%)': 'Sandy',
            'Loamy Soil (%)': 'Loamy', 
            'Clayey Soil (%)': 'Clayey',
            'Rocky/Hard Soil (%)': 'Rocky'
        }
        soil_df['dominant_soil_type'] = soil_df['dominant_soil_type'].map(soil_mapping)
        
        print(f"Loaded {len(gw_df)} groundwater stations and {len(soil_df)} soil locations")
        return gw_df, soil_df
    
    def generate_training_data(self, gw_df, soil_df, num_samples=1000):
        """Generate synthetic training data"""
        print(f"Generating {num_samples} training samples...")
        
        training_data = []
        
        for _ in range(num_samples):
            # Random location from groundwater data
            gw_row = gw_df.sample(1).iloc[0]
            location = gw_row['location']
            gw_depth = gw_row['avg_groundwater_depth']
            
            # Find matching soil data or use Erode as default
            soil_match = soil_df[soil_df['Town'].str.contains(location, case=False, na=False)]
            if soil_match.empty:
                soil_match = soil_df[soil_df['Town'] == 'Erode']
            soil_data = soil_match.iloc[0]
            
            # Generate input features
            roof_area = np.random.uniform(50, 500)  # sq meters
            household_size = np.random.randint(2, 12)
            
            # Add variation to groundwater depth
            gw_depth_var = max(0.5, gw_depth + np.random.normal(0, 1))
            
            # Calculate runoff coefficient based on soil
            runoff_coeffs = {'Sandy': 0.15, 'Loamy': 0.25, 'Clayey': 0.35, 'Rocky': 0.45}
            runoff_coeff = runoff_coeffs.get(soil_data['dominant_soil_type'], 0.25)
            
            # Calculate harvestable water
            harvestable_water = roof_area * self.average_rainfall * runoff_coeff
            
            # Determine structure type based on groundwater depth
            if gw_depth_var < 3:
                structure_type = 'trench'
            elif gw_depth_var > 15:
                structure_type = 'shaft'
            else:
                structure_type = 'pit'
            
            # Calculate storage volume (30% of annual harvestable)
            base_volume = harvestable_water * 0.3
            min_volume = household_size * 500  # 500L per person minimum
            volume = max(base_volume, min_volume)
            
            # Soil adjustment factors
            soil_factors = {'Sandy': 1.2, 'Loamy': 1.0, 'Clayey': 0.8, 'Rocky': 0.7}
            volume *= soil_factors.get(soil_data['dominant_soil_type'], 1.0)
            
            # Calculate dimensions
            if structure_type == 'pit':
                depth = max(0.5, min(gw_depth_var - 1, 3.0))
                area = volume / depth
                length = width = np.sqrt(area)
            elif structure_type == 'trench':
                depth = max(0.5, min(gw_depth_var - 0.5, 2.0))
                width = 1.5
                length = volume / (depth * width)
            else:  # shaft
                depth = max(1.0, min(gw_depth_var - 2, 8.0))
                area = volume / depth
                length = width = np.sqrt(area)
            
            # Calculate cost
            base_costs = {'pit': 800, 'trench': 600, 'shaft': 1200}
            soil_multipliers = {'Sandy': 1.0, 'Loamy': 1.2, 'Clayey': 1.5, 'Rocky': 2.0}
            
            material_cost = volume * 200
            labor_cost = volume * base_costs[structure_type] * soil_multipliers.get(soil_data['dominant_soil_type'], 1.2)
            total_cost = (material_cost + labor_cost) * 1.2  # 20% contingency
            
            training_data.append({
                'roof_area': roof_area,
                'household_size': household_size,
                'groundwater_depth': gw_depth_var,
                'sandy_percentage': soil_data['Sandy Soil (%)'],
                'loamy_percentage': soil_data['Loamy Soil (%)'],
                'clayey_percentage': soil_data['Clayey Soil (%)'],
                'rocky_percentage': soil_data['Rocky/Hard Soil (%)'],
                'structure_type': structure_type,
                'pit_length': length,
                'pit_width': width,
                'pit_depth': depth,
                'volume': volume,
                'cost': total_cost
            })
        
        return pd.DataFrame(training_data)
    
    def train_models(self, df):
        """Train the ML models"""
        print("Training models...")
        
        # Prepare features
        feature_columns = [
            'roof_area', 'household_size', 'groundwater_depth',
            'sandy_percentage', 'loamy_percentage', 'clayey_percentage', 'rocky_percentage'
        ]
        
        X = df[feature_columns].values
        
        # Encode structure type
        le_structure = LabelEncoder()
        y_structure = le_structure.fit_transform(df['structure_type'])
        self.label_encoders['structure_type'] = le_structure
        
        # Split data
        X_train, X_test, y_struct_train, y_struct_test = train_test_split(
            X, y_structure, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train structure classifier
        print("Training structure type classifier...")
        structure_model = keras.Sequential([
            keras.layers.Dense(64, activation='relu', input_shape=(len(feature_columns),)),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(32, activation='relu'),
            keras.layers.Dense(3, activation='softmax')  # 3 structure types
        ])
        
        structure_model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
        structure_model.fit(X_train_scaled, y_struct_train, epochs=50, batch_size=32, verbose=0)
        
        # Evaluate
        struct_pred = structure_model.predict(X_test_scaled, verbose=0)
        struct_accuracy = np.mean(np.argmax(struct_pred, axis=1) == y_struct_test)
        print(f"Structure classification accuracy: {struct_accuracy:.3f}")
        
        self.models['structure_type'] = structure_model
        
        # Train regression models
        regression_targets = ['pit_depth', 'pit_length', 'pit_width', 'volume', 'cost']
        
        for target in regression_targets:
            print(f"Training {target} model...")
            
            y_target = df[target].values
            _, _, y_train, y_test = train_test_split(X, y_target, test_size=0.2, random_state=42)
            
            model = keras.Sequential([
                keras.layers.Dense(64, activation='relu', input_shape=(len(feature_columns),)),
                keras.layers.Dropout(0.3),
                keras.layers.Dense(32, activation='relu'),
                keras.layers.Dense(1, activation='linear')
            ])
            
            model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mean_absolute_error'])
            model.fit(X_train_scaled, y_train, epochs=50, batch_size=32, verbose=0)
            
            # Evaluate
            pred = model.predict(X_test_scaled, verbose=0).flatten()
            mae = mean_absolute_error(y_test, pred)
            r2 = r2_score(y_test, pred)
            print(f"  MAE: {mae:.2f}, R²: {r2:.3f}")
            
            self.models[target] = model
    
    def save_models(self):
        """Save all models and preprocessors"""
        os.makedirs('models', exist_ok=True)
        
        # Save Keras models
        for name, model in self.models.items():
            model.save(f'models/{name}_model.keras')
        
        # Save preprocessors
        joblib.dump(self.scaler, 'models/scaler.pkl')
        joblib.dump(self.label_encoders, 'models/label_encoders.pkl')
        
        # Save metadata
        metadata = {
            'models': list(self.models.keys()),
            'feature_columns': ['roof_area', 'household_size', 'groundwater_depth',
                              'sandy_percentage', 'loamy_percentage', 'clayey_percentage', 'rocky_percentage'],
            'structure_types': self.label_encoders['structure_type'].classes_.tolist()
        }
        
        with open('models/metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print("Models saved successfully!")

def main():
    trainer = SimpleRWHTrainer()
    
    # Load data
    gw_df, soil_df = trainer.load_and_process_data()
    
    # Generate training data
    training_df = trainer.generate_training_data(gw_df, soil_df, num_samples=1500)
    
    # Save training data
    training_df.to_csv('training_data.csv', index=False)
    print(f"Training data saved: {len(training_df)} samples")
    
    # Train models
    trainer.train_models(training_df)
    
    # Save models
    trainer.save_models()
    
    print("\n✅ Training completed successfully!")
    print("Models saved in 'models/' directory")

if __name__ == "__main__":
    main()
