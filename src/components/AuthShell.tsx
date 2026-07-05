import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ivory px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-md">
        <p className="mb-2 text-sm font-medium tracking-[0.2em] text-sage">
          YURUNEST
        </p>
        <h1 className="mb-2 text-2xl font-bold text-forest">{title}</h1>
        {subtitle && (
          <p className="mb-8 text-base leading-relaxed text-forest-muted">
            {subtitle}
          </p>
        )}
        <div className="rounded-2xl border border-sage/20 bg-white p-5 shadow-[0_4px_20px_rgba(110,139,116,0.08)] sm:p-6">
          {children}
        </div>
        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-forest-muted underline-offset-4 hover:underline"
          >
            トップへ戻る
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-forest">
        {label}
      </label>
      {children}
    </div>
  );
}

export const authInputClassName =
  "w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-base text-forest";

export { Field };
