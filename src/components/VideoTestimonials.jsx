import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const VIDEOS = [
  'https://vz-7fee017a-811.b-cdn.net/edf5206a-4849-4bea-8f58-8179f91b1e49/play_480p.mp4',
  'https://vz-7fee017a-811.b-cdn.net/e1a2bd52-ab2a-4e93-89c2-4d72bc9d5257/play_480p.mp4',
  'https://vz-7fee017a-811.b-cdn.net/85cc81b6-a2ea-42ba-ab28-6e68051a6420/play_480p.mp4',
  'https://vz-7fee017a-811.b-cdn.net/62833f04-8747-4bb5-9bcb-5bb7fcac9393/play_480p.mp4',
];

const ease = [0.22, 1, 0.36, 1];

export default function VideoTestimonials() {
  const videoRef = useRef(null);
  const autoPlayNext = useRef(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !autoPlayNext.current) return;
    el.play().catch(() => setPlaying(false));
  }, [index]);

  const goTo = (next, { play = playing } = {}) => {
    autoPlayNext.current = play;
    setIndex((next + VIDEOS.length) % VIDEOS.length);
  };

  const handleEnded = () => {
    if (index < VIDEOS.length - 1) goTo(index + 1, { play: true });
    else setPlaying(false);
  };

  const startPlayback = () => {
    videoRef.current?.play().catch(() => setPlaying(false));
  };

  return (
    <section
      id="testimonials"
      className="relative py-20 sm:py-24 lg:py-32 overflow-hidden scroll-mt-20"
      aria-label="Testimonials"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5F7FB] to-[#EEF2F7]" />
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 20% 30%, rgba(234,88,12,0.12), transparent 50%), radial-gradient(ellipse at 80% 75%, rgba(14,165,233,0.12), transparent 48%)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 max-w-3xl mx-auto">
          <motion.p
            className="text-orange-600 text-sm font-semibold tracking-[0.18em] uppercase mb-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease }}
          >
            Testimonials
          </motion.p>
          <motion.h2
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.06, ease }}
          >
            What our clients say
          </motion.h2>
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
        >
          <div
            className="absolute -inset-3 sm:-inset-5 rounded-[2rem] bg-gradient-to-br from-orange-500/15 via-sky-400/10 to-transparent blur-xl"
            aria-hidden="true"
          />

          <div className="relative rounded-2xl sm:rounded-[1.75rem] overflow-hidden border border-slate-200/90 bg-slate-950 shadow-[0_40px_100px_-36px_rgba(15,23,42,0.55)]">
            <div className="relative aspect-video w-full">
              <video
                key={VIDEOS[index]}
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                src={VIDEOS[index]}
                controls={playing}
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                playsInline
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={handleEnded}
                aria-label={`Testimonial video ${index + 1} of ${VIDEOS.length}`}
              />

              {!playing && (
                <button
                  type="button"
                  onClick={startPlayback}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/30"
                  aria-label={`Play testimonial ${index + 1}`}
                >
                  <span className="flex h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20 items-center justify-center rounded-full bg-orange-600 text-white shadow-[0_18px_40px_rgba(234,88,12,0.45)] ring-4 ring-white/20 transition-transform hover:scale-105">
                    <Play size={28} className="ml-1" fill="currentColor" />
                  </span>
                </button>
              )}

              <span className="absolute top-4 left-4 z-20 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/15 px-3 py-1 text-xs font-semibold text-white">
                {index + 1} / {VIDEOS.length}
              </span>

              <button
                type="button"
                onClick={() => goTo(index - 1)}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {VIDEOS.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i, { play: true })}
              className={`group relative aspect-video overflow-hidden rounded-xl border-2 bg-slate-900 transition-all ${
                i === index
                  ? 'border-orange-500 shadow-[0_12px_30px_-12px_rgba(234,88,12,0.6)]'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              aria-label={`Play testimonial ${i + 1}`}
              aria-current={i === index}
            >
              <video
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                src={`${src}#t=1`}
                muted
                playsInline
                preload="metadata"
                aria-hidden="true"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
              <span className="absolute bottom-2 left-2.5 text-xs font-semibold text-white">
                {i === index && playing ? 'Now playing' : `Testimonial ${i + 1}`}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
