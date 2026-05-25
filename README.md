# SIATD - Sistema Inteligente de Apoyo a la Toma de Decisiones

![SIATD](https://img.shields.io/badge/SIATD-Decision%20Support%20System-blue?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?logo=spring&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

**Proyecto de Trabajo Grupal** | Herramienta avanzada para la toma de decisiones estructurada.

---

## 📋 Descripción

**SIATD** es una aplicación web completa que ayuda a usuarios a tomar decisiones complejas de manera **científica y estructurada**, utilizando el método multicriterio **TOPSIS** (Technique for Order of Preference by Similarity to Ideal Solution).

La plataforma permite definir un dilema, establecer criterios ponderados, evaluar alternativas y obtener una recomendación óptima con justificación matemática, gráficos y reporte exportable en PDF.

---

## ✨ Características Principales

- **Autenticación segura** con JWT (Registro e Inicio de sesión)
- **Gestión completa de decisiones** (crear, continuar, historial)
- **Definición de criterios** con pesos e impacto (beneficio/costo)
- **Definición de alternativas/opciones**
- **Matriz de Evaluación** interactiva (calificación 1-10)
- **Motor de Decisión TOPSIS** (algoritmo multicriterio avanzado)
- **Visualizaciones**: Gráfico de barras, Gráfico Radar y Análisis de Sensibilidad
- **Exportación de reportes** en PDF profesional
- **Historial de decisiones** guardadas
- **👤 Perfil de usuario**

---

## 🛠️ Tecnologías Utilizadas

### **Backend**
- Spring Boot 4.0 + Spring Security + JWT
- Spring Data JPA + PostgreSQL
- Algoritmo TOPSIS implementado

### **Frontend**
- React 19 + TypeScript
- Vite + Tailwind CSS
- Zustand + Recharts + React Hook Form

---

## 🚀 Cómo Ejecutar el Proyecto

### Requisitos
- Java 21
- Node.js 20+
- PostgreSQL

### Backend
```bash
cd siatd-backend
./mvnw spring-boot:run

👥 Integrantes

Juan Saavedra
Raul Zurita

📄 Licencia
Este proyecto fue desarrollado con fines académicos como trabajo grupal.
