/**
 * Minimal zero-dependency GLSL raw string loader for Next.js Turbopack.
 * Webpack uses native `type: 'asset/source'`.
 */
module.exports = function glslLoader(source) {
  return `export default ${JSON.stringify(source)};`;
};
