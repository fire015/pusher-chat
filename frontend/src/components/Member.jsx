export default function Member({ name, primary }) {
  const badgeClass = primary ? "badge-primary" : "badge-secondary";

  return <span className={`badge mr-2 ${badgeClass}`}>{name}</span>;
}
