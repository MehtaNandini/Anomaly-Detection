from app.anomaly import detect_anomalies

def test_normal_data():
    data = {
        "nox": 100,
        "co2": 150,
        "engine_temp": 90,
        "exhaust_temp": 400,
        "fuel_rate": 6.5,
        "rpm": 2500,
        "engine_load": 50
    }
    result = detect_anomalies(data)
    assert not result["is_anomaly"]
    assert result["fault_type"] == "None"
    assert result["severity"] == "Normal"
    assert result["anomaly_score"] < 0.35

def test_high_nox_anomaly():
    data = {
        "nox": 400, # High
        "co2": 150,
        "engine_temp": 90,
        "exhaust_temp": 400,
        "fuel_rate": 6.5,
        "rpm": 2500,
        "engine_load": 50
    }
    result = detect_anomalies(data)
    assert result["is_anomaly"]
    assert result["fault_type"] == "Emission Anomaly"
    assert "High NOx emission" in result["reasons"]

def test_combined_emission_fault():
    data = {
        "nox": 400, # +0.35
        "co2": 350, # +0.20
        "engine_temp": 90,
        "exhaust_temp": 700, # +0.15
        "fuel_rate": 6.5,
        "rpm": 2500,
        "engine_load": 50
    }
    result = detect_anomalies(data)
    assert result["is_anomaly"]
    assert result["severity"] == "Medium" or result["severity"] == "High"
    assert "Emission Anomaly" == result["fault_type"]
    assert result["anomaly_score"] >= 0.70

def test_engine_overheating():
    data = {
        "nox": 100,
        "co2": 150,
        "engine_temp": 120, # +0.20 (score alone is not anomaly, let's bump it with something else to trigger is_anomaly)
        "exhaust_temp": 400,
        "fuel_rate": 14, # +0.15 => 0.35 total
        "rpm": 2500,
        "engine_load": 50
    }
    result = detect_anomalies(data)
    assert result["is_anomaly"]
    assert result["fault_type"] == "Thermal Fault"
