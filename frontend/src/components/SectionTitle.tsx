interface SectionTitleProps {
  title: string;
  subtitle: string;
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="section-title-wrap">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
