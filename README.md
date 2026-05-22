<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🏆 My Fantasy Football: Plataforma de Gestión y Estadísticas de Equipos

Plataforma interactiva premium desarrollada en **React 19**, **Vite 6** y **Tailwind v4** para gestionar ligas de fútbol, plantillas personalizadas, estadísticas de jugadores y registros de partidos en tiempo real. 

Este proyecto combina una interfaz de usuario fluida con análisis de rendimiento avanzados y soporte para importación y emparejamiento inteligente de datos a través de hojas de cálculo.

---

## ✨ Características Principales de la Aplicación (Funcionalidades)

### 📋 1. Gestión de Plantilla e Importación Inteligente
*   **Importación Masiva desde Excel/CSV:** Carga la plantilla completa de tu equipo en un solo paso mediante un archivo de Excel (`.xlsx`, `.xls`) o `.csv`.
*   **Detector Automático de Roles/Posiciones:** Parsea posiciones tradicionales y en varios idiomas (GK/Portero, DEF/Defensa, MID/Medio, FWD/Delantero, COACH/Míster).
*   **Generador Inteligente de Dorsales:** Asigna automáticamente dorsales libres (1-99) a aquellos jugadores que no tengan uno especificado en el archivo de origen.
*   **Gestión de Jugadores Personalizados:** Añade individualmente jugadores con nombre, posición y dorsal personalizado.

### ⚽ 2. Entrada de Partidos y Analítica Avanzada
*   **Formulario Detallado de Encuentros:** Registra la fecha del partido, el rival, el marcador final y el rendimiento individual de cada jugador (minutos jugados, tarjetas, goles, asistencias y calificación).
*   **Carga de Estadísticas de Partido por Hoja de Cálculo:** Sube las estadísticas del encuentro directamente desde un Excel y mapea automáticamente el rendimiento de toda la plantilla.
*   **Asistente de Resolución Difusa (Fuzzy Resolver):** Si los nombres de los jugadores en la hoja de cálculo no coinciden exactamente con los de tu plantilla local, el asistente sugiere coincidencias utilizando un algoritmo de similitud de cadenas de texto y te permite mapearlos manualmente o ignorar filas.
*   **Validaciones de Integridad de Datos:** Comprobaciones en tiempo real para evitar que la suma de goles/asistencias individuales supere el marcador del equipo, o que se elija más de un MVP (Man of the Match) por encuentro.

### 🎴 3. Fichas de Jugadores Estilo FUT y Gráficos Radar
*   **Cartas Virtuales Estilo FIFA (FUT Card):** Visualización interactiva del promedio de valoración (OVR), dorsal, posición y atributos individuales del jugador.
*   **Gráfico de Atributos Radar (Recharts):** Representación visual de las habilidades del jugador (Ritmo, Tiro, Pase, Regate, Defensa y Físico) basada en sus estadísticas históricas.
*   **Historial de Calificaciones:** Gráfico de líneas dinámico que traza la tendencia de las calificaciones del jugador partido a partido.
*   **Registro Detallado de Partidos (Matches Log):** Tabla que muestra el rendimiento detallado de un jugador en cada encuentro disputado.
*   **Vinculación de Perfil (Mark Me):** Permite a un usuario vincular una carta de jugador de la plantilla a su propia cuenta de usuario.

### 🏆 4. Gestión de Ligas y Clasificación Dinámica
*   **Múltiples Temporadas/Ligas:** Crea y administra diferentes ligas especificando el año, nombre y equipos rivales.
*   **Tabla de Posiciones Dinámica:** Genera la clasificación en tiempo real en función de los partidos registrados, mostrando partidos jugados (PJ), ganados (PG), empatados (PE), perdidos (PP), goles a favor (GF), goles en contra (GC), puntos (PTS) y la racha de forma de los últimos 5 partidos.
*   **Tabla de Líderes Ordenable:** Consulta los líderes de rendimiento en minutos jugados, goles, asistencias, promedio de valoración y puntos fantasy globales.

### 🔗 5. Sincronización y Backend Concurrente
*   **Modo Offline y Migración Directa:** La aplicación funciona inicialmente en local (`localStorage`). Al iniciar sesión o registrarse, un sistema de migración automática transfiere todos tus datos guardados localmente al servidor de base de datos remoto.
*   **Sincronización en Tiempo Real:** Las configuraciones del equipo, plantillas, ligas, historial de encuentros y estadísticas individuales se sincronizan de manera segura en la nube.
*   **Persistencia Robusta:** Backend con SQLite para almacenar la información relacional de manera eficiente mediante tablas optimizadas.

