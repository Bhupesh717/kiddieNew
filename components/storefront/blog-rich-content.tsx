import { sanitizeBlogHtml } from "@/src/lib/store/blog";

export function BlogRichContent({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const sanitized = sanitizeBlogHtml(html);

  return (
    <div
      className={`blog-rich-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

