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
      <div className="border-b border-[#e8ded2] bg-[#f3ece2] px-4 py-10 sm:px-6 sm:py-14">
        <div className="container mx-auto max-w-4xl">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs text-[#77675d]"
          >
            <Link href="/" className="hover:text-[#39231e]">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#39231e]">
              Blog
            </Link>
            <span>/</span>
            <span className="text-[#39231e]">{post.category}</span>
          </nav>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a44436]">
            {post.category}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.08] text-[#39231e] sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#5d4f47]">
            {post.excerpt}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#dfd3c4] pt-5 text-xs text-[#77675d]">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#39231e]">
              <User size={14} className="text-[#a44436]" />
              {post.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} className="text-[#a44436]" />
              {formatBlogDate(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} className="text-[#a44436]" />
              {post.readTime}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-10">
        <figure className="overflow-hidden border border-[#e8ded2] bg-[#f3ece2]">
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
            <figcaption className="border-t border-[#e8ded2] bg-[#fffdf9] px-4 py-2.5 text-center text-xs text-[#77675d]">
              {post.coverImageAlt}
            </figcaption>
          )}
        </figure>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <BlogRichContent html={post.contentHtml} />

        <div className="mt-12 flex flex-col justify-between gap-5 border-y border-[#e8ded2] bg-[#f3ece2]/60 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a44436]">
              From our Jaipur atelier
            </p>
            <h2 className="mt-2 font-serif text-2xl text-[#39231e]">
              Explore handcrafted Majisavesh edits
            </h2>
            <p className="mt-1 text-xs leading-6 text-[#6f5f55]">
              Discover Pure Poshak, Semi Pure Poshak, Kurti Sets, and heirloom
              accessories inspired by this story.
            </p>
          </div>
          <Link
            href="/collection"
            className="inline-flex shrink-0 items-center justify-center gap-2 bg-[#39231e] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#52342c]"
          >
            Shop collection <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#39231e] transition hover:text-[#a44436]"
          >
            <ArrowLeft size={14} /> Back to all stories
          </Link>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="border-t border-[#e8ded2] bg-[#fffdf9] py-12 sm:py-14">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-7 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#a44436]">
                  Continue reading
                </p>
                <h2 className="mt-2 font-serif text-3xl text-[#39231e]">
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
                    className="relative aspect-[4/3] overflow-hidden border border-[#e8ded2] bg-[#eee4d8]"
                  >
                    <BlogCoverImage
                      src={related.coverImage}
                      alt={related.coverImageAlt || related.title}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-[center_25%] transition duration-500 group-hover:scale-[1.03]"
                    />
                  </Link>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a44436]">
                    {related.category}
                  </p>
                  <h3 className="mt-1.5 font-serif text-xl leading-snug text-[#39231e]">
                    <Link
                      href={`/blog/${related.slug}`}
                      className="transition hover:text-[#8d3428]"
                    >
                      {related.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-xs text-[#77675d]">
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

