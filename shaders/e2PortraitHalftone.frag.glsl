uniform sampler2D uTexture;
uniform sampler2D uDepthMap;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uRevealRadius;
uniform float uDotScale;
uniform float uDotMinRadius;
uniform float uDotMaxRadius;
uniform float uDissolve;
uniform vec3 uInkColor;
uniform vec3 uDotColor;
uniform vec3 uRimColor;
uniform float uRimStrength;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDepth;

void main() {
  // Sample B&W texture with alpha channel
  vec4 tex = texture2D(uTexture, vUv);

  // Alpha cutoff for cutout silhouette
  if (tex.a < 0.05) {
    discard;
  }

  // Enhanced contrast photograph so features (eyes, glasses, smile, hair) are crisp
  vec3 photo = pow(tex.rgb, vec3(1.12)) * 1.08;
  float luminance = dot(photo, vec3(0.299, 0.587, 0.114));

  // Halftone dot-screen grid calculation (1:1 square UV space)
  vec2 gridCoord = vUv * uDotScale;
  vec2 cellIndex = floor(gridCoord);
  vec2 cellFraction = fract(gridCoord) - 0.5;
  float distToCenter = length(cellFraction);

  // Radius of halftone dot modulated by luminance
  float targetRadius = mix(uDotMinRadius, uDotMaxRadius, luminance);

  // Dissolve shrink / fade
  if (uDissolve > 0.0) {
    targetRadius *= max(0.0, 1.0 - uDissolve * 1.3);
  }

  // Tight anti-aliased dot mask (never blur the dots)
  float fw = clamp(fwidth(distToCenter), 0.008, 0.038);
  float dotMask = 1.0 - smoothstep(targetRadius - fw, targetRadius + fw, distToCenter);

  // Interactive cursor reveal lens (in 1:1 UV space)
  float distToPointer = length(vUv - uPointer);
  float lensFactor = 1.0 - smoothstep(uRevealRadius * 0.45, uRevealRadius, distToPointer);

  // Subtle lens rim halo (ember or cyan accent)
  float haloWidth = 0.035;
  float lensHalo = smoothstep(uRevealRadius - haloWidth, uRevealRadius, distToPointer)
                 * (1.0 - smoothstep(uRevealRadius, uRevealRadius + haloWidth, distToPointer));

  // Depth-derived back-left rim lighting (T2)
  vec2 texel = 1.0 / uResolution;
  float dLeft = texture2D(uDepthMap, vUv - vec2(texel.x * 2.0, 0.0)).r;
  float dRight = texture2D(uDepthMap, vUv + vec2(texel.x * 2.0, 0.0)).r;
  float dDown = texture2D(uDepthMap, vUv - vec2(0.0, texel.y * 2.0)).r;
  float dUp = texture2D(uDepthMap, vUv + vec2(0.0, texel.y * 2.0)).r;

  vec3 surfaceNormal = normalize(vec3(dLeft - dRight, dDown - dUp, 0.28));
  vec3 lightDir = normalize(vec3(-0.7, 0.6, 0.5)); // rim light from top-left
  float rim = max(0.0, dot(surfaceNormal, lightDir));
  rim = pow(rim, 3.2) * uRimStrength * (1.0 - uDissolve);

  // Editorial halftone shading:
  // Base dots carry high-key tone, surrounded by ink
  vec3 dotTint = mix(uDotColor, photo, 0.5);
  vec3 halftoneRaster = mix(uInkColor, dotTint, dotMask);

  // Preserve underlying photo structure so facial features are clearly defined and never washed out
  vec3 baseColor = mix(photo * 0.85, halftoneRaster, 0.55);

  // Blend with full-clarity image inside cursor reveal lens
  vec3 finalColor = mix(baseColor, photo, lensFactor * 0.92);

  // Add rim light accents and cursor halo
  finalColor += uRimColor * rim * 1.25;
  finalColor += vec3(1.0, 0.36, 0.12) * lensHalo * 0.7; // ember halo ring

  // Dissolve alpha fade
  float finalAlpha = tex.a * (1.0 - smoothstep(0.7, 1.0, uDissolve));

  gl_FragColor = vec4(finalColor, finalAlpha);
}
