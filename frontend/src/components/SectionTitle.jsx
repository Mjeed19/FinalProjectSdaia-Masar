export default function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-bold text-dark">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}
