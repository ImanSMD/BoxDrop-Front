import Link from "next/link";

/** Bold Mono splash — dark background, box icon, LTR brand name */
export function Splash() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-dark">
      {/* Logo box */}
      <div className="mb-6 flex size-[78px] items-center justify-center rounded-[22px] bg-primary">
        <span className="text-4xl text-white font-black">B</span>
      </div>

      {/* Brand */}
      <div dir="ltr" className="text-[40px] font-black tracking-[-1.2px] text-white">
        BoxDrop
      </div>
      <div className="mt-3 text-[15px] font-semibold text-[#A1A1AA]">
        باهم بخر، ارزون‌تر بشه
      </div>

      {/* Tap to start */}
      <Link
        href="/login"
        className="mt-8 flex items-center gap-2 text-[12.5px] font-extrabold text-primary"
      >
        برای شروع بزن ›
      </Link>

      {/* Footer */}
      <div className="absolute bottom-12 text-[12px] font-semibold text-[#5B5B63]">
        طراحی شده در تهران
      </div>
    </div>
  );
}
