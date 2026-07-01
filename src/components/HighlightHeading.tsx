export function HighlightHeading({
  id,
  index,
  children,
}: {
  id: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <p
        className="mb-2 text-sm font-medium tabular-nums tracking-widest text-sage"
        aria-hidden="true"
      >
        {String(index).padStart(2, "0")}
      </p>
      <h2
        id={id}
        className="rounded-2xl rounded-tl-sm border-l-4 border-sage bg-white px-5 py-4 text-base font-bold leading-relaxed text-forest shadow-[0_2px_16px_rgba(110,139,116,0.14)] sm:text-lg"
      >
        {children}
      </h2>
    </div>
  );
}
