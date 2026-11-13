"use client";

import { useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

export function ShowcaseVideo({
  src = "/majisa.mp4",
  poster = "/Majisavesh_Banner.png",
}: {
  src?: string;
  poster?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  return (
    <section
      aria-label="Majisavesh campaign film"
      className="relative w-full overflow-hidden border-t border-[#e8ded2] bg-[#39231e]"
    >
      <div className="relative aspect-video w-full max-h-[82vh] overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="metadata"
          className="size-full object-cover"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#241410]/45 to-transparent"
        />

        <div className="absolute bottom-3 right-3 flex items-center gap-2 sm:bottom-5 sm:right-6">
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={paused ? "Play video" : "Pause video"}
            className="flex size-9 items-center justify-center rounded-full border border-[#f5e5c9]/30 bg-[#39231e]/75 text-[#f5e5c9] backdrop-blur-sm transition hover:bg-[#39231e]"
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="flex size-9 items-center justify-center rounded-full border border-[#f5e5c9]/30 bg-[#39231e]/75 text-[#f5e5c9] backdrop-blur-sm transition hover:bg-[#39231e]"
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>
    </section>
  );
}

