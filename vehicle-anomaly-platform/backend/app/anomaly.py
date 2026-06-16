def detect_anomalies(data: dict) -> dict:
    score = 0.0
    reasons = []

    if data.get("nox", 0) > 300:
        score += 0.35
        reasons.append("High NOx emission")

    if data.get("co2", 0) > 280:
        score += 0.20
        reasons.append("High CO2 emission")

    if data.get("engine_temp", 0) > 110:
        score += 0.20
        reasons.append("Engine overheating")

    if data.get("exhaust_temp", 0) > 650:
        score += 0.15
        reasons.append("High exhaust temperature")

    if data.get("fuel_rate", 0) > 13:
        score += 0.15
        reasons.append("Abnormal fuel consumption")

    if data.get("rpm", 0) > 4000 and data.get("engine_load", 0) > 85:
        score += 0.10
        reasons.append("High RPM with high engine load")

    # Final score should not exceed 1.0
    score = min(score, 1.0)

    # Determine severity
    if score >= 0.75:
        severity = "High"
    elif score >= 0.50:
        severity = "Medium"
    elif score >= 0.35:
        severity = "Low"
    else:
        severity = "Normal"

    # Determine is_anomaly
    is_anomaly = score >= 0.35

    # Determine fault type
    if not reasons:
        fault_type = "None"
    elif "High NOx emission" in reasons:
        fault_type = "Emission Anomaly"
    elif "Engine overheating" in reasons:
        fault_type = "Thermal Fault"
    elif "Abnormal fuel consumption" in reasons:
        fault_type = "Fuel System Anomaly"
    else:
        fault_type = "Vehicle Fault"

    return {
        "anomaly_score": round(score, 2),
        "is_anomaly": is_anomaly,
        "severity": severity,
        "fault_type": fault_type,
        "reasons": reasons
    }
