function SessionCard({ session, onStatusChange, onDelete }) {
  const scheduledLabel = session.scheduled_at
    ? new Date(session.scheduled_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "No date set";

  return (
    <article>
      <h3>{scheduledLabel}</h3>

      <span className="status">{session.status}</span>

      {session.notes && <p>{session.notes}</p>}

      <label>Status</label>

      <select
        value={session.status}
        onChange={(event) => onStatusChange(session.id, event.target.value)}
      >
        <option value="Scheduled">Scheduled</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      <div className="card-actions">
        <button
          type="button"
          className="danger-button"
          onClick={() => onDelete(session.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default SessionCard;
