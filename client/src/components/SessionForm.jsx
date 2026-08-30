function SessionForm({
  values,
  setField,
  onSubmit,
  submitLabel = "Schedule Session",
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit}>
      <h3>Schedule Session</h3>

      <label>Date &amp; Time</label>

      <input
        type="datetime-local"
        value={values.scheduledAt}
        onChange={(event) => setField("scheduledAt", event.target.value)}
        required
      />

      <label>Notes</label>

      <textarea
        value={values.notes}
        placeholder="Bring minis, review last session's cliffhanger..."
        onChange={(event) => setField("notes", event.target.value)}
      />

      <button type="submit">{submitLabel}</button>

      {onCancel && (
        <button
          type="button"
          className="secondary-button"
          onClick={onCancel}
        >
          Cancel
        </button>
      )}
    </form>
  );
}

export default SessionForm;
