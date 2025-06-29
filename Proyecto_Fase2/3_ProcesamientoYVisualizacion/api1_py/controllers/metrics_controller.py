# =================================================================================
# Controlador para manejar las peticiones de métricas
# Se encarga de validar los datos y coordinar con el servicio de base de datos
# =================================================================================

from services.database_service import DatabaseService
from datetime import datetime

class MetricsController:
    """
    Controlador principal para el manejo de métricas del sistema
    Valida los datos recibidos y coordina el almacenamiento en la base de datos
    """
    
    def __init__(self):
        """
        Inicializar el controlador con el servicio de base de datos
        """
        self.db_service = DatabaseService()
    
    def process_metrics(self, data):
        """
        Procesar las métricas recibidas y almacenarlas en la base de datos
        
        Args:
            data (dict): Diccionario con las métricas del sistema
        
        Returns:
            dict: Resultado del procesamiento con éxito/error
        """
        try:
            # Validar que los datos contengan los campos requeridos
            validation_result = self._validate_metrics_data(data)
            if not validation_result['valid']:
                return {
                    'success': False,
                    'error': validation_result['error']
                }
            
            # Preparar los datos para inserción añadiendo el identificador de API
            prepared_data = self._prepare_data_for_insertion(data)
            
            # Almacenar en la base de datos usando transacciones
            result = self.db_service.store_metrics(prepared_data)
            
            if result['success']:
                return {
                    'success': True,
                    'timestamp': prepared_data['hora'],
                    'message': 'Métricas almacenadas correctamente'
                }
            else:
                return {
                    'success': False,
                    'error': result['error']
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': f'Error en el controlador: {str(e)}'
            }
    
    def _validate_metrics_data(self, data):
        """
        Validar que los datos de métricas contengan todos los campos requeridos
        
        Args:
            data (dict): Datos de métricas a validar
        
        Returns:
            dict: Resultado de la validación
        """
        try:
            # Campos requeridos en el JSON
            required_fields = ['ram', 'cpu', 'procesos', 'hora']
            
            # Verificar que existan los campos principales
            for field in required_fields:
                if field not in data:
                    return {
                        'valid': False,
                        'error': f'Campo requerido faltante: {field}'
                    }
            
            # Validar estructura de RAM
            ram_fields = ['total', 'libre', 'uso', 'porcentaje', 'compartida', 'buffer']
            for field in ram_fields:
                if field not in data['ram']:
                    return {
                        'valid': False,
                        'error': f'Campo RAM faltante: {field}'
                    }
            
            # Validar estructura de CPU
            if 'carga_avg' not in data['cpu'] or 'frecuencia' not in data['cpu'] or 'uso' not in data['cpu']:
                return {
                    'valid': False,
                    'error': 'Estructura de CPU incompleta'
                }
            
            # Validar estructura de procesos
            proc_fields = ['corriendo', 'total', 'durmiendo', 'zombie', 'parados']
            for field in proc_fields:
                if field not in data['procesos']:
                    return {
                        'valid': False,
                        'error': f'Campo procesos faltante: {field}'
                    }
            
            # Validar formato de timestamp
            try:
                datetime.strptime(data['hora'], '%Y-%m-%d %H:%M:%S')
            except ValueError:
                return {
                    'valid': False,
                    'error': 'Formato de hora inválido. Esperado: YYYY-MM-DD HH:MM:SS'
                }
            
            return {'valid': True}
        
        except Exception as e:
            return {
                'valid': False,
                'error': f'Error en validación: {str(e)}'
            }
    
    def _prepare_data_for_insertion(self, data):
        """
        Preparar los datos para inserción en la base de datos
        Añade el identificador de API y organiza los datos por tablas
        
        Args:
            data (dict): Datos originales de métricas
        
        Returns:
            dict: Datos preparados para inserción
        """
        # Añadir identificador de API a los datos
        prepared_data = {
            'ram': {
                'total': data['ram']['total'],
                'libre': data['ram']['libre'],
                'uso': data['ram']['uso'],
                'porcentaje': data['ram']['porcentaje'],
                'compartida': data['ram']['compartida'],
                'buffer': data['ram']['buffer'],
                'hora': data['hora'],
                'api': 'Python'  # Identificador de que proviene de la API Python
            },
            'cpu': {
                'min_1': data['cpu']['carga_avg']['1min'],
                'min_5': data['cpu']['carga_avg']['5min'],
                'min_15': data['cpu']['carga_avg']['15min'],
                'actual_mhz': data['cpu']['frecuencia']['actual_mhz'],
                'used': data['cpu']['uso']['cpu_used'],
                'free': data['cpu']['uso']['cpu_free'],
                'hora': data['hora'],
                'api': 'Python'
            },
            'procesos': {
                'corriendo': data['procesos']['corriendo'],
                'total': data['procesos']['total'],
                'durmiendo': data['procesos']['durmiendo'],
                'zombie': data['procesos']['zombie'],
                'parados': data['procesos']['parados'],
                'hora': data['hora'],
                'api': 'Python'
            },
            'hora': data['hora']  # Timestamp para referencia
        }
        
        return prepared_data