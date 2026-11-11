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

  // Soft luminous core falloff with vibrant center pinpoint
  float alpha = smoothstep(0.5, 0.04, dist);
  float coreBoost = smoothstep(0.28, 0.0, dist) * 0.45;

  // Mix $cyan (#4DA8FF) -> $violet (#B388F5) across displacement waves + Fresnel rim
  float gradientMix = smoothstep(0.16, 0.88, vDisplacement * 0.52 + vRim * 0.48);
  vec3 baseColor = mix(uColorCyan, uColorViolet, gradientMix);

  // Luminous cyan-white glint on displaced outer wave crests
  float peak = smoothstep(0.62, 0.94, vDisplacement) * 0.52;
  baseColor = mix(baseColor, vec3(0.75, 0.93, 1.0), peak);
  baseColor *= (1.15 + coreBoost);

  // Morph toward clean white contour tint as uScroll -> 1
  vec3 finalColor = mix(baseColor, uColorContour, vContourFactor * 0.85 + uScroll * 0.25);

  // Dim rear hemisphere moderately while keeping front wave crests luminous
  float depthAtten = mix(1.0, 0.32, vDepth);
  float finalAlpha = clamp((alpha + coreBoost * 0.35) * depthAtten * uOpacity * mix(1.0, 0.5 + vContourFactor * 0.55, uScroll), 0.0, 1.0);

  gl_FragColor = vec4(finalColor, finalAlpha);
}
