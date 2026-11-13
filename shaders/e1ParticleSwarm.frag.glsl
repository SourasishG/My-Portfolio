varying vec3 vColor;
varying float vAlpha;

void main() {
  // Circular soft particle sprite
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) {
    discard;
  }

  // Smooth radial falloff
  float alpha = smoothstep(0.5, 0.08, dist) * vAlpha;

  gl_FragColor = vec4(vColor, alpha);
}
