uniform float uTime;
uniform float uNoiseScale;
uniform float uContourCount;
uniform float uLineWidth;
uniform float uSplitProgress;
uniform vec3 uLineColor;
uniform vec3 uBgColor;
uniform vec3 uAccentRim;

varying vec3 vObjectPos;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vSplitSide;
varying float vSeamProximity;

// @include simplex3d

void main() {
  // Multi-octave 3D noise height field on sphere surface
  vec3 p = normalize(vObjectPos) * uNoiseScale + vec3(uTime * 0.04, -uTime * 0.03, uTime * 0.025);
  float h = 0.65 * snoise(p) + 0.35 * snoise(p * 2.05 + vec3(4.2));
  h = h * 0.5 + 0.5;

  // Topographic contour isolines: fract(height * N) with fwidth anti-aliasing
  float scaled = h * uContourCount;
  float band = abs(fract(scaled - 0.5) - 0.5);
  float fw = fwidth(scaled);
  float lineMask = 1.0 - smoothstep(uLineWidth - fw, uLineWidth + fw, band);

  // Fresnel edge subtle falloff so contour lines wrap cleanly around sphere silhouette
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewPos);
  float fresnel = pow(1.0 - max(0.0, dot(N, V)), 2.2);

  // Crisp razor cut-seam highlight when split open (uSplitProgress > 0)
  float seamLine = smoothstep(0.35, 0.95, vSeamProximity) * uSplitProgress;
  vec3 seamColor = mix(uLineColor, uAccentRim, 0.65);

  vec3 col = mix(uBgColor, uLineColor, lineMask * (0.88 + 0.12 * fresnel));
  col = mix(col, seamColor, seamLine * 0.9);

  gl_FragColor = vec4(col, 1.0);
}
