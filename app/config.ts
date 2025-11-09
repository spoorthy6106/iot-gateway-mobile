// Update this URL to point to your backend API
// For local development with physical device, use your computer's local IP
// For iOS simulator: http://localhost:8080
// For Android emulator: http://10.0.2.2:8080
// For physical device: http://YOUR_LOCAL_IP:8080 or use ngrok

export const API_BASE_URL = 'https://iot-gateway-api-service.onrender.com' 
export const API_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};


