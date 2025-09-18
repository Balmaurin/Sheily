#!/usr/bin/env python3
"""
Sistema de Gestión de Backups
Gestiona la creación, almacenamiento y restauración de backups del sistema
"""

import os
import json
import shutil
import sqlite3
import logging
import tarfile
import zipfile
import hashlib
import threading
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import subprocess
import psutil
import tempfile

class BackupManager:
    """Gestor completo de backups con funciones reales"""
    
    def __init__(self, backup_dir: str = "backups", max_backups: int = 10):
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(exist_ok=True)
        self.max_backups = max_backups
        
        # Configurar logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
        # Inicializar base de datos de metadatos
        self.db_path = self.backup_dir / "backup_metadata.db"
        self._init_database()
        
        # Lock para operaciones thread-safe
        self._lock = threading.Lock()
        
        # Configuración de directorios a respaldar
        self.backup_paths = {
            "models": "models/",
            "data": "data/",
            "config": "config/",
            "branches": "branches/",
            "cache": "cache/",
            "logs": "logs/"
        }
        
        # Configuración de archivos a excluir
        self.exclude_patterns = [
            "*.tmp", "*.log", "*.cache", "__pycache__", 
            ".git", "node_modules", "venv", ".env"
        ]
        
        self.logger.info(f"✅ BackupManager inicializado en {self.backup_dir}")
    
    def _init_database(self):
        """Inicializar base de datos SQLite para metadatos de backups"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS backup_metadata (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    backup_id TEXT UNIQUE NOT NULL,
                    backup_name TEXT NOT NULL,
                    backup_type TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    file_size INTEGER NOT NULL,
                    checksum TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status TEXT DEFAULT 'completed',
                    compression_ratio REAL,
                    backup_duration_seconds REAL,
                    included_paths TEXT,
                    excluded_paths TEXT,
                    metadata TEXT
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_backup_id ON backup_metadata(backup_id)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_backup_type ON backup_metadata(backup_type)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_created_at ON backup_metadata(created_at)
            """)
    
    def _generate_backup_id(self, backup_type: str) -> str:
        """Generar ID único para el backup"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{backup_type}_{timestamp}"
    
    def _calculate_checksum(self, file_path: Path) -> str:
        """Calcular checksum SHA-256 del archivo"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def _get_file_size(self, file_path: Path) -> int:
        """Obtener tamaño del archivo"""
        return file_path.stat().st_size
    
    def _should_exclude(self, path: Path) -> bool:
        """Verificar si un archivo/directorio debe ser excluido"""
        path_str = str(path)
        for pattern in self.exclude_patterns:
            if pattern in path_str:
                return True
        return False
    
    def create_backup(self, backup_type: str = "full", custom_paths: Dict[str, str] = None,
                     compression: str = "gzip", description: str = "") -> str:
        """Crear backup completo del sistema"""
        start_time = datetime.now()
        
        with self._lock:
            try:
                backup_id = self._generate_backup_id(backup_type)
                backup_name = f"shaili_backup_{backup_id}"
                backup_file = self.backup_dir / f"{backup_name}.tar.gz"
                
                self.logger.info(f"🔄 Iniciando backup {backup_id}: {backup_type}")
                
                # Usar paths personalizados o los predeterminados
                paths_to_backup = custom_paths or self.backup_paths
                
                # Crear archivo temporal para el backup
                with tempfile.NamedTemporaryFile(suffix='.tar', delete=False) as temp_file:
                    temp_path = Path(temp_file.name)
                
                try:
                    # Crear archivo tar
                    with tarfile.open(temp_path, "w") as tar:
                        for path_name, path_value in paths_to_backup.items():
                            source_path = Path(path_value)
                            if source_path.exists():
                                self.logger.info(f"📁 Respaldando {path_name}: {source_path}")
                                
                                # Añadir directorio al tar
                                tar.add(source_path, arcname=path_name, 
                                       filter=lambda info: None if self._should_exclude(Path(info.name)) else info)
                            else:
                                self.logger.warning(f"⚠️ Path no encontrado: {source_path}")
                    
                    # Comprimir con gzip
                    if compression == "gzip":
                        with open(temp_path, 'rb') as f_in:
                            with open(backup_file, 'wb') as f_out:
                                shutil.copyfileobj(f_in, f_out)
                        backup_file = self.backup_dir / f"{backup_name}.tar"
                        shutil.move(temp_path, backup_file)
                        
                        # Comprimir con gzip
                        with open(backup_file, 'rb') as f_in:
                            with gzip.open(f"{backup_file}.gz", 'wb') as f_out:
                                shutil.copyfileobj(f_in, f_out)
                        
                        # Eliminar archivo sin comprimir
                        backup_file.unlink()
                        backup_file = Path(f"{backup_file}.gz")
                    
                    # Calcular métricas
                    end_time = datetime.now()
                    duration = (end_time - start_time).total_seconds()
                    file_size = self._get_file_size(backup_file)
                    checksum = self._calculate_checksum(backup_file)
                    
                    # Calcular ratio de compresión
                    original_size = sum(
                        self._get_directory_size(Path(path)) 
                        for path in paths_to_backup.values() 
                        if Path(path).exists()
                    )
                    compression_ratio = (1 - file_size / original_size) * 100 if original_size > 0 else 0
                    
                    # Registrar en base de datos
                    with sqlite3.connect(self.db_path) as conn:
                        conn.execute("""
                            INSERT INTO backup_metadata 
                            (backup_id, backup_name, backup_type, file_path, file_size,
                             checksum, compression_ratio, backup_duration_seconds,
                             included_paths, metadata)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            backup_id, backup_name, backup_type, str(backup_file),
                            file_size, checksum, compression_ratio, duration,
                            json.dumps(list(paths_to_backup.keys())),
                            json.dumps({
                                "description": description,
                                "compression": compression,
                                "paths_backed_up": paths_to_backup
                            })
                        ))
                    
                    # Limpiar backups antiguos
                    self._cleanup_old_backups()
                    
                    self.logger.info(f"✅ Backup {backup_id} completado: {file_size / (1024*1024):.2f} MB")
                    return backup_id
                    
                finally:
                    # Limpiar archivo temporal
                    if temp_path.exists():
                        temp_path.unlink()
                        
            except Exception as e:
                self.logger.error(f"❌ Error creando backup: {e}")
                raise
    
    def _get_directory_size(self, directory: Path) -> int:
        """Calcular tamaño total de un directorio"""
        total_size = 0
        try:
            for item in directory.rglob('*'):
                if item.is_file() and not self._should_exclude(item):
                    total_size += item.stat().st_size
        except Exception as e:
            self.logger.warning(f"⚠️ Error calculando tamaño de {directory}: {e}")
        return total_size
    
    def list_backups(self, backup_type: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Listar backups disponibles"""
        with sqlite3.connect(self.db_path) as conn:
            query = "SELECT * FROM backup_metadata WHERE 1=1"
            params = []
            
            if backup_type:
                query += " AND backup_type = ?"
                params.append(backup_type)
            
            query += " ORDER BY created_at DESC LIMIT ?"
            params.append(limit)
            
            cursor = conn.execute(query, params)
            results = []
            
            for row in cursor.fetchall():
                results.append({
                    "backup_id": row[1],
                    "backup_name": row[2],
                    "backup_type": row[3],
                    "file_path": row[4],
                    "file_size_mb": row[5] / (1024 * 1024),
                    "checksum": row[6],
                    "created_at": row[7],
                    "status": row[8],
                    "compression_ratio": row[9],
                    "backup_duration_seconds": row[10],
                    "included_paths": json.loads(row[11]) if row[11] else [],
                    "metadata": json.loads(row[12]) if row[12] else {}
                })
            
            return results
    
    def get_backup_info(self, backup_id: str) -> Optional[Dict[str, Any]]:
        """Obtener información detallada de un backup"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT * FROM backup_metadata WHERE backup_id = ?
            """, (backup_id,))
            row = cursor.fetchone()
            
            if row:
                return {
                    "backup_id": row[1],
                    "backup_name": row[2],
                    "backup_type": row[3],
                    "file_path": row[4],
                    "file_size_mb": row[5] / (1024 * 1024),
                    "checksum": row[6],
                    "created_at": row[7],
                    "status": row[8],
                    "compression_ratio": row[9],
                    "backup_duration_seconds": row[10],
                    "included_paths": json.loads(row[11]) if row[11] else [],
                    "excluded_paths": json.loads(row[12]) if row[12] else [],
                    "metadata": json.loads(row[13]) if row[13] else {}
                }
            return None
    
    def restore_backup(self, backup_id: str, restore_path: str = None, 
                      verify_checksum: bool = True) -> bool:
        """Restaurar backup específico"""
        with self._lock:
            try:
                # Obtener información del backup
                backup_info = self.get_backup_info(backup_id)
                if not backup_info:
                    self.logger.error(f"❌ Backup {backup_id} no encontrado")
                    return False
                
                backup_file = Path(backup_info["file_path"])
                if not backup_file.exists():
                    self.logger.error(f"❌ Archivo de backup no encontrado: {backup_file}")
                    return False
                
                # Verificar checksum si es requerido
                if verify_checksum:
                    current_checksum = self._calculate_checksum(backup_file)
                    if current_checksum != backup_info["checksum"]:
                        self.logger.error(f"❌ Checksum no coincide para backup {backup_id}")
                        return False
                
                # Determinar directorio de restauración
                if restore_path:
                    restore_dir = Path(restore_path)
                else:
                    restore_dir = Path("restored_backup")
                
                restore_dir.mkdir(exist_ok=True)
                
                self.logger.info(f"🔄 Restaurando backup {backup_id} a {restore_dir}")
                
                # Extraer backup
                if backup_file.suffix == '.gz':
                    import gzip
                    with gzip.open(backup_file, 'rb') as f_in:
                        with open(restore_dir / "backup.tar", 'wb') as f_out:
                            shutil.copyfileobj(f_in, f_out)
                    
                    # Extraer tar
                    with tarfile.open(restore_dir / "backup.tar", "r") as tar:
                        tar.extractall(restore_dir)
                    
                    # Limpiar archivo temporal
                    (restore_dir / "backup.tar").unlink()
                else:
                    # Extraer directamente
                    with tarfile.open(backup_file, "r") as tar:
                        tar.extractall(restore_dir)
                
                self.logger.info(f"✅ Backup {backup_id} restaurado exitosamente en {restore_dir}")
                return True
                
            except Exception as e:
                self.logger.error(f"❌ Error restaurando backup {backup_id}: {e}")
                return False
    
    def verify_backup(self, backup_id: str) -> Dict[str, Any]:
        """Verificar integridad de un backup"""
        try:
            backup_info = self.get_backup_info(backup_id)
            if not backup_info:
                return {"valid": False, "error": "Backup no encontrado"}
            
            backup_file = Path(backup_info["file_path"])
            if not backup_file.exists():
                return {"valid": False, "error": "Archivo de backup no encontrado"}
            
            # Verificar checksum
            current_checksum = self._calculate_checksum(backup_file)
            checksum_valid = current_checksum == backup_info["checksum"]
            
            # Verificar que el archivo se puede abrir
            file_valid = False
            try:
                if backup_file.suffix == '.gz':
                    import gzip
                    with gzip.open(backup_file, 'rb') as f:
                        f.read(1024)  # Leer un poco para verificar
                else:
                    with tarfile.open(backup_file, "r") as tar:
                        tar.getmembers()  # Verificar que se puede leer
                file_valid = True
            except Exception as e:
                file_valid = False
                file_error = str(e)
            
            return {
                "valid": checksum_valid and file_valid,
                "backup_id": backup_id,
                "checksum_valid": checksum_valid,
                "file_valid": file_valid,
                "expected_checksum": backup_info["checksum"],
                "current_checksum": current_checksum,
                "file_error": file_error if not file_valid else None,
                "file_size_mb": backup_info["file_size_mb"]
            }
            
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def _cleanup_old_backups(self):
        """Limpiar backups antiguos manteniendo solo los más recientes"""
        with sqlite3.connect(self.db_path) as conn:
            # Obtener todos los backups ordenados por fecha
            cursor = conn.execute("""
                SELECT backup_id, file_path FROM backup_metadata 
                ORDER BY created_at DESC
            """)
            
            backups = cursor.fetchall()
            
            # Eliminar backups excedentes
            if len(backups) > self.max_backups:
                backups_to_delete = backups[self.max_backups:]
                
                for backup_id, file_path in backups_to_delete:
                    try:
                        # Eliminar archivo
                        backup_file = Path(file_path)
                        if backup_file.exists():
                            backup_file.unlink()
                        
                        # Eliminar registro de la BD
                        conn.execute("""
                            DELETE FROM backup_metadata WHERE backup_id = ?
                        """, (backup_id,))
                        
                        self.logger.info(f"🧹 Backup antiguo eliminado: {backup_id}")
                        
                    except Exception as e:
                        self.logger.error(f"❌ Error eliminando backup {backup_id}: {e}")
    
    def get_backup_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas de backups"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT 
                    COUNT(*) as total_backups,
                    COUNT(DISTINCT backup_type) as unique_types,
                    SUM(file_size) as total_size,
                    AVG(backup_duration_seconds) as avg_duration,
                    AVG(compression_ratio) as avg_compression,
                    MIN(created_at) as earliest_backup,
                    MAX(created_at) as latest_backup
                FROM backup_metadata
            """)
            result = cursor.fetchone()
            
            return {
                "total_backups": result[0],
                "unique_backup_types": result[1],
                "total_size_gb": (result[2] or 0) / (1024 * 1024 * 1024),
                "average_duration_seconds": result[3] or 0,
                "average_compression_ratio": result[4] or 0,
                "earliest_backup": result[5],
                "latest_backup": result[6],
                "max_backups_allowed": self.max_backups
            }
    
    def schedule_backup(self, backup_type: str = "full", interval_hours: int = 24,
                       description: str = "") -> str:
        """Programar backup automático (simulado - en producción usaría cron/celery)"""
        self.logger.info(f"📅 Backup programado: {backup_type} cada {interval_hours} horas")
        
        # En un entorno real, aquí se programaría con cron o celery
        # Por ahora, solo registramos la programación
        schedule_id = f"schedule_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return schedule_id

# Instancia global del gestor de backups
backup_manager = BackupManager()
