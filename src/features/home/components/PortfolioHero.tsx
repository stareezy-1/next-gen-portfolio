import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/content";
import { ROUTES } from "@/constants";

/** Reference-inspired studio hero, composed entirely from existing portfolio content. */
export function PortfolioHero({ projects }: { projects: Project[] }) {
  return (
    <>
      <section aria-labelledby="hero-heading" className="studio-hero" id="top">
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit-ring orbit-ring--one" />
          <div className="orbit-ring orbit-ring--two" />
          <div className="orbit-ring orbit-ring--three" />
          {projects.slice(0, 6).map(
            (project, index) =>
              project.image && (
                <div
                  className={`orbit-media orbit-media--${index + 1}`}
                  key={project.slug}
                >
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="220px"
                    className="orbit-image"
                  />
                  <span>{project.title.split(" — ")[0]}</span>
                </div>
              ),
          )}
        </div>
        <div className="hero-topline">
          <span>Front-End &amp; AI-Native Engineer</span>
          <span>
            Jakarta, Indonesia <span aria-hidden="true">↗</span>
          </span>
        </div>
        <div className="studio-hero-content">
          <p className="hero-wordmark" aria-hidden="true">
            BINTANG<span className="wordmark-star">✳</span>
          </p>
          <h1 id="hero-heading" className="hero-statement">
            I&apos;m Bintang. I build complete products,
            <br className="hero-break" /> front-end to the <em>edge</em>.
          </h1>
          <div className="hero-actions">
            <Link href={ROUTES.PROJECTS} className="btn-primary">
              See the work <span aria-hidden="true">↗</span>
            </Link>
            <Link href={ROUTES.CONTACT} className="btn-ghost">
              Start a conversation <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className="hero-availability">
            <span className="hero-live-dot" />
            Open to new work
          </p>
        </div>
        <div className="hero-bottomline">
          <span>WSA Global Winner · 2025</span>
          <a href="#work">
            Explore selected work <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
      <div className="studio-ticker" aria-label="Core technologies">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <div
              className="ticker-group"
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
            >
              {[
                "React",
                "Next.js",
                "TypeScript",
                "Design Token Systems",
                "Cloudflare",
                "MCP Servers",
                "React Native",
              ].map((item) => (
                <span key={item}>
                  <i aria-hidden="true">▪</i>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <section className="studio-intro" aria-label="Introduction">
        <figure className="intro-portrait">
          <Image
            src="https://res.cloudinary.com/diwktkaxv/image/upload/v1780403660/my-photo_h9nqyh.png"
            alt="Muhammad Bintang Al Akbar"
            width={96}
            height={112}
            sizes="96px"
          />
          <figcaption>
            <strong>
              Muhammad Bintang
              <br />
              Al Akbar
            </strong>
            <span>WSA Global Winner · 2025</span>
          </figcaption>
        </figure>
        <p className="hero-lead">
          Front-end first, four years in the React ecosystem. I built a
          cross-platform design-token system with its own build-time compiler,
          co-architected the ERP that won WSA Global 2025, and ship solo SaaS on
          the Cloudflare edge. The AI-native part is concrete: an MCP server and
          open-source Claude skills that teach assistants how my systems
          actually work.
        </p>
      </section>
    </>
  );
}
