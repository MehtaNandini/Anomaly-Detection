import os
from google import genai
from google.genai import types

def get_fallback_explanation(telemetry: dict, anomaly_result: dict) -> str:
    reasons = ", ".join(anomaly_result.get("reasons", []))
    fault_type = anomaly_result.get("fault_type", "Unknown Fault")
    severity = anomaly_result.get("severity", "Normal")
    vehicle_id = telemetry.get("vehicle_id", "Unknown")
    
    return f"Vehicle {vehicle_id} triggered a {severity} {fault_type} due to: {reasons}. Check relevant sensor subsystems (exhaust flow, coolant, or fuel injection). Perform diagnostic inspection immediately."

def generate_fault_explanation(telemetry: dict, anomaly_result: dict) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return get_fallback_explanation(telemetry, anomaly_result)

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an expert automotive diagnostics assistant.
        
        Vehicle Data:
        - Vehicle ID: {telemetry.get('vehicle_id')}
        - Speed: {telemetry.get('speed')} km/h
        - RPM: {telemetry.get('rpm')}
        - Engine Temperature: {telemetry.get('engine_temp')} C
        - Exhaust Temperature: {telemetry.get('exhaust_temp')} C
        - NOx: {telemetry.get('nox')} ppm
        - CO2: {telemetry.get('co2')} ppm
        - Fuel Rate: {telemetry.get('fuel_rate')} L/h
        - Engine Load: {telemetry.get('engine_load')}%
        
        Anomaly Detected:
        - Anomaly Score: {anomaly_result.get('anomaly_score')}
        - Severity: {anomaly_result.get('severity')}
        - Reasons: {", ".join(anomaly_result.get('reasons', []))}
        
        Based on this data, explain the fault in exactly 3 short sentences:
        1. What looks abnormal
        2. Possible root cause
        3. Suggested next diagnostic step
        """
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API failed: {e}")
        return get_fallback_explanation(telemetry, anomaly_result)
