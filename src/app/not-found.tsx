/**
 * Not-found page — React Server Component, "The Logbook" direction.
 *
 * An immersive WebGL vignette (CosmicDrift) sits behind a large mono 404, a
 * short "lost in space" message, and a primary action home. The 3D layer is
 * decorative and click-through; a soft backdrop keeps the text WCAG-AA legible.
 * Classes live in pages.styles.css. Zero em-dashes.
 */

import Link from "next/link";
import { ContentWidth } from "@/components/layouts";
import { CosmicDrift } from "@/components/shared/CosmicDrift";
import { ROUTES } from "@/constants";

export default function NotFound() {
  return (
    <ContentWidth as="main">
      <div className="notfound-root">
        <CosmicDrift className="notfound-scene" />
        <div className="notfound-inner">
          <p className="notfound-code" aria-hidden="true">
            404
          </p>
          <div className="notfound-text">
            <h1>Lost in the dark</h1>
            <p>
              This page drifted off the map, or never charted at all. Let&apos;s
              get you back to familiar stars.
            </p>
          </div>
          <Link href={ROUTES.HOME} className="btn-primary">
            ← Go home
          </Link>
        </div>
      </div>
    </ContentWidth>
  );
}
