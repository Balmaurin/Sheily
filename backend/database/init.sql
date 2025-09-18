-- Establecer propietario de esquema
ALTER SCHEMA public OWNER TO sheily_ai_user;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP
);

-- Establecer propietario de tabla
ALTER TABLE users OWNER TO sheily_ai_user;

-- Tabla de tokens de usuario
CREATE TABLE IF NOT EXISTS user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    tokens INTEGER DEFAULT 100,
    earned_tokens INTEGER DEFAULT 0,
    spent_tokens INTEGER DEFAULT 0,
    token_type VARCHAR(50) DEFAULT 'standard',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Establecer propietario de tabla
ALTER TABLE user_tokens OWNER TO sheily_ai_user;

-- Tabla de sesiones de entrenamiento
CREATE TABLE IF NOT EXISTS training_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    branch_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_exercises INTEGER DEFAULT 0,
    completed_exercises INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    model_config JSONB,
    metrics JSONB,
    model_details JSONB DEFAULT '{"baseModel": "Phi-3-mini", "quantization": "4bit", "domain": "general"}'
);

-- Establecer propietario de tabla
ALTER TABLE training_sessions OWNER TO sheily_ai_user;

-- Tabla de mensajes de chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_user BOOLEAN NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Establecer propietario de tabla
ALTER TABLE chat_messages OWNER TO sheily_ai_user;

-- Tabla de sesiones de chat
CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    model_used VARCHAR(100) DEFAULT 'phi3-mini-4bit',
    total_messages INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0
);

-- Establecer propietario de tabla
ALTER TABLE chat_sessions OWNER TO sheily_ai_user;

-- Tabla de conversaciones de chat
CREATE TABLE IF NOT EXISTS chat_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    model_used VARCHAR(100) NOT NULL,
    response_time FLOAT NOT NULL,
    tokens_used INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Establecer propietario de tabla
ALTER TABLE chat_conversations OWNER TO sheily_ai_user;

-- Tabla de transacciones de bóveda
CREATE TABLE IF NOT EXISTS vault_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Establecer propietario de tabla
ALTER TABLE vault_transactions OWNER TO sheily_ai_user;

-- Tabla de logs del sistema
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    log_level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Establecer propietario de tabla
ALTER TABLE system_logs OWNER TO sheily_ai_user;

-- Tabla de registro de modelos
CREATE TABLE IF NOT EXISTS model_registry (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL,
    base_model VARCHAR(255),
    training_dataset VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_training_date TIMESTAMP WITH TIME ZONE,
    total_training_time INTEGER,
    dataset_size INTEGER,
    model_size_mb FLOAT,
    hardware_used VARCHAR(50),
    version VARCHAR(50),
    description TEXT,
    performance_metrics JSONB,
    model_details JSONB
);

-- Establecer propietario de tabla
ALTER TABLE model_registry OWNER TO sheily_ai_user;

-- Tabla de métricas de entrenamiento por época
CREATE TABLE IF NOT EXISTS model_training_metrics (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    epoch INTEGER NOT NULL,
    accuracy FLOAT,
    loss FLOAT,
    f1_score FLOAT,
    learning_rate FLOAT,
    batch_size INTEGER,
    training_time_seconds FLOAT,
    memory_usage_mb FLOAT,
    gpu_utilization FLOAT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_name) REFERENCES model_registry(name) ON DELETE CASCADE
);

-- Establecer propietario de tabla
ALTER TABLE model_training_metrics OWNER TO sheily_ai_user;

