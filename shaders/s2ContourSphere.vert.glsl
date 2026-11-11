uniform float uTime;
uniform float uNoiseScale;
uniform float uDisplacementAmp;
uniform float uSplitProgress;
uniform float uSplitGap;

varying vec3 vObjectPos;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vSplitSide;
varying float vSeamProximity;

// @include simplex3d

void main() {
  vec3 dir = normalize(position);

  // Gentle organic height perturbation for contour elevation
  float n = snoise(dir * (uNoiseScale * 0.75) + vec3(0.0, uTime * 0.06, uTime * 0.04));
  vec3 basePos = position + dir * (n * uDisplacementAmp);

  // Angled split plane (reference 5 diagonal split aesthetic)
  vec3 splitAxis = normalize(vec3(0.32, 0.92, 0.18));
  float sideDist = dot(dir, splitAxis);
  float side = sideDist >= 0.0 ? 1.0 : -1.0;

  // Separate two halves along splitAxis and introduce slight opposing tilt
  vec3 offset = splitAxis * (side * uSplitGap * uSplitProgress);
  vec3 finalPos = basePos + offset;

  vec4 mvPos = modelViewMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mvPos;

  vObjectPos = basePos;
  vNormal = normalize(normalMatrix * normal);
  vViewPos = -mvPos.xyz;
  vSplitSide = side;
  vSeamProximity = 1.0 - smoothstep(0.0, 0.08, abs(sideDist));
}
