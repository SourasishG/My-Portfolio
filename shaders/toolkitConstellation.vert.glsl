uniform float uTime;
uniform vec2 uPointer;
uniform float uPixelRatio;
uniform float uActivityBoost;

attribute float aSeed;
attribute float aScale;

varying float vSeed;
varying float vProximity;

void main() {
  vSeed = aSeed;

  vec3 pos = position;

  // Restrained harmonic drift per constellation node
  float phase = aSeed * 6.2831853 + uTime * (0.28 + aSeed * 0.22);
  pos.x += sin(phase) * 0.12;
  pos.y += cos(phase * 0.87) * 0.1;
  pos.z += sin(phase * 0.63 + 1.4) * 0.08;

  // Smooth parallax shift coupled to normalized pointer coordinates
  pos.x += uPointer.x * (0.18 + aSeed * 0.14);
  pos.y += uPointer.y * (0.14 + aSeed * 0.11);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  vec2 ndcPos = gl_Position.xy / max(0.0001, gl_Position.w);
  float ptrDist = length(ndcPos - uPointer);
  vProximity = 1.0 - smoothstep(0.05, 0.72, ptrDist);

  float depthFactor = clamp(5.2 / max(1.0, -mvPosition.z), 0.5, 1.85);
  float pointPx = (aScale * 2.1 + vProximity * (1.8 + uActivityBoost * 1.4)) * uPixelRatio * depthFactor;
  gl_PointSize = clamp(pointPx, 1.25, 12.0);
}
