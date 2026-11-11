uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uScroll;
uniform float uDisplacementAmp;
uniform float uNoiseFreq;
uniform float uCurlMix;
uniform float uBasePointSize;
uniform float uPixelRatio;

attribute float aSeed;

varying float vDisplacement;
varying float vDepth;
varying float vRim;
varying float vContourFactor;

// @include simplex3d

void main() {
  vec3 unitDir = normalize(position);

  // Slow harmonic noise + curl swirl displacement along sphere normal
  vec3 noiseSample = unitDir * uNoiseFreq + vec3(uTime * 0.14, uTime * 0.19, -uTime * 0.11);
  float scalarNoise = snoise(noiseSample);
  float secondaryNoise = snoise(noiseSample * 2.1 - vec3(uTime * 0.08));
  float combinedNoise = scalarNoise * 0.72 + secondaryNoise * 0.28;

  vec3 curlOffset = curlNoise(unitDir * (uNoiseFreq * 0.85) + vec3(uTime * 0.12));

  // As uScroll increases (0 -> 1), hero blob calms and aligns toward S2 contour bands
  float activeAmp = uDisplacementAmp * mix(1.0, 0.22, uScroll);
  vec3 displaced = position + unitDir * (combinedNoise * activeAmp) + curlOffset * (uCurlMix * activeAmp * 0.55);

  // Subtle topographic snapping when morphing toward S2
  float bandPhase = fract((unitDir.y + combinedNoise * 0.35) * 9.0);
  float contourHighlight = 1.0 - smoothstep(0.06, 0.18, abs(bandPhase - 0.5));
  vContourFactor = contourHighlight * uScroll;

  // Pointer repulsion + tangential swirl in object/view plane
  vec3 worldPointer = vec3(uPointer * 1.85, 0.8);
  vec3 toPoint = displaced - worldPointer;
  float dist = length(toPoint.xy);
  float influence = smoothstep(1.35, 0.0, dist) * uPointerStrength * (1.0 - uScroll * 0.75);

  vec2 radialDir = dist > 0.0001 ? normalize(toPoint.xy) : vec2(0.0, 1.0);
  vec2 tangentDir = vec2(-radialDir.y, radialDir.x);

  displaced.xy += (radialDir * 0.32 + tangentDir * 0.24) * influence;
  displaced.z += influence * 0.18;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // View-space fake normal / rim calculation for cyan->violet shading
  vec3 viewNormal = normalize(normalMatrix * normalize(displaced));
  vec3 viewDir = normalize(-mvPosition.xyz);
  vRim = 1.0 - max(0.0, dot(viewNormal, viewDir));

  vDisplacement = clamp(combinedNoise * 0.5 + 0.5, 0.0, 1.0);
  vDepth = clamp((-mvPosition.z - 2.0) / 5.5, 0.0, 1.0);

  // Depth-attenuated point size with subtle organic seed variation
  float seedScale = 0.8 + aSeed * 0.45;
  float size = uBasePointSize * uPixelRatio * seedScale * (3.8 / max(1.2, -mvPosition.z));
  size *= mix(0.78, 1.25, vDisplacement);
  size *= mix(1.0, 0.72 + contourHighlight * 0.6, uScroll);
  gl_PointSize = clamp(size, 1.2, 13.0);
}
