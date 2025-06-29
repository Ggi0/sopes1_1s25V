# =================================================================================
# Servicio para operaciones de base de datos MySQL
# Maneja la conexión y las operaciones CRUD con Cloud SQL
# =================================================================================

import os
import mysql.connector
from mysql.connector import Error
import logging

class DatabaseService:
    """
    Servicio para manejar todas las operaciones de base de datos
    Utiliza mysql-connector-python para conectarse a Cloud SQL MySQL
    """
    
    def __init__(self):
        """
        Inicializar el servicio de base de datos con la configuración desde variables de entorno
        """
        self.connection_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'database': os.getenv('DB_NAME', 'metrics_db'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', 'password'),
            # Configuraciones adicionales para Cloud SQL
            'autocommit': False,  # Usar transacciones manuales
            'connection_timeout': 30,  # Timeout de conexión
            'charset': 'utf8mb4'
        }
        
        # TODO: En Kubernetes, la configuración de conexión cambiará a:
        # - DB_HOST: nombre del servicio de Cloud SQL Proxy o IP de Cloud SQL
        # - Credenciales desde Kubernetes Secrets
        # - Posible uso de Cloud SQL Proxy sidecar container
        
        # Configurar logging para debug
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def get_connection(self):
        """
        Establecer conexión con la base de datos MySQL
        
        Returns:
            mysql.connector.connection: Objeto de conexión o None si falla
        """
        try:
            connection = mysql.connector.connect(**self.connection_config)
            
            if connection.is_connected():
                self.logger.info(f"Conexión exitosa a MySQL en {self.connection_config['host']}")
                return connection
            else:
                self.logger.error("No se pudo establecer conexión con MySQL")
                return None
        
        except Error as e:
            self.logger.error(f"Error al conectar con MySQL: {e}")
            return None
    
    def store_metrics(self, data):
        """
        Almacenar las métricas en las tres tablas usando transacciones
        Garantiza consistencia de datos mediante transacciones atómicas
        
        Args:
            data (dict): Datos preparados para inserción
        
        Returns:
            dict: Resultado de la operación
        """
        connection = None
        cursor = None
        
        try:
            # Establecer conexión
            connection = self.get_connection()
            if not connection:
                return {
                    'success': False,
                    'error': 'No se pudo establecer conexión con la base de datos'
                }
            
            cursor = connection.cursor()
            
            # Iniciar transacción
            connection.start_transaction()
            
            # Insertar datos en tabla RAM
            ram_result = self._insert_ram_data(cursor, data['ram'])
            if not ram_result['success']:
                connection.rollback()
                return ram_result
            
            # Insertar datos en tabla CPU
            cpu_result = self._insert_cpu_data(cursor, data['cpu'])
            if not cpu_result['success']:
                connection.rollback()
                return cpu_result
            
            # Insertar datos en tabla PROCESOS
            proc_result = self._insert_proc_data(cursor, data['procesos'])
            if not proc_result['success']:
                connection.rollback()
                return proc_result
            
            # Confirmar transacción
            connection.commit()
            
            self.logger.info(f"Métricas almacenadas exitosamente - timestamp: {data['hora']}")
            
            return {
                'success': True,
                'message': 'Todas las métricas fueron almacenadas correctamente',
                'timestamp': data['hora']
            }
        
        except Error as e:
            # Rollback en caso de error
            if connection:
                connection.rollback()
            
            error_msg = f"Error al almacenar métricas: {e}"
            self.logger.error(error_msg)
            
            return {
                'success': False,
                'error': error_msg
            }
        
        finally:
            # Cerrar cursor y conexión
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()
    
    def _insert_ram_data(self, cursor, ram_data):
        """
        Insertar datos de RAM en la tabla ram_table
        
        Args:
            cursor: Cursor de la base de datos
            ram_data (dict): Datos de RAM
        
        Returns:
            dict: Resultado de la inserción
        """
        try:
            insert_query = """
            INSERT INTO ram_table (total, libre, uso, porcentaje, compartida, buffer, hora, api)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            values = (
                ram_data['total'],
                ram_data['libre'],
                ram_data['uso'],
                ram_data['porcentaje'],
                ram_data['compartida'],
                ram_data['buffer'],
                ram_data['hora'],
                ram_data['api']
            )
            
            cursor.execute(insert_query, values)
            
            return {'success': True}
        
        except Error as e:
            return {
                'success': False,
                'error': f'Error al insertar datos de RAM: {e}'
            }
    
    def _insert_cpu_data(self, cursor, cpu_data):
        """
        Insertar datos de CPU en la tabla cpu_table
        
        Args:
            cursor: Cursor de la base de datos
            cpu_data (dict): Datos de CPU
        
        Returns:
            dict: Resultado de la inserción
        """
        try:
            insert_query = """
            INSERT INTO cpu_table (min_1, min_5, min_15, actual_mhz, used, free, hora, api)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            values = (
                cpu_data['min_1'],
                cpu_data['min_5'],
                cpu_data['min_15'],
                cpu_data['actual_mhz'],
                cpu_data['used'],
                cpu_data['free'],
                cpu_data['hora'],
                cpu_data['api']
            )
            
            cursor.execute(insert_query, values)
            
            return {'success': True}
        
        except Error as e:
            return {
                'success': False,
                'error': f'Error al insertar datos de CPU: {e}'
            }
    
    def _insert_proc_data(self, cursor, proc_data):
        """
        Insertar datos de procesos en la tabla proc_table
        
        Args:
            cursor: Cursor de la base de datos
            proc_data (dict): Datos de procesos
        
        Returns:
            dict: Resultado de la inserción
        """
        try:
            insert_query = """
            INSERT INTO proc_table (corriendo, total, durmiendo, zombie, parados, hora, api)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            
            values = (
                proc_data['corriendo'],
                proc_data['total'],
                proc_data['durmiendo'],
                proc_data['zombie'],
                proc_data['parados'],
                proc_data['hora'],
                proc_data['api']
            )
            
            cursor.execute(insert_query, values)
            
            return {'success': True}
        
        except Error as e:
            return {
                'success': False,
                'error': f'Error al insertar datos de procesos: {e}'
            }
    
    def test_connection(self):
        """
        Probar la conexión a la base de datos
        Útil para health checks y debugging
        
        Returns:
            dict: Estado de la conexión
        """
        connection = self.get_connection()
        
        if connection:
            try:
                cursor = connection.cursor()
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                cursor.close()
                connection.close()
                
                return {
                    'success': True,
                    'message': 'Conexión a base de datos exitosa'
                }
            except Error as e:
                return {
                    'success': False,
                    'error': f'Error en test de conexión: {e}'
                }
        else:
            return {
                'success': False,
                'error': 'No se pudo establecer conexión'
            }