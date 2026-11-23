import Link from "next/link"
import { ArrowLeft, Compass } from "lucide-react"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-20 text-center text-foreground">
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-accent">
        <Compass size={24} />
      </div>
      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
        404 · Page not found
      </p>
      <h1 className="mt-3 font-serif text-4xl text-primary sm:text-5xl">
        This heirloom could not be found
      </h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
        The page or piece you are looking for may have moved or is no longer available.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-primary/90"
        >
          <ArrowLeft size={14} /> Return home
        </Link>
        <Link
          href="/collection"
          className="inline-flex items-center border border-input px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] transition hover:border-primary"
        >
          Browse collection
        </Link>
      </div>
    </main>
  )
}

