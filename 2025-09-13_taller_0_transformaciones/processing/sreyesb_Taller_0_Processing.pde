// Cubo animado en 3D con transformaciones y animación temporal

void setup() {
  size(600, 600, P3D); // Ventana 3D de 600x600
  noStroke();          // Sin bordes en el cubo
}

void draw() {
  background(30); // Fondo oscuro

  // Centrar el sistema de coordenadas en el centro de la ventana
  translate(width/2, height/2, 0);

  // t: tiempo en segundos usando millis()
  float t = millis() * 0.002;

  // Animación de escala (varía cíclicamente)
  float escala = 1.2 + sin(t) * 0.5;

  // Animación de traslación (movimiento ondulado)
  float x = sin(t) * 150;
  float y = cos(t * 0.5) * 80;

  // Animación de rotación
  float rotY = t;
  float rotX = t * 0.7;

  // Aíslamos las transformaciones para el cubo
  pushMatrix();

  translate(x, y, 0); // Mueve el cubo de forma ondulada
  rotateY(rotY);      // Rota sobre eje Y
  rotateX(rotX);      // Rota sobre eje X
  scale(escala);      // Escala el cubo

  fill(0, 180, 255);  // Color azul claro
  box(100);           // Dibuja el cubo

  popMatrix(); // Restauramos el sistema de coordenadas
}
