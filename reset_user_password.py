#!/usr/bin/env python3
"""
Script para resetear contraseña de usuario
"""

import psycopg2
import bcrypt

def reset_password(email, new_password):
    """Resetear contraseña de usuario"""
    try:
        # Conectar a PostgreSQL
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="sheily_ai_db",
            user="sheily_ai_user",
            password="SheilyAI2025SecurePassword"
        )
        
        cursor = conn.cursor()
        
        # Generar hash de la nueva contraseña
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Actualizar contraseña
        cursor.execute(
            "UPDATE users SET password = %s WHERE email = %s",
            (password_hash, email)
        )
        
        if cursor.rowcount > 0:
            conn.commit()
            print(f"✅ Contraseña actualizada para {email}")
            print(f"🔑 Nueva contraseña: {new_password}")
            return True
        else:
            print(f"❌ Usuario {email} no encontrado")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    # Resetear contraseña para sergiobalma.gomez@gmail.com
    email = "sergiobalma.gomez@gmail.com"
    new_password = "sheily123"
    
    print(f"🔄 Reseteando contraseña para {email}...")
    success = reset_password(email, new_password)
    
    if success:
        print("\n🎉 ¡Contraseña reseteada exitosamente!")
        print(f"📧 Email: {email}")
        print(f"🔑 Contraseña: {new_password}")
        print("\n🚀 Ahora puedes usar estas credenciales para hacer login en:")
        print("   http://localhost:3000")
    else:
        print("\n❌ No se pudo resetear la contraseña")
