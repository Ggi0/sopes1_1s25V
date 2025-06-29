# =======================================================================================
# Archivo principal de la aplicación Flask
# Esta es la API de Python que recibe el 50% del tráfico desde el Ingress
# =======================================================================================

import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.metrics_routes import metrics_bp

# Cargar variables de entorno del archivo .env
load_dotenv()

def create_app():
    """
    Factory function para crear la aplicación Flask
    Configura CORS, registra blueprints y establece configuraciones básicas
    """
    app = Flask(__name__)
    
    # Configuración de CORS para permitir peticiones desde cualquier origen
    # TODO: En producción/Kubernetes, restringir CORS a dominios específicos
    CORS(app, origins="*")
    
    # Registrar el blueprint de rutas de métricas
    app.register_blueprint(metrics_bp, url_prefix='/api')
    
    # Configuración básica de la aplicación
    app.config['JSON_SORT_KEYS'] = False  # Mantener orden original del JSON
    
    return app

# Crear la instancia de la aplicación
app = create_app()

# Ruta de prueba para verificar que la API está funcionando
@app.route('/health', methods=['GET'])
def health_check():
    """
    Endpoint de health check para verificar el estado de la API
    Útil para Kubernetes liveness y readiness probes
    """
    return {
        "status": "OK",
        "message": "API Python funcionando correctamente",
        "api": "Python"
    }, 200

if __name__ == '__main__':
    # Obtener puerto desde variables de entorno o usar 5000 por defecto
    port = int(os.getenv('PORT', 5000))
    
    # Obtener entorno de ejecución
    env = os.getenv('FLASK_ENV', 'development')
    
    print(f"Iniciando API Python en puerto {port}")
    print(f"Entorno: {env}")
    
    # TODO: En Kubernetes, el host debe ser '0.0.0.0' para aceptar conexiones externas
    # TODO: En producción, usar un servidor WSGI como Gunicorn en lugar del servidor de desarrollo
    app.run(
        host='0.0.0.0',  # Permite conexiones desde cualquier IP
        port=port,
        debug=(env == 'development')
    )