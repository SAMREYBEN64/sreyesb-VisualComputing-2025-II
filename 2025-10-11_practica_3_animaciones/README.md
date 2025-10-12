# Práctica 3

## 1. Animar un modelo de una pierna con cinemática directa

**Método usado:**  
Se empleó **cinemática directa (Forward Kinematics, FK)** para animar la pierna.  
La animación se realiza creando una cadena jerárquica de pivotes (cadera, rodilla, tobillo y pie) donde cada segmento de la pierna es controlado rotando sus propios pivotes, desde la cadera hacia el pie. Los ángulos de rotación se animan manualmente en el bucle principal para simular el movimiento natural de una caminata.  
Esta técnica permite controlar el movimiento de cada articulación de forma sencilla y directa, propagando los cambios de rotación a lo largo de la jerarquía.

**GIF de la animación de la pierna:**  
> ![Punto1.gif](Punto1/Punto1.gif)

---

## 2. Animar un modelo de una grúa con cinemática inversa

**Método usado:**  
Para la grúa se usó **cinemática inversa (Inverse Kinematics, IK)** en la parte superior.  
El sistema consiste en agrupar todos los componentes superiores de la grúa (menos la base) bajo un pivote (`upperPivot`), el cual rota sobre su eje vertical para simular el giro de la parte superior de la grúa.  
En este caso, la animación se basa en definir el ángulo de rotación del pivote principal, calculado en tiempo real con funciones trigonométricas para generar el movimiento oscilante.  

**GIF de la animación de la grúa:**  
> ![Punto2.gif](Punto2/Punto2.gif)

---

## 3. Crear una animación de 30 segundos tomando en cuenta dos de los 12 principios de animación

**Principios utilizados:**  
- **Squash & Stretch:** El cubo se aplasta al tocar el suelo y se estira al saltar, mostrando elasticidad y vida en el movimiento.
- **Puesta en escena (Staging):** El cubo está resaltado mediante un círculo luminoso en el piso, iluminación especial, colores cambiantes en cada salto y cámara fija, asegurando que la atención del espectador se mantenga en el protagonista durante la animación.

**Técnica:**  
La animación fue realizada mediante programación en JavaScript utilizando **THREE.js**. Se manipulan en tiempo real las transformaciones (posición, escala y color) del cubo, aplicando interpolaciones y funciones de animación para lograr los efectos de squash & stretch y puesta en escena. Además, el cubo realiza saltos constantes y dinámicos en un recorrido circular durante 30 segundos.

**Software empleado:**  
- **THREE.js:** Motor de gráficos 3D para la web, usado para modelado, render y animación.
- **Node.js y Vite:** Utilizados como entorno y servidor local para correr y desarrollar las animaciones en tiempo real.
- **Editor de código:** Visual Studio Code.
- **Herramienta de captura de gifs:** Para obtener los gifs de las animaciones resultantes.

**GIF de la animación de los principios de animación:**  
> ![Punto3.gif](Punto3/Punto3.gif)

---