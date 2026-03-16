export function MenuItem({
  icon,
  label,
  onClick,
  danger,
  dim,
  iconColor,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  dim?: boolean;
  iconColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left hover-bg transition-colors"
      style={{
        color: danger
          ? "#f87171"
          : dim
          ? "var(--text-faint)"
          : "var(--text-secondary)",
      }}
    >
      <span style={{ color: iconColor ?? "inherit", fontSize: 10 }}>
        {icon}
      </span>
      {label}
    </button>
  );
}
