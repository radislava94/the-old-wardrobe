export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("");

  return (
    <span className="avatar" aria-hidden="true">
      {initials}
    </span>
  );
}
