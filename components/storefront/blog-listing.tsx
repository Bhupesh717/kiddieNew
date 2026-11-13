"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, RotateCcw, Search } from "lucide-react";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";
import { formatBlogDate, type BlogPost } from "@/src/lib/store/blog";

export function BlogListing({ posts }: { posts: BlogPost[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(posts.map((post) => post.category).filter(Boolean)),
    );
    return ["All", ...unique];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (selectedCategory !== "All" && post.category !== selectedCategory) {
        return false;
      }
      if (!normalized) return true;
      const haystack =
        `${post.title} ${post.excerpt} ${post.category} ${post.author}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [posts, query, selectedCategory]);

  const showFeaturedBanner =
    selectedCategory === "All" && !query.trim() && filteredPosts.length > 0;
  const featuredPost = showFeaturedBanner ? filteredPosts[0] : null;
  const gridPosts = showFeaturedBanner ? filteredPosts.slice(1) : filteredPosts;

  return (
    <section className="container mx-auto px-4 py-10 sm:px-6 lg:py-14">
      <div className="mb-8 flex flex-col gap-4 border-b border-[#e8ded2] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Filter journal by category"
          className="flex flex-wrap items-center gap-2"
        >
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                  active
                    ? "bg-[#39231e] text-[#fff9f0]"
                    : "border border-[#ded3c7] bg-white text-[#4b3c33] hover:border-[#39231e]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <label className="flex w-full items-center gap-2 border border-[#ded3c7] bg-white px-3.5 py-2.5 lg:w-72">
          <Search size={15} className="shrink-0 text-[#8b796b]" />
          <span className="sr-only">Search journal articles</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search craft, bridal, silk..."
            className="w-full bg-transparent text-sm text-[#33251f] outline-none placeholder:text-[#a49a90]"
          />
        </label>
      </div>

      {featuredPost && (
        <article className="mb-12 grid overflow-hidden border border-[#e8ded2] bg-white lg:grid-cols-[1.15fr_1fr]">
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group relative block aspect-[4/3] overflow-hidden bg-[#eee4d8] lg:aspect-auto lg:min-h-[420px]"
          >
            <BlogCoverImage
              src={featuredPost.coverImage}
              alt={featuredPost.coverImageAlt || featuredPost.title}
              sizes="(max-width: 1024px) 100vw, 55vw"
              preload
              className="object-cover object-[center_25%] transition duration-500 group-hover:scale-[1.03]"
            />
          </Link>
          <div className="flex flex-col justify-between p-6 sm:p-9 lg:p-11">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em]">
                <span className="text-[#a44436]">Featured story</span>
                <span className="text-[#d6af7a]">·</span>
                <span className="text-[#77675d]">{featuredPost.category}</span>
              </div>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-[#39231e] sm:text-4xl">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="transition hover:text-[#8d3428]"
                >
                  {featuredPost.title}
                </Link>
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#6f5f55]">
                {featuredPost.excerpt}
              </p>
            </div>

            <div className="mt-8 border-t border-[#eee5da] pt-5">
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#77675d]">
                <span className="font-medium text-[#39231e]">
                  By {featuredPost.author}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={13} />
                  {formatBlogDate(featuredPost.publishedAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={13} />
                  {featuredPost.readTime}
                </span>
              </div>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="mt-5 inline-flex items-center gap-2 bg-[#39231e] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#52342c]"
              >
                Read story <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </article>
      )}

      {gridPosts.length > 0 ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {gridPosts.map((post) => (
            <article key={post.id} className="group flex flex-col">
              <Link
                href={`/blog/${post.slug}`}
                className="relative aspect-[4/5] overflow-hidden border border-[#e8ded2] bg-[#eee4d8]"
              >
                <BlogCoverImage
                  src={post.coverImage}
                  alt={post.coverImageAlt || post.title}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                />
              </Link>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a44436]">
                <span>{post.category}</span>
                <span className="text-[#c8b8a8]">·</span>
                <span className="font-normal text-[#77675d]">
                  {post.readTime}
                </span>
              </div>
              <h3 className="mt-2 font-serif text-2xl leading-snug text-[#39231e]">
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition hover:text-[#8d3428]"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="mt-2.5 line-clamp-3 text-sm leading-6 text-[#6f5f55]">
                {post.excerpt}
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-[#e8ded2] pt-4 text-xs text-[#77675d]">
                <span>
                  {post.author} · {formatBlogDate(post.publishedAt)}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#39231e] transition hover:text-[#a44436]"
                >
                  Read <ArrowRight size={12} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : !featuredPost ? (
        <div className="border border-[#e8ded2] bg-white px-6 py-16 text-center">
          <p className="font-serif text-2xl text-[#39231e]">
            No stories match that filter yet
          </p>
          <p className="mt-2 text-sm text-[#77675d]">
            Clear your search or choose another craft category to continue
            reading.
          </p>
          {(selectedCategory !== "All" || query) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setQuery("");
              }}
              className="mt-6 inline-flex items-center gap-2 border border-[#39231e] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#39231e] transition hover:bg-[#39231e] hover:text-white"
            >
              <RotateCcw size={13} /> Reset filters
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}

