# Ejemplo de Machine Learning con Scikit-learn
# Clasificación de flores Iris usando Regresión Logística

import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

# Cargar conjunto de datos Iris
iris = load_iris()
X, y = iris.data, iris.target

# Dividir datos en entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# Escalar características
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Entrenar modelo de Regresión Logística
modelo = LogisticRegression(max_iter=200)
modelo.fit(X_train_scaled, y_train)

# Predicciones
predicciones = modelo.predict(X_test_scaled)

# Métricas de rendimiento
print("Precisión del modelo:", accuracy_score(y_test, predicciones))
print("\nMatriz de Confusión:")
print(confusion_matrix(y_test, predicciones))
print("\nReporte de Clasificación:")
print(classification_report(y_test, predicciones, target_names=iris.target_names))
