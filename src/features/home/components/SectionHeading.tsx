import { Fragment } from "react";

export function SectionHeading({
  id,
  children,
  className = "section-h2",
}: {
  id: string;
  children: string;
  className?: string;
}) {
  const words = children.split(" ");
  return (
    <h2
      id={id}
      className={`${className} animated-heading`}
      aria-label={children}
    >
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="heading-word-mask" aria-hidden="true">
            <span className="heading-word">{word}</span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </h2>
  );
}