---

## 🤖 Capacidades del Asistente de IA (Antigravity) en el Proyecto

Como tu asistente de codificación de IA (Pair Programmer), estoy diseñado para ayudarte a expandir, optimizar y refactorizar este proyecto. A continuación se presentan las tareas y posibilidades que puedo realizar directamente en este repositorio:

### 🛠️ 1. Refactorización y Modularización de Componentes
*   **División de Vistas Grandes:** Puedo fragmentar archivos React gigantescos (de más de 800 líneas) en subcomponentes pequeños, aislados y enfocados, utilizando co-locación de estado para no interferir en el flujo de datos.
*   **Optimización del Ciclo de Vida de React:** Reubico funciones de renderizado declaradas dentro de otros componentes fuera del ciclo de render para evitar re-creaciones de DOM innecesarias (ej. solucionar el warning de `react-hooks/static-components`).
*   **Tipado Estricto de TypeScript:** Reemplazo usos genéricos de `any` por tipos e interfaces detalladas (como `Player`, `MatchRecord`, `Performance`, etc.) para asegurar el tipado fuerte y autocompletado en el IDE.

### 🔌 2. Gestión de Dependencias y Configuración de Herramientas
*   **Integración de ESLint v9 (Flat Config):** Configuro e instalo los plugins modernos de ESLint para React y TypeScript, estableciendo reglas personalizadas y resolviendo cualquier advertencia o error de compilación.
*   **Configuración de Alias de Rutas (`@/*`):** Mantengo sincronizados los alias en `tsconfig.json` y `vite.config.ts` para posibilitar imports limpios desde la raíz de la aplicación.
*   **Creación de Scripts de Automatización:** Implemento flujos concurrentes (usando `concurrently`), builds de producción y scripts de limpieza de caché.

### 🖥️ 3. Pruebas y Validación de la Aplicación
*   **Ejecución de Linter y Builds:** Valido la integridad de la base de código corriendo localmente `npm run lint` y `npm run build` para asegurar compilaciones exitosas.
*   **Depuración de Rutas de API y Base de Datos:** Investigo logs del servidor Express, depuro consultas SQL en el archivo SQLite (`database.sqlite`) y soluciono cuellos de botella en la sincronización.

---

## 🛠️ Arquitectura del Código

El proyecto sigue una estructura limpia de React, TypeScript y Node.js:

*   **Co-locación de Estado (State Colocation):** Las vistas principales actúan como contenedores puros de estado, delegando la presentación a subcomponentes pequeños y reutilizables en carpetas dedicadas (ej. `src/components/match-input/`, `src/components/player-detail/`, `src/components/team-settings/`).
*   **Capa de Servicios de API:** Las peticiones HTTP y operaciones de red están completamente aisladas en [src/services/api.ts](file:///c:/Users/luism/Documents/Software/React/my-fantasy-football/src/services/api.ts).
*   **Alias de Rutas (`@/*`):** La importación de módulos utiliza alias absolutos mapeados a la carpeta `src` en [tsconfig.json](file:///c:/Users/luism/Documents/Software/React/my-fantasy-football/tsconfig.json) y [vite.config.ts](file:///c:/Users/luism/Documents/Software/React/my-fantasy-football/vite.config.ts).
*   **Controladores y Middleware en Backend:** Estructura modular en el backend (`backend/src/`) con adaptadores de bases de datos SQLite (`sqlite.db.ts`), middlewares de seguridad (`auth.ts` con JWT, limitador de peticiones `rateLimit`) y puertos de conexión definidos para facilitar futuras migraciones (ej. a Postgres o Supabase).

---

## 🚀 Instrucciones para Ejecución Local

### Requisitos Previos
*   **Node.js** (versión v18 o superior recomendada)

### Pasos para Ejecutar
1.  **Instalar dependencias:**
    ```bash
    npm install
    cd backend
    npm install
    cd ..
    ```
2.  **Configurar Variables de Env:**
    Crea un archivo `.env` en la raíz de `backend` con las variables requeridas (como `JWT_SECRET`).
3.  **Ejecutar la aplicación (Frontend y Backend en paralelo):**
    ```bash
    npm run dev
    ```
    *Esto utilizará `concurrently` para lanzar el servidor Vite para el frontend y el servidor Node para el backend simultáneamente.*

### Scripts Adicionales
*   **Linting (ESLint):**
    ```bash
    npm run lint
    ```
*   **Compilación de Producción:**
    ```bash
    npm run build
    ```
