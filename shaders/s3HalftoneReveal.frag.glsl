precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform vec2 uPlaneSize;
uniform vec2 uImageSize;
uniform vec2 uMouse;
uniform float uRevealRadius;
uniform float uDotDensity;
uniform float uTime;
uniform float uHasTexture;
uniform vec3 uBgColor;
uniform vec3 uHalftoneTint;
uniform vec3 uRingAccent;

vec2 fitContainUv(vec2 uv, vec2 planeSize, vec2 imageSize) {
  float planeAspect = planeSize.x / max(planeSize.y, 1.0);
  float imageAspect = imageSize.x / max(imageSize.y, 1.0);
  vec2 scale = vec2(1.0);

  if (planeAspect > imageAspect) {
    scale.x = planeAspect / imageAspect;
  } else {
    scale.y = imageAspect / planeAspect;
  }

  return (uv - 0.5) * scale + 0.5;
}

void main() {
  if (uHasTexture < 0.5) {
    gl_FragColor = vec4(uBgColor, 1.0);
    return;
  }

  vec2 imgUv = fitContainUv(vUv, uPlaneSize, uImageSize);

  // Subtle architectural margins when image aspect differs from 16:9 stage
  float inX = step(0.0, imgUv.x) * step(imgUv.x, 1.0);
  float inY = step(0.0, imgUv.y) * step(imgUv.y, 1.0);
  float inBounds = inX * inY;

  if (inBounds < 0.5) {
    // Faint millimeter tick grid along letterbox margin
    vec2 marginPx = vUv * uPlaneSize;
    float grid = step(0.96, fract(marginPx.x / 24.0)) * step(0.96, fract(marginPx.y / 24.0));
    vec3 marginCol = mix(uBgColor, uHalftoneTint, grid * 0.08);
    gl_FragColor = vec4(marginCol, 1.0);
    return;
  }

  vec3 texColor = texture2D(uTexture, clamp(imgUv, 0.001, 0.999)).rgb;

  // Square-pixel halftone grid sampled at cell centers for crisp geometric dots
  vec2 pixelPos = vUv * uPlaneSize;
  float cellPx = max(5.5, uPlaneSize.y / max(24.0, uDotDensity));
  vec2 cellIndex = floor(pixelPos / cellPx);
  vec2 cellCenterPx = (cellIndex + 0.5) * cellPx;
  vec2 cellUv = fract(pixelPos / cellPx) - 0.5;

  vec2 centerImgUv = fitContainUv(cellCenterPx / uPlaneSize, uPlaneSize, uImageSize);
  vec3 centerSample = texture2D(uTexture, clamp(centerImgUv, 0.001, 0.999)).rgb;
  float luma = dot(centerSample, vec3(0.2126, 0.7152, 0.0722));

  // Keep dark UI surfaces slightly textured while spotlighting luminous UI typography
  float dotRadius = mix(0.11, 0.48, pow(clamp(luma, 0.0, 1.0), 0.78));
  float dotDist = length(cellUv);
  float dotMask = 1.0 - smoothstep(dotRadius - 0.08, dotRadius + 0.08, dotDist);

  // Subtle monochrome + cyan halftone ink palette + faint underlying color trace
  vec3 monoInk = mix(vec3(0.84, 0.87, 0.94), uHalftoneTint, smoothstep(0.15, 0.88, luma) * 0.42);
  vec3 halftoneColor = mix(uBgColor + texColor * 0.08, mix(centerSample * 0.35 + monoInk * 0.65, monoInk, 0.52), dotMask);

  // Aspect-normalized radial reveal lens centered at uMouse
  float aspect = uPlaneSize.x / max(uPlaneSize.y, 1.0);
  vec2 delta = (vUv - uMouse) * vec2(aspect, 1.0);
  float angle = atan(delta.y, delta.x);
  float waveRipple = sin(angle * 7.0 + uTime * 2.4) * 0.006 * smoothstep(0.02, 0.25, uRevealRadius);
  float radialDist = length(delta) + waveRipple;

  float revealMask = 1.0 - smoothstep(uRevealRadius - 0.09, uRevealRadius + 0.02, radialDist);

  // Luminous boundary ring during active reveal transition
  float ringBand =
    smoothstep(uRevealRadius - 0.035, uRevealRadius - 0.005, radialDist) *
    (1.0 - smoothstep(uRevealRadius - 0.005, uRevealRadius + 0.028, radialDist));
  float ringStrength = smoothstep(0.04, 0.22, uRevealRadius) * (1.0 - smoothstep(1.05, 1.35, uRevealRadius));
  vec3 boundaryGlow = mix(uHalftoneTint, uRingAccent, 0.32) * ringBand * ringStrength * 0.65;

  vec3 finalColor = mix(halftoneColor, texColor, revealMask) + boundaryGlow;
  gl_FragColor = vec4(finalColor, 1.0);
}
