import type { Metadata } from "next";
import { ShaderLabClient } from "./ShaderLabClient";

export const metadata: Metadata = {
  title: "Shader Lab (/lab) — SIGNAL Portfolio",
  description:
    "Isolated R3F and GLSL development sandbox for verifying S1 Hero Point Cloud and S2 Contour Sphere shaders.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ShaderLabPage() {
  return <ShaderLabClient />;
}
