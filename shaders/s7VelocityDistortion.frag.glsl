uniform sampler2D uTexture;
uniform vec2 uPlaneSize;
uniform vec2 uImageSize;
uniform float uVelocity;
uniform float uRgbShift;
uniform float uStreakDir;
uniform float uTime;
uniform float uHasTexture;
uniform vec3 uPaperColor;
uniform vec3 uAccentColor;

varying vec2 vUv;

vec2 fitCoverUv(vec2 uv, vec2 planeSize, vec2 imageSize) {
  float planeAspect = planeSize.x / max(1.0, planeSize.y);
  float imageAspect = imageSize.x / max(1.0, imageSize.y);

  vec2 coverUv = uv;
  if (planeAspect > imageAspect) {
    // Stage is wider than portrait image: keep full width, crop vertically toward upper frame
    float scaleY = imageAspect / planeAspect;
    coverUv.y = (uv.y - 0.5) * scaleY + 0.56;
  } else {
    float scaleX = planeAspect / imageAspect;
    coverUv.x = (uv.x - 0.5) * scaleX + 0.5;
  }
  return clamp(coverUv, 0.002, 0.998);
}

void main() {
  if (uHasTexture < 0.5) {
    gl_FragColor = vec4(uPaperColor, 1.0);
    return;
  }

  float vel = clamp(uVelocity, -1.5, 1.5);
  float speed = abs(vel);

  // Subtle horizontal wave ripple driven by Lenis scroll velocity
  float ripple = sin(vUv.y * 15.0 + uTime * 2.6) * speed * 0.011;
  vec2 baseUv = fitCoverUv(vUv, uPlaneSize, uImageSize);
  baseUv.x = clamp(baseUv.x + ripple, 0.002, 0.998);

  // Directional chromatic dispersion offset scaled cleanly with scroll speed
  float shiftAmp = (0.0018 + speed * uRgbShift);
  vec2 offset = vec2(shiftAmp * 0.72, vel * uRgbShift * 0.95 * uStreakDir);

  float r = texture2D(uTexture, clamp(baseUv + offset, 0.002, 0.998)).r;
  float g = texture2D(uTexture, baseUv).g;
  float b = texture2D(uTexture, clamp(baseUv - offset, 0.002, 0.998)).b;

  // Keep monochrome integrity sharp at rest while allowing subtle kinetic RGB edge split
  float luma = dot(vec3(r, g, b), vec3(0.299, 0.587, 0.114));
  vec3 mono = vec3(luma);
  vec3 splitColor = vec3(r, g, b);
  float chromaticMix = clamp(speed * 0.75, 0.08, 0.85);
  vec3 color = mix(mono, splitColor, chromaticMix);

  // Subtle $signal Swiss streak rim when scrolling rapidly
  float edgeBand = smoothstep(0.0, 0.03, vUv.x) * (1.0 - smoothstep(0.97, 1.0, vUv.x));
  float verticalEdge = smoothstep(0.0, 0.03, vUv.y) * (1.0 - smoothstep(0.97, 1.0, vUv.y));
  float borderMask = 1.0 - edgeBand * verticalEdge;

  float streakLine = sin(vUv.y * 42.0 - uTime * 8.0 * sign(vel + 0.0001));
  float kineticTint = clamp((speed - 0.12) * 0.42, 0.0, 0.28) * max(0.0, streakLine);
  color = mix(color, uAccentColor, kineticTint * (1.0 - luma * 0.5));
  color = mix(color, mix(uPaperColor, uAccentColor, min(0.85, speed * 0.55)), borderMask * 0.35);

  gl_FragColor = vec4(color, 1.0);
}
