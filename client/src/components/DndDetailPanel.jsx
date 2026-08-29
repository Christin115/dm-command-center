function formatLabel(key) {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function DndDetailPanel({ detail }) {
  if (!detail) {
    return null;
  }

  const description = detail.desc
    ? [].concat(detail.desc).join(" ")
    : detail.description;

  const otherFields = Object.entries(detail).filter(
    ([key, value]) =>
      !["index", "name", "desc", "description", "url"].includes(key) &&
      (typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean")
  );

  return (
    <article className="dnd-detail-panel">
      <h3>{detail.name}</h3>

      {description && <p>{description}</p>}

      {otherFields.length > 0 && (
        <ul className="dnd-detail-fields">
          {otherFields.map(([key, value]) => (
            <li key={key}>
              <strong>{formatLabel(key)}:</strong> {String(value)}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default DndDetailPanel;
