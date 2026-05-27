type RadialCreateButtonProps = {
  label: string;
};

export function RadialCreateButton({ label }: RadialCreateButtonProps) {
  return (
    <span className="xy-radial-create" aria-hidden="true">
      <span className="xy-radial-create-widget">
        <span className="xy-radial-create-main">
          <span className="xy-radial-create-plus" />
        </span>
        <span className="xy-radial-create-subs">
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index} className="xy-radial-create-sub" />
          ))}
        </span>
      </span>
      <span className="xy-radial-create-label">{label}</span>
    </span>
  );
}
