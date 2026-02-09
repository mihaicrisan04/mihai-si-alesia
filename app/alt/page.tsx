import { getPhotos } from "@/app/lib/photos";
import { PolaroidImage } from "@/app/components/PolaroidImage";

const rotations = [1, -0.5, 0.3, -1, 0.7, -0.2];
const aspects = ["4/5", "3/4", "1/1"];

export default function AnalogMemory() {
  const photos = getPhotos();

  return (
    <div className="min-h-screen bg-[#f2ece3] font-[family-name:var(--font-cormorant)]">
      {/* Film grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          animation: "grain 8s steps(10) infinite",
        }}
      />

      {/* Header */}
      <header className="pt-24 pb-16 text-center animate-fade-in">
        <div className="flex justify-center mb-8">
          <svg width="40" height="24" viewBox="0 0 40 24" className="text-[#a09789]">
            <rect x="0" y="4" width="40" height="16" stroke="currentColor" strokeWidth="1" fill="none" />
            {[2, 7, 12, 17, 22, 27, 32].map((x) => (
              <g key={x}>
                <rect x={x} y="0" width="2" height="2" fill="currentColor" />
                <rect x={x} y="22" width="2" height="2" fill="currentColor" />
              </g>
            ))}
          </svg>
        </div>

        <h1 className="text-5xl md:text-7xl font-light text-[#8b5e5e] mb-4">
          Mihai & Alesia
        </h1>

        <p className="text-sm uppercase tracking-[0.2em] text-[#a09789] mb-2 font-[family-name:var(--font-dm-sans)]">
          Memories on film
        </p>

        <p
          className="text-xs text-[#a09789]/60 font-[family-name:var(--font-dm-sans)]"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          02 / 14
        </p>
      </header>

      {/* Gallery */}
      {photos.length === 0 ? (
        <div className="max-w-6xl mx-auto px-6 pb-24 text-center">
          <p className="italic text-[#a09789]">
            No photos found. Add images to the public folder.
          </p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 px-6">
          {photos.map((photo, i) => (
            <div
              key={photo.src}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <PolaroidImage
                src={photo.src}
                alt={photo.alt}
                index={i}
                rotation={rotations[i % 6]}
                aspect={aspects[i % 3]}
                draggable
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="pt-16 pb-24 text-center">
        <p className="italic text-sm text-[#a09789] mb-3">End of roll</p>
        <span className="text-2xl text-[#8b5e5e] opacity-20">&#9825;</span>
        <p className="text-[10px] tracking-widest uppercase text-[#a09789]/40 mt-6 font-[family-name:var(--font-dm-sans)]">
          built with <span className="text-[#8b5e5e]">&hearts;</span>
        </p>
      </footer>
    </div>
  );
}
