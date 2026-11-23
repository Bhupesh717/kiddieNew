import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from "lucide-react";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";
import { BlogRichContent } from "@/components/storefront/blog-rich-content";
import { formatBlogDate, type BlogPost } from "@/src/lib/store/blog";

export function BlogDetail({
  post,
  relatedPosts,
}: {
  post: BlogPost;
  relatedPosts: BlogPost[];
}) {
  return (
    <article className="pb-16">
      <div className="border-b border-border bg-secondary px-4 py-10 sm:px-6 sm:py-14">
        <div className="container mx-auto max-w-4xl">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
          >
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary">
              Blog
            </Link>
            <span>/</span>
            <span className="text-primary">{post.category}</span>
          </nav>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
            {post.category}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.08] text-primary sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            {post.excerpt}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-primary">
              <User size={14} className="text-accent" />
              {post.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} className="text-accent" />
              {formatBlogDate(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} className="text-accent" />
              {post.readTime}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-10">
        <figure className="overflow-hidden border border-border bg-secondary">
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <BlogCoverImage
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              sizes="(max-width: 896px) 100vw, 896px"
              preload
              className="object-cover object-[center_25%]"
            />
          </div>
          {post.coverImageAlt && (
            <figcaption className="border-t border-border bg-popover px-4 py-2.5 text-center text-xs text-muted-foreground">
              {post.coverImageAlt}
            </figcaption>
          )}
        </figure>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <BlogRichContent html={post.contentHtml} />

        <div className="mt-12 flex flex-col justify-between gap-5 border-y border-border bg-secondary/60 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
              Curated for your family
            </p>
            <h2 className="mt-2 font-serif text-2xl text-primary">
              Explore KiddieQuick collections
            </h2>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              Discover smart kids wear, festive Indian kurtas &amp; suits, and crisp western shirts inspired by this story.
            </p>
          </div>
          <Link
            href="/collection"
            className="inline-flex shrink-0 items-center justify-center gap-2 bg-primary px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-primary/90"
          >
            Shop collection <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:text-accent"
          >
            <ArrowLeft size={14} /> Back to all stories
          </Link>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="border-t border-border bg-popover py-12 sm:py-14">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-7 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-accent">
                  Continue reading
                </p>
                <h2 className="mt-2 font-serif text-3xl text-primary">
                  More from the journal
                </h2>
              </div>
              <Link
                href="/blog"
                className="text-[10px] font-semibold uppercase tracking-[0.16em] underline underline-offset-4"
              >
                All stories
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <article key={related.id} className="group flex flex-col">
                  <Link
                    href={`/blog/${related.slug}`}
                    className="relative aspect-[4/3] overflow-hidden border border-border bg-secondary"
                  >
                    <BlogCoverImage
                      src={related.coverImage}
                      alt={related.coverImageAlt || related.title}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-[center_25%] transition duration-500 group-hover:scale-[1.03]"
                    />
                  </Link>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                    {related.category}
                  </p>
                  <h3 className="mt-1.5 font-serif text-xl leading-snug text-primary">
                    <Link
                      href={`/blog/${related.slug}`}
                      className="transition hover:text-accent"
                    >
                      {related.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatBlogDate(related.publishedAt)} · {related.readTime}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

