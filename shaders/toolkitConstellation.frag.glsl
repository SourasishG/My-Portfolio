precision highp float;

uniform vec3 uColorBase;
uniform vec3 uColorCore;
uniform vec3 uColorExploring;
uniform float uAccentMix;
uniform float uActivityBoost;
uniform float uOpacity;

varying float vSeed;
varying float vProximity;

void main() {
  vec2 centered = gl_PointCoord - 0.5;
  float dist = length(centered);
  if (dist > 0.5) discard;

  float softCircle = 1.0 - smoothstep(0.18, 0.5, dist);
  vec3 activeTint = mix(uColorCore, uColorExploring, clamp(uAccentMix, 0.0, 1.0));
  vec3 tint = mix(uColorBase, activeTint, 0.35 + vProximity * 0.55);

  float alpha = softCircle * uOpacity * (0.55 + vSeed * 0.25 + vProximity * (0.38 + uActivityBoost * 0.25));
  gl_FragColor = vec4(tint, clamp(alpha, 0.0, 0.85));
}
