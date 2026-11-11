import simplex3dChunk from "@/shaders/simplex3d.glsl";
import s1HeroBlobVertRaw from "@/shaders/s1HeroBlob.vert.glsl";
import s1HeroBlobFragRaw from "@/shaders/s1HeroBlob.frag.glsl";
import s2ContourSphereVertRaw from "@/shaders/s2ContourSphere.vert.glsl";
import s2ContourSphereFragRaw from "@/shaders/s2ContourSphere.frag.glsl";
import s8GrainVignetteVertRaw from "@/shaders/s8GrainVignette.vert.glsl";
import s8GrainVignetteFragRaw from "@/shaders/s8GrainVignette.frag.glsl";

const INCLUDE_SIMPLEX_TOKEN = "// @include simplex3d";

/**
 * Resolves shared GLSL chunks inside vertex/fragment sources at module load time.
 * Works identically under Next.js Turbopack (`scripts/glsl-loader.cjs`) and Webpack (`asset/source`).
 */
function resolveShaderChunks(source: string): string {
  if (!source.includes(INCLUDE_SIMPLEX_TOKEN)) {
    return source;
  }
  return source.replace(INCLUDE_SIMPLEX_TOKEN, simplex3dChunk);
}

export const S1_HERO_BLOB_SHADERS = {
  vertexShader: resolveShaderChunks(s1HeroBlobVertRaw),
  fragmentShader: resolveShaderChunks(s1HeroBlobFragRaw),
} as const;

export const S2_CONTOUR_SPHERE_SHADERS = {
  vertexShader: resolveShaderChunks(s2ContourSphereVertRaw),
  fragmentShader: resolveShaderChunks(s2ContourSphereFragRaw),
} as const;

export const S8_GRAIN_VIGNETTE_SHADERS = {
  vertexShader: resolveShaderChunks(s8GrainVignetteVertRaw),
  fragmentShader: resolveShaderChunks(s8GrainVignetteFragRaw),
} as const;
