import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyView } from "@/components/sections/CaseStudyView";
import { FEATURED_PROJECTS, getFeaturedProjectBySlug } from "@/content/projects";

export const dynamicParams = false;

export function generateStaticParams(): Array<{ slug: string }> {
  return FEATURED_PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getFeaturedProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.name} — Case Study`,
    description: project.tagline,
    openGraph: {
      title: `${project.name} — Sourasish Ghosh Case Study`,
      description: project.tagline,
      images: [
        {
          url: project.screens[0].src,
          width: project.screens[0].width,
          height: project.screens[0].height,
          alt: project.screens[0].alt,
        },
      ],
    },
  };
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getFeaturedProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const currentIdx = FEATURED_PROJECTS.findIndex((p) => p.slug === project.slug);
  const nextProject =
    FEATURED_PROJECTS[(currentIdx + 1) % FEATURED_PROJECTS.length] ??
    FEATURED_PROJECTS[0];

  return <CaseStudyView project={project} nextProject={nextProject} />;
}