-- Tabla de ejercicios de entrenamiento
CREATE TABLE IF NOT EXISTS training_exercises (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES training_sessions(session_id) ON DELETE CASCADE,
    exercise_id VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    user_answer TEXT,
    correct_answer TEXT NOT NULL,
    is_correct BOOLEAN,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Establecer propietario de tabla
ALTER TABLE training_exercises OWNER TO sheily_ai_user;

-- Tabla de prompts
CREATE TABLE IF NOT EXISTS prompts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    model_type VARCHAR(100) DEFAULT 'general',
    complexity VARCHAR(50) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Establecer propietario de tabla
ALTER TABLE prompts OWNER TO sheily_ai_user;

-- Tabla de evaluaciones de prompts
CREATE TABLE IF NOT EXISTS prompt_evaluations (
    id SERIAL PRIMARY KEY,
    prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    model_name VARCHAR(255) NOT NULL,
    metrics JSONB NOT NULL,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Establecer propietario de tabla
ALTER TABLE prompt_evaluations OWNER TO sheily_ai_user;

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_model_registry_name ON model_registry(name);
CREATE INDEX IF NOT EXISTS idx_model_registry_status ON model_registry(status);
CREATE INDEX IF NOT EXISTS idx_model_training_metrics_model_name ON model_training_metrics(model_name);
CREATE INDEX IF NOT EXISTS idx_model_training_metrics_epoch ON model_training_metrics(epoch);
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_model_type ON prompts(model_type);

-- Función para insertar métricas de entrenamiento
CREATE OR REPLACE FUNCTION insert_training_metrics(
    p_model_name VARCHAR(255),
    p_epoch INTEGER,
    p_accuracy FLOAT,
    p_loss FLOAT,
    p_f1_score FLOAT,
    p_learning_rate FLOAT DEFAULT NULL,
    p_batch_size INTEGER DEFAULT NULL,
    p_training_time_seconds FLOAT DEFAULT NULL,
    p_memory_usage_mb FLOAT DEFAULT NULL,
    p_gpu_utilization FLOAT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO model_training_metrics (
        model_name, epoch, accuracy, loss, f1_score, 
        learning_rate, batch_size, training_time_seconds, 
        memory_usage_mb, gpu_utilization
    ) VALUES (
        p_model_name, p_epoch, p_accuracy, p_loss, p_f1_score,
        p_learning_rate, p_batch_size, p_training_time_seconds,
        p_memory_usage_mb, p_gpu_utilization
    );
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar registro de modelo después del entrenamiento
CREATE OR REPLACE FUNCTION update_model_registry(
    p_name VARCHAR(255),
    p_type VARCHAR(100),
    p_base_model VARCHAR(255) DEFAULT NULL,
    p_training_dataset VARCHAR(255) DEFAULT NULL,
    p_total_training_time INTEGER DEFAULT NULL,
    p_dataset_size INTEGER DEFAULT NULL,
    p_model_size_mb FLOAT DEFAULT NULL,
    p_hardware_used VARCHAR(50) DEFAULT NULL,
    p_version VARCHAR(50) DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_performance_metrics JSONB DEFAULT NULL,
    p_model_details JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Insertar o actualizar modelo en el registro
    INSERT INTO model_registry (
        name, type, base_model, training_dataset, status, 
        last_training_date, total_training_time, dataset_size, 
        model_size_mb, hardware_used, version, description, 
        performance_metrics, model_details
    ) VALUES (
        p_name, p_type, p_base_model, p_training_dataset, 'trained', 
        CURRENT_TIMESTAMP, p_total_training_time, p_dataset_size, 
        p_model_size_mb, p_hardware_used, p_version, p_description, 
        p_performance_metrics, p_model_details
    )
    ON CONFLICT (name) DO UPDATE SET
        type = EXCLUDED.type,
        base_model = EXCLUDED.base_model,
        training_dataset = EXCLUDED.training_dataset,
        status = 'trained',
        last_training_date = CURRENT_TIMESTAMP,
        total_training_time = EXCLUDED.total_training_time,
        dataset_size = EXCLUDED.dataset_size,
        model_size_mb = EXCLUDED.model_size_mb,
        hardware_used = EXCLUDED.hardware_used,
        version = EXCLUDED.version,
        description = EXCLUDED.description,
        performance_metrics = EXCLUDED.performance_metrics,
        model_details = EXCLUDED.model_details;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar timestamp de actualización
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar triggers existentes antes de crearlos
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_user_tokens_updated_at ON user_tokens;
DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;

-- Triggers para actualizar timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tokens_updated_at BEFORE UPDATE ON user_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Datos iniciales de ejemplo
DO $$
BEGIN
    -- Registrar modelos de ejemplo
    PERFORM update_model_registry(
        'Sheily-Comprension-Model', 
        'Classification', 
        'Phi-3-mini', 
        'Corpus de Conversaciones en Español', 
        120, 
        50000, 
        500.5, 
        'GPU', 
        '1.0.0', 
        'Modelo de comprensión de texto en español',
        '{"best_accuracy": 0.9, "best_epoch": 10}',
        '{"baseModel": "Phi-3-mini", "quantization": "4bit", "domain": "general"}'
    );

    PERFORM update_model_registry(
        'Sheily-Matematicas-Model', 
        'LoRA', 
        'Phi-3-mini', 
        'Datos de Dominio Específico', 
        90, 
        25000, 
        350.2, 
        'GPU', 
        '1.0.0', 
        'Modelo especializado en matemáticas',
        '{"best_accuracy": 0.82, "best_epoch": 9}',
        '{"baseModel": "Phi-3-mini", "quantization": "4bit", "domain": "mathematics"}'
    );

    -- Insertar métricas de entrenamiento de ejemplo
    PERFORM insert_training_metrics(
        'Sheily-Comprension-Model', 1, 0.5, 1.2, 0.5, 
        0.001, 32, 300.5, 4096, 75.5
    );
    PERFORM insert_training_metrics(
        'Sheily-Comprension-Model', 5, 0.8, 0.5, 0.75, 
        0.0005, 32, 305.2, 4096, 80.2
    );
    PERFORM insert_training_metrics(
        'Sheily-Comprension-Model', 10, 0.9, 0.25, 0.87, 
        0.0001, 32, 310.0, 4096, 85.0
    );

    PERFORM insert_training_metrics(
        'Sheily-Matematicas-Model', 1, 0.4, 1.3, 0.4, 
        0.001, 32, 250.5, 4096, 70.5
    );
    PERFORM insert_training_metrics(
        'Sheily-Matematicas-Model', 5, 0.7, 0.6, 0.68, 
        0.0005, 32, 255.2, 4096, 75.2
    );
    PERFORM insert_training_metrics(
        'Sheily-Matematicas-Model', 9, 0.82, 0.35, 0.78, 
        0.0001, 32, 260.0, 4096, 80.0
    );
END $$;
