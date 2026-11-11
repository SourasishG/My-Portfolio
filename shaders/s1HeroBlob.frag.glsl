uniform vec3 uColorCyan;
uniform vec3 uColorViolet;
uniform vec3 uColorContour;
uniform float uScroll;
uniform float uOpacity;

varying float vDisplacement;
varying float vDepth;
varying float vRim;
varying float vContourFactor;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);

  // Discard corners outside circular point radius
  if (dist > 0.5) discard;

  // Soft luminous core falloff
  float alpha = smoothstep(0.5, 0.08, dist);

  // Mix $cyan (#4DA8FF) -> $violet (#B388F5) by noise displacement + Fresnel rim
  float gradientMix = clamp(vDisplacement * 0.65 + vRim * 0.45, 0.0, 1.0);
  vec3 baseColor = mix(uColorCyan, uColorViolet, gradientMix);

  // Bright cyan-white highlight on displaced outer crests
  float peak = smoothstep(0.72, 0.96, vDisplacement) * 0.35;
  baseColor = mix(baseColor, vec3(0.92, 0.96, 1.0), peak);

  // Morph toward clean white contour tint as uScroll -> 1
  vec3 finalColor = mix(baseColor, uColorContour, vContourFactor * 0.85 + uScroll * 0.25);

  // Dim rear hemisphere slightly so front topology reads cleanly
  float depthAtten = mix(1.0, 0.26, vDepth);
  float finalAlpha = alpha * depthAtten * uOpacity * mix(1.0, 0.45 + vContourFactor * 0.55, uScroll);

  gl_FragColor = vec4(finalColor, finalAlpha);
}
