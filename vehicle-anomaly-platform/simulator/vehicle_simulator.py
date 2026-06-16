import os
import time
import random
import requests

API_URL = os.getenv("API_URL", "http://localhost:8000/telemetry")
VEHICLES = ["VH-101", "VH-102", "VH-103", "VH-104"]

def generate_normal_telemetry(vehicle_id):
    return {
        "vehicle_id": vehicle_id,
        "speed": round(random.uniform(30, 130), 2),
        "rpm": round(random.uniform(1000, 3500), 2),
        "engine_temp": round(random.uniform(75, 105), 2),
        "exhaust_temp": round(random.uniform(280, 580), 2),
        "nox": round(random.uniform(30, 180), 2),
        "co2": round(random.uniform(100, 240), 2),
        "fuel_rate": round(random.uniform(3.5, 10), 2),
        "engine_load": round(random.uniform(20, 80), 2)
    }

def inject_anomaly(telemetry):
    anomaly_types = [
        "high_nox", "high_co2", "engine_overheat", 
        "high_exhaust_temp", "high_fuel_rate", "combined_emission_fault"
    ]
    anomaly = random.choice(anomaly_types)
    
    if anomaly == "high_nox":
        telemetry["nox"] = round(random.uniform(350, 750), 2)
    elif anomaly == "high_co2":
        telemetry["co2"] = round(random.uniform(300, 480), 2)
    elif anomaly == "engine_overheat":
        telemetry["engine_temp"] = round(random.uniform(112, 140), 2)
    elif anomaly == "high_exhaust_temp":
        telemetry["exhaust_temp"] = round(random.uniform(680, 850), 2)
    elif anomaly == "high_fuel_rate":
        telemetry["fuel_rate"] = round(random.uniform(14, 24), 2)
    elif anomaly == "combined_emission_fault":
        telemetry["nox"] = round(random.uniform(350, 750), 2)
        telemetry["co2"] = round(random.uniform(300, 480), 2)
        telemetry["exhaust_temp"] = round(random.uniform(680, 850), 2)
    
    print(f"Injecting anomaly: {anomaly} into {telemetry['vehicle_id']}")
    return telemetry

def main():
    print(f"Starting vehicle simulator. Sending to {API_URL}")
    while True:
        try:
            vehicle_id = random.choice(VEHICLES)
            telemetry = generate_normal_telemetry(vehicle_id)
            
            # Inject anomaly ~20% of the time
            if random.random() < 0.20:
                telemetry = inject_anomaly(telemetry)
                
            response = requests.post(API_URL, json=telemetry, timeout=5)
            print(f"Sent {vehicle_id} data -> Response: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                if data.get("is_anomaly"):
                    print(f"  [!] Backend detected anomaly: Score {data.get('anomaly_score')} | Severity {data.get('severity')}")
            else:
                print(f"  [X] Error: {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"Failed to send telemetry: {e}")
            
        time.sleep(2)

if __name__ == "__main__":
    main()
