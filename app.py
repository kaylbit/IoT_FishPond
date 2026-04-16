from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="public")
CORS(app)

latest_data = {
    "ph": 7.2,
    "temperature": 26.4,
    "turbidity": 12,
    "waterlevel": 82,
    "status": {},
    "alerts": []
}

# 🧠 RULE ENGINE
def check_status(ph, temp, turb, wl):
    status = {}
    alerts = []

    # pH
    if ph < 6.5 or ph > 8.5:
        status["ph"] = "danger"
        alerts.append("pH level is dangerous!")
    elif ph < 6.8 or ph > 8.0:
        status["ph"] = "warning"
        alerts.append("pH level is slightly off.")
    else:
        status["ph"] = "safe"

    # Temperature
    if temp < 20 or temp > 32:
        status["temperature"] = "danger"
        alerts.append("Temperature is dangerous!")
    elif temp < 22 or temp > 30:
        status["temperature"] = "warning"
        alerts.append("Temperature is not optimal.")
    else:
        status["temperature"] = "safe"

    # Turbidity
    if turb > 50:
        status["turbidity"] = "danger"
        alerts.append("Water is too dirty!")
    elif turb > 30:
        status["turbidity"] = "warning"
        alerts.append("Water is slightly dirty.")
    else:
        status["turbidity"] = "safe"

    # Water Level
    if wl < 50:
        status["waterlevel"] = "danger"
        alerts.append("Water level is too low!")
    elif wl < 60:
        status["waterlevel"] = "warning"
        alerts.append("Water level is getting low.")
    else:
        status["waterlevel"] = "safe"

    return status, alerts


# 📥 ESP32 sends data
@app.route("/sensor", methods=["POST"])
def sensor():
    global latest_data

    data = request.json
    ph = data.get("ph")
    temp = data.get("temperature")
    turb = data.get("turbidity")
    wl = data.get("waterlevel")

    status, alerts = check_status(ph, temp, turb, wl)

    latest_data.update(data)
    latest_data["status"] = status
    latest_data["alerts"] = alerts

    return jsonify({"success": True})


# 📤 Frontend fetch
@app.route("/data")
def get_data():
    return jsonify(latest_data)


@app.route("/")
def serve_index():
    return send_from_directory("public", "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
