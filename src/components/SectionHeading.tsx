export function SectionHeading({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <p className="mb-2 text-sm font-medium tracking-[0.2em] text-sage">
        {label}
      </p>
      <h2
        id={id}
        className="border-l-2 border-sage/40 pl-4 text-lg font-medium leading-snug text-forest sm:text-xl"
      >
        {children}
      </h2>
    </div>
  );
}
