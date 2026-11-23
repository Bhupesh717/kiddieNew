import Image from "next/image";

type BlogCoverImageProps = {
  src: string;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
};

export function BlogCoverImage({
  src,
  alt,
  sizes,
  preload = false,
  className = "object-cover object-center",
}: BlogCoverImageProps) {
  const safeSrc = src.trim() || "/hero-ethnic-wear.png";
  const isBundledLocalAsset =
    safeSrc.startsWith("/") &&
    !safeSrc.startsWith("//") &&
    !safeSrc.startsWith("/uploads/") &&
    !safeSrc.startsWith("/storage/");

  if (!isBundledLocalAsset) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={safeSrc}
        alt={alt}
        loading={preload ? "eager" : "lazy"}
        className={`absolute inset-0 size-full ${className}`}
      />
    );
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      fill
      preload={preload}
      sizes={sizes}
      className={className}
    />
  );
}

