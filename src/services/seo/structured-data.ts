/**
 * JSON-LD structured-data builders for each schema.org type.
 * @see Requirements 19.1–19.5, 19.7
 */

import { structuredData } from "./index";
import type { JsonLd } from "@/types/seo";
import type {
  BlogPost,
  PersonalProject,
  ProfessionalProject,
} from "@/types/content";
import {
  SITE_URL,
  AUTHOR_NAME,
  AUTHOR_EMAIL,
  AUTHOR_GITHUB,
  AUTHOR_LINKEDIN,
  AUTHOR_LOCATION,
  SITE_DESCRIPTION,
} from "@/constants/seo";

// ---------------------------------------------------------------------------
// Person
// ---------------------------------------------------------------------------

export function personJsonLd(data?: {
  name?: string;
  url?: string;
  description?: string;
  sameAs?: string[];
}): JsonLd {
  return structuredData("Person", {
    "@id": `${SITE_URL}/#person`,
    name: data?.name ?? AUTHOR_NAME,
    url: data?.url ?? SITE_URL,
    description: data?.description ?? SITE_DESCRIPTION,
    email: AUTHOR_EMAIL,
    jobTitle: "Senior Front-End & Mobile Engineer",
    worksFor: {
      "@type": "Organization",
      name: "Rekosistem",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jakarta",
      addressCountry: "ID",
    },
    sameAs: data?.sameAs ?? [AUTHOR_GITHUB, AUTHOR_LINKEDIN, SITE_URL],
    knowsAbout: [
      "React.js",
      "React Native",
      "TypeScript",
      "Next.js",
      "Expo",
      "Design Token Systems",
      "AWS Amplify",
      "Cross-platform Engineering",
    ],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Universitas Gunadarma",
    },
    award: "World Summit Awards (WSA) Global Winner — Digital Innovation",
    nationality: { "@type": "Country", name: "Indonesia" },
  });
}

// ---------------------------------------------------------------------------
// WebSite (for sitelinks searchbox)
// ---------------------------------------------------------------------------

export function websiteJsonLd(): JsonLd {
  return structuredData("WebSite", {
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: AUTHOR_NAME,
    description: SITE_DESCRIPTION,
    author: { "@id": `${SITE_URL}/#person` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });
}

// ---------------------------------------------------------------------------
// BlogPosting
// ---------------------------------------------------------------------------

export function blogPostingJsonLd(post: BlogPost, url: string): JsonLd {
  return structuredData("BlogPosting", {
    "@id": url,
    headline: post.title,
    description: post.description,
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: post.author,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: AUTHOR_NAME,
    },
    url,
    image: {
      "@type": "ImageObject",
      url: post.heroImage,
      width: 1200,
      height: 630,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "en-US",
    keywords: post.tags.join(", "),
  });
}

// ---------------------------------------------------------------------------
// CreativeWork
// ---------------------------------------------------------------------------

export function creativeWorkJsonLd(
  project: PersonalProject | ProfessionalProject,
  url: string,
): JsonLd {
  return structuredData("CreativeWork", {
    "@id": url,
    name: project.title,
    description: project.description,
    url,
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: AUTHOR_NAME,
    },
    creator: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: AUTHOR_NAME,
    },
    keywords: project.technologies.join(", "),
    ...(project.kind === "personal" && project.githubUrl
      ? { codeRepository: project.githubUrl }
      : {}),
    ...(project.kind === "personal" && project.liveUrl
      ? { sameAs: project.liveUrl }
      : {}),
    ...(project.image ? { image: project.image } : {}),
  });
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------

export function breadcrumbListJsonLd(
  items: Array<{ name: string; url: string }>,
): JsonLd {
  return structuredData("BreadcrumbList", {
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

// ---------------------------------------------------------------------------
// FAQPage
// ---------------------------------------------------------------------------

export function faqPageJsonLd(
  faqs: Array<{ question: string; answer: string }>,
): JsonLd {
  return structuredData("FAQPage", {
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  });
}
