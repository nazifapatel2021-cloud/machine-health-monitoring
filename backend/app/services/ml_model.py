import numpy as np
from typing import Dict, Any, Tuple
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from app.config import config

class MachineHealthMLModel:
    """
    Scikit-learn Random Forest Model for Machine Health & Failure Risk Prediction.
    Trained on a synthetic baseline dataset representing normal vs anomalous machine behaviors.
    """
    def __init__(self):
        self.is_trained = False
        self.classifier = RandomForestClassifier(n_estimators=50, random_state=42)
        self.regressor = RandomForestRegressor(n_estimators=50, random_state=42)
        self._train_synthetic_model()

    def _train_synthetic_model(self) -> None:
        """Generates 1200 synthetic industrial telemetry samples and fits Random Forest models."""
        np.random.seed(42)
        n_samples = 1200

        # Features: [temperature, vibration, sound, current]
        # Class 0: Normal (800 samples)
        temp_0 = np.random.normal(62, 5, 800)
        vib_0 = np.random.normal(2.2, 0.8, 800)
        snd_0 = np.random.normal(52, 6, 800)
        curr_0 = np.random.normal(4.8, 1.2, 800)
        health_0 = np.random.uniform(85, 99, 800)
        y_class_0 = np.zeros(800, dtype=int)

        # Class 1: Warning / Mild Wear (250 samples)
        temp_1 = np.random.normal(77, 4, 250)
        vib_1 = np.random.normal(5.2, 0.9, 250)
        snd_1 = np.random.normal(72, 5, 250)
        curr_1 = np.random.normal(11.2, 1.8, 250)
        health_1 = np.random.uniform(55, 78, 250)
        y_class_1 = np.ones(250, dtype=int)

        # Class 2: Critical / Impending Failure (150 samples)
        temp_2 = np.random.normal(88, 6, 150)
        vib_2 = np.random.normal(8.1, 1.4, 150)
        snd_2 = np.random.normal(88, 7, 150)
        curr_2 = np.random.normal(16.5, 2.5, 150)
        health_2 = np.random.uniform(15, 48, 150)
        y_class_2 = np.full(150, 2, dtype=int)

        # Concatenate synthetic dataset
        X = np.column_stack([
            np.concatenate([temp_0, temp_1, temp_2]),
            np.concatenate([vib_0, vib_1, vib_2]),
            np.concatenate([snd_0, snd_1, snd_2]),
            np.concatenate([curr_0, curr_1, curr_2])
        ])
        y_class = np.concatenate([y_class_0, y_class_1, y_class_2])
        y_health = np.concatenate([health_0, health_1, health_2])

        # Clip values to realistic non-negative domain
        X = np.clip(X, 0, None)

        self.classifier.fit(X, y_class)
        self.regressor.fit(X, y_health)
        self.is_trained = True

    def predict(self, temperature: float, vibration: float, sound: float, current: float) -> Dict[str, Any]:
        """Runs Random Forest inference on live sensor features."""
        features = np.array([[temperature, vibration, sound, current]])

        # Model outputs
        predicted_health = float(self.regressor.predict(features)[0])
        class_probs = self.classifier.predict_proba(features)[0]

        # Failure probability is combined likelihood of Warning (Class 1) and Critical (Class 2)
        if len(class_probs) == 3:
            failure_prob = float((class_probs[1] * 0.4 + class_probs[2] * 1.0) * 100)
        else:
            failure_prob = float(max(0, (100 - predicted_health)))

        # Constrain health score between 5% and 99%
        predicted_health = float(np.clip(predicted_health, 5.0, 99.0))
        failure_prob = float(np.clip(failure_prob, 1.0, 95.0))

        # Risk level determination
        if predicted_health >= 80 and failure_prob < 20:
            risk_level = "LOW"
        elif predicted_health >= 55 and failure_prob < 50:
            risk_level = "MEDIUM"
        elif predicted_health >= 35:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        # Feature importances extraction (Random Forest internal feature weights)
        importances = self.classifier.feature_importances_
        feature_names = ["temperature", "vibration", "sound", "current"]
        
        # Calculate deviation from normal baselines to weight feature impact explainability
        t_cfg = config.THRESHOLDS
        dev_temp = max(0, (temperature - t_cfg["temperature"]["normal_avg"]) / 15.0)
        dev_vib = max(0, (vibration - t_cfg["vibration"]["normal_avg"]) / 3.0)
        dev_snd = max(0, (sound - t_cfg["sound"]["normal_avg"]) / 20.0)
        dev_curr = max(0, (current - t_cfg["current"]["normal_avg"]) / 6.0)
        
        deviations = np.array([dev_temp, dev_vib, dev_snd, dev_curr])
        weighted_impact = importances * (1.0 + deviations)
        total_w = np.sum(weighted_impact) if np.sum(weighted_impact) > 0 else 1.0
        normalized_impact = (weighted_impact / total_w)

        feat_imp_dict = {
            "temperature": round(float(normalized_impact[0] * 100), 1),
            "vibration": round(float(normalized_impact[1] * 100), 1),
            "sound": round(float(normalized_impact[2] * 100), 1),
            "current": round(float(normalized_impact[3] * 100), 1),
        }

        # Determine explainable recommendation based on highest contributor
        dominant_sensor = max(feat_imp_dict, key=feat_imp_dict.get)
        
        if risk_level == "LOW":
            rec_action = "Continue normal operation and maintain regular scheduled inspection."
        else:
            if dominant_sensor == "temperature":
                rec_action = "Thermal elevated. Inspect cooling fan, heat sink, and lubrication level."
            elif dominant_sensor == "vibration":
                rec_action = "High mechanical vibration detected. Check bearing alignment, balance, and mounting bolts."
            elif dominant_sensor == "sound":
                rec_action = "Acoustic anomaly detected. Check internal gears, belt tension, and shaft resonance."
            else:
                rec_action = "Overcurrent detected. Inspect electrical supply phase, winding resistance, and motor load."

        return {
            "health_score": round(predicted_health, 1),
            "failure_probability": round(failure_prob, 1),
            "risk_level": risk_level,
            "recommended_action": rec_action,
            "feature_importance": feat_imp_dict,
            "is_demo_model": True
        }

ml_model = MachineHealthMLModel()
