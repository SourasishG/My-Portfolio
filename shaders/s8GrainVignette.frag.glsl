uniform float uTime;
uniform float uGrainOpacity;
uniform float uVignetteStrength;

varying vec2 vUv;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  // High-frequency luminance noise snapped to discrete animation frames for film grain feel
  float frameSeed = floor(uTime * 24.0);
  float noise = hash12(gl_FragCoord.xy + vec2(frameSeed * 17.31, frameSeed * 43.17));
  float centered = (noise - 0.5) * uGrainOpacity;

  // Soft radial edge vignette leaving central typography & WebGL sphere crisp
  vec2 centeredUv = vUv - vec2(0.5);
  float dist = length(centeredUv * vec2(1.0, 0.88));
  float vignette = smoothstep(0.38, 0.92, dist) * uVignetteStrength;

  // Render pure dark veil + grain so NormalBlending softly darkens corners and adds grain texture
  vec3 grainColor = vec3(noise > 0.5 ? 1.0 : 0.0);
  float alpha = clamp(abs(centered) + vignette, 0.0, 0.55);

  vec3 outColor = mix(vec3(0.0), grainColor, clamp(abs(centered) / max(0.001, alpha), 0.0, 0.45));
  gl_FragColor = vec4(outColor, alpha);
}
