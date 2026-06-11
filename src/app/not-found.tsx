/**
 * Not-found page — React Server Component, "The Logbook" direction.
 *
 * Orbit-rings lottie above a large mono 404, a short message, and a primary
 * action back home. Classes live in pages.styles.css. Zero em-dashes.
 */

import Link from "next/link";
import { ContentWidth } from "@/components/layouts";
import { AssetPlayer } from "@/components/shared/AssetPlayer";
import { ROUTES } from "@/constants";

export default function NotFound() {
  return (
    <ContentWidth as="main">
      <div className="notfound-root">
        <div className="notfound-lottie" aria-hidden="true">
          <AssetPlayer
            src="/lottie/orbit-rings.json"
            decorative
            trigger="auto"
            width="100%"
            height="100%"
          />
        </div>
        <p className="notfound-code" aria-hidden="true">
          404
        </p>
        <div className="notfound-text">
          <h1>Page not found</h1>
          <p>
            The page you are looking for does not exist, or it moved somewhere
            else.
          </p>
        </div>
        <Link href={ROUTES.HOME} className="btn-primary">
          ← Go home
        </Link>
      </div>
    </ContentWidth>
  );
}
