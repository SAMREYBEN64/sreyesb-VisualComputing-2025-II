# Examen Final - Computación Visual

Samuel Reyes Benavides

## Punto 1 – Python: Procesamiento de Imágenes

### Descripción del Enfoque

Este proyecto implementa un pipeline completo de procesamiento de imágenes usando **OpenCV**, **Pillow** y **NumPy**. El sistema:

- **Carga imágenes** de forma interactiva
- **Aplica filtros** de procesamiento:
  - **Suavizado (Gaussian Blur)**: Reduce ruido y detalles finos
  - **Realce (Sharpen)**: Aumenta contraste local y nitidez de bordes
  - **Detección de bordes (Canny)**: Identifica contornos significativos
- **Separación de canales RGB**: Visualiza independientemente cada canal de color
- **Operaciones morfológicas** sobre imágenes binarizadas:
  - **Binarización Otsu**: Umbralización automática
  - **Opening**: Elimina ruido (manchas pequeñas)
  - **Closing**: Rellena huecos en objetos
- **Genera un GIF animado** mostrando la secuencia completa de transformaciones

### Resultados Principales

#### GIF con la secuencia de procesamiento:

![Resultados de Filtros y Morfología](python/gifs/resultados_secuencia.gif)

**Secuencia del GIF:**
1. Imagen original
2. Suavizado (Gaussian Blur)
3. Realce de bordes (Sharpen)
4. Imagen binarizada (Otsu)
5. Operación de apertura (Opening)
6. Operación de cierre (Closing)
7. Mapa de bordes (Canny)

---

## 🎨 Punto 2 – Three.js: Escena 3D Interactiva

### Descripción de la Escena

Aplicación web 3D desarrollada con **Three.js** y configurada con **Vite** como bundler. La escena contiene:

#### Figuras Geométricas (3 formas básicas con texturas):
1. **Cubo** - Con textura de puntos, animación de rotación en X e Y
2. **Esfera** - Con textura de puntos, animación de rotación en Y
3. **Pirámide** (cono de 4 lados) - Con textura de puntos, animación de rotación en Y

#### Características de la Escena:
- **Iluminación dual**: Luz ambiental + luz direccional con sombras
- **Plano con textura**: Piso con patrón de cuadrícula repetida
- **Todas las figuras proyectan y reciben sombras**

#### Interactividad:
- **OrbitControls**: Rotación, zoom y paneo de cámara con mouse
- **Cambio de perspectiva con teclado**:
  - **Tecla 1**: Vista diagonal (perspectiva por defecto)
  - **Tecla 2**: Vista superior (desde arriba)
- **Animaciones automáticas**: Rotación continua de las figuras

### Demostración Visual

#### GIF de la escena con animaciones y controles:

![Escena Three.js con Animaciones](threejs/gifs/threejs.gif)

**El GIF muestra:**
- Las 3 figuras geométricas con texturas aplicadas
- Animaciones de rotación automáticas
- Interacción con los controles de cámara
- Cambio entre diferentes perspectivas

---

## 🚀 Instrucciones de Ejecución

### Python - Notebook de Procesamiento de Imágenes

#### Opción 1: Google Colab (Recomendado)

1. **Abre el notebook en Google Colab**:
   - Subir el archivo `python/examen_final_python.ipynb` a Google Colab

2. **Ejecuta todas las celdas**:
   ```
   Runtime → Run all
   ```

3. **Subir una imagen** cuando se le solicite

4. **Descargar el GIF generado** (`resultados_secuencia.gif`)

#### Opción 2: Entorno Local

1. **Instalar las dependencias**:
   ```bash
   pip install pillow opencv-python numpy matplotlib imageio jupyter
   ```

2. **Iniciar Jupyter Notebook**:
   ```bash
   cd python
   jupyter notebook examen_final_python.ipynb
   ```

3. **Ejecutar todas las celdas** y proporcionar una imagen cuando se solicite

---

### Three.js - Visualización 3D

#### Requisitos Previos
- **Node.js** (versión 16 o superior)
- **npm** (viene con Node.js)

#### Pasos de Ejecución

1. **Navegar a la carpeta del proyecto**:
   ```powershell
   cd threejs
   ```

2. **Instalar las dependencias** (solo la primera vez):
   ```powershell
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```powershell
   npm run dev
   ```

4. **Abrir en el navegador**:
   - El terminal mostrará una URL (generalmente `http://localhost:5173`)
   - Abrir esa URL en su navegador web

5. **Interactuar con la escena**:
   - 🖱️ **Click + Arrastrar**: Rotar la cámara
   - 🖱️ **Scroll**: Hacer zoom in/out
   - ⌨️ **Tecla 1**: Vista en perspectiva diagonal
   - ⌨️ **Tecla 2**: Vista superior

---

## 📦 Tecnologías Utilizadas

### Python
- **OpenCV**: Procesamiento de imágenes y filtros
- **Pillow (PIL)**: Manipulación de imágenes
- **NumPy**: Operaciones matriciales
- **Matplotlib**: Visualización de resultados
- **imageio**: Generación de GIFs animados

### Three.js
- **Three.js v0.160.0**: Motor de renderizado 3D
- **Vite**: Build tool y dev server
- **OrbitControls**: Controles de cámara interactivos
- **WebGL**: Renderizado acelerado por hardware

---

## 👨‍💻 Notas Técnicas

### Python
- El notebook detecta automáticamente si se ejecuta en Google Colab
- Instala automáticamente dependencias faltantes cuando es posible
- Soporta carga de imágenes desde múltiples fuentes (upload, URL, local)
- Genera visualizaciones inline y exporta GIF animado

### Three.js
- Usa ES6 modules con Vite para hot-reload rápido
- Implementa shadow mapping para sombras realistas
- Texturas cargadas desde la carpeta `/textures/`
- Responsive design que se adapta al tamaño de ventana

---
