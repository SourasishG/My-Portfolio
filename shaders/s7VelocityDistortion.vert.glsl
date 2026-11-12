uniform float uVelocity;
uniform float uStreakDir;

varying vec2 vUv;

void main() {
  vUv = uv;

  // Restrained kinetic scroll shear strictly along viewport vertical momentum
  float clampedVel = clamp(uVelocity, -1.5, 1.5);
  vec3 pos = position;
  pos.y += (uv.x - 0.5) * clampedVel * 0.022 * uStreakDir;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
