# ===============================================================================
# Definición de rutas de la API para el manejo de métricas
# Este archivo contiene los endpoints que reciben las peticiones del Ingress
# ===============================================================================

from flask import Blueprint, request, jsonify
from controllers.metrics_controller import MetricsController

# Crear blueprint para las rutas de métricas
metrics_bp = Blueprint('metrics', __name__)

# Instanciar el controlador
metrics_controller = MetricsController()

@metrics_bp.route('/metrics', methods=['POST'])
def receive_metrics():
    """
    Endpoint principal para recibir métricas del sistema
    Ruta: POST /api/metrics
    
    Este endpoint recibe el 50% del tráfico que viene del Ingress
    El tráfico se distribuye 50/50 entre esta API (Python) y la API de NodeJS
    
    Formato esperado del JSON:
    {
        "data": {
            "ram": {...},
            "cpu": {...},
            "procesos": {...},
            "hora": "2025-06-17 02:21:54"
        }
    }
    """
    try:
        # Verificar que el request contenga JSON
        if not request.is_json:
            return jsonify({
                "error": "Content-Type debe ser application/json",
                "api": "Python"
            }), 400
        
        # Obtener los datos del request
        data = request.get_json()
        
        # Verificar que el JSON contenga la estructura esperada
        if not data or 'data' not in data:
            return jsonify({
                "error": "JSON debe contener un campo 'data'",
                "api": "Python"
            }), 400
        
        # Procesar las métricas usando el controlador
        result = metrics_controller.process_metrics(data['data'])
        
        if result['success']:
            return jsonify({
                "message": "Métricas procesadas y almacenadas correctamente",
                "api": "Python",
                "timestamp": result['timestamp']
            }), 200
        else:
            return jsonify({
                "error": "Error al procesar las métricas",
                "details": result['error'],
                "api": "Python"
            }), 500
    
    except Exception as e:
        # Manejo de errores generales
        return jsonify({
            "error": "Error interno del servidor",
            "details": str(e),
            "api": "Python"
        }), 500

@metrics_bp.route('/metrics', methods=['GET'])
def get_metrics_info():
    """
    Endpoint informativo sobre el servicio de métricas
    Útil para verificar que el endpoint está disponible
    """
    return jsonify({
        "message": "Endpoint de métricas de la API Python",
        "api": "Python",
        "methods": ["POST"],
        "description": "Recibe métricas del sistema y las almacena en MySQL",
        "traffic_split": "50% del tráfico total"
    }), 200