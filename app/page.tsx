import { About } from "@/components/sections/About";
import { Aspirations } from "@/components/sections/Aspirations";
import { Beyond } from "@/components/sections/Beyond";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { Projects } from "@/components/sections/Projects";
import { Toolkit } from "@/components/sections/Toolkit";

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <About />
      <Projects />
      <Toolkit />
      <Journey />
      <Beyond />
      <Aspirations />
      <Contact />
    </main>
  );
}
