export interface CertificationRecord {
  id: string;
  index: string;
  title: string;
  issuer: string;
  platform: string;
  dateLabel: string;
  credentialId: string;
  verifyUrl: string | null;
  verifyStatusNote: string;
  imageSrc: string | null;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  subtitleNote?: string;
  focusAreas: string[];
}

export const CERTIFICATIONS: CertificationRecord[] = [
  {
    id: "aws-devops-xpro",
    index: "01",
    title: "AWS DevOps Initiative",
    issuer: "Employability.life",
    platform: "XPro Project (with Federation University)",
    dateLabel: "January 2026",
    credentialId: "XPro27566969",
    verifyUrl: null,
    verifyStatusNote:
      "Certificate scan supplied and inspectable below; QR verification link marked NEEDS INPUT until direct verification URL is provided.",
    imageSrc: "/certificates/employability-aws-devops.jpg",
    imageWidth: 702,
    imageHeight: 443,
    imageAlt:
      "Certificate of Completion awarded to Sourasish Ghosh for XPro Project: AWS DevOps Initiative by Employability.life and Federation University",
    subtitleNote: "Completed January 17, 2026 · XPro Project: AWS DevOps Initiative",
    focusAreas: ["AWS EC2", "AWS S3", "CI/CD Fundamentals", "Cloud App Deployment"],
  },
  {
    id: "google-cloud-intro-genai",
    index: "02",
    title: "Introduction to Generative AI",
    issuer: "Google Cloud",
    platform: "Coursera",
    dateLabel: "February 2025",
    credentialId: "03ISU86UC5K4",
    verifyUrl: "https://coursera.org/verify/03ISU86UC5K4",
    verifyStatusNote: "Verified publicly via Coursera Credential Registry.",
    imageSrc: "/certificates/google-cloud-intro-genai.png",
    imageWidth: 692,
    imageHeight: 537,
    imageAlt:
      "Google Cloud Coursera Certificate awarded to Sourasish Ghosh for Introduction to Generative AI",
    focusAreas: [
      "Generative AI Fundamentals",
      "Model Types & Use Cases",
      "Responsible AI Foundations",
    ],
  },
  {
    id: "ibm-genai-intro",
    index: "03",
    title: "Generative AI: Introduction and Applications",
    issuer: "IBM",
    platform: "Coursera",
    dateLabel: "February 2025",
    credentialId: "AZ1QO9FKWWB0",
    verifyUrl: "https://coursera.org/verify/AZ1QO9FKWWB0",
    verifyStatusNote: "Verified publicly via Coursera Credential Registry.",
    imageSrc: "/certificates/ibm-genai-essentials.jpg",
    imageWidth: 690,
    imageHeight: 533,
    imageAlt:
      "IBM Coursera Certificate awarded to Sourasish Ghosh for Generative AI Essentials: From Fundamentals to Real-World Applications",
    subtitleNote:
      "Certificate subtitle: Generative AI Essentials — From Fundamentals to Real-World Applications",
    focusAreas: [
      "Applied Generative AI",
      "Real-World Text & Code Workflows",
      "Foundational Concepts",
    ],
  },
  {
    id: "google-cloud-intro-llms",
    index: "04",
    title: "Introduction to Large Language Models",
    issuer: "Google Cloud",
    platform: "Coursera",
    dateLabel: "May 2025",
    credentialId: "7QAB657M7FS4",
    verifyUrl: "https://coursera.org/verify/7QAB657M7FS4",
    verifyStatusNote:
      "Verified publicly via Coursera Credential Registry; certificate scan image marked NEEDS INPUT (optional).",
    imageSrc: null,
    focusAreas: [
      "LLM Architecture Basics",
      "Prompt Tuning Concepts",
      "Developer Integration Pathways",
    ],
  },
];
