function EncounterForm({
  name,
  setName,
  onSubmit,
  submitLabel = "Add Encounter",
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit}>
      <h3>{submitLabel === "Add Encounter" ? "Create Encounter" : "Edit Encounter"}</h3>

      <label>Encounter Name</label>

      <input
        value={name}
        placeholder="Goblin Ambush"
        onChange={(event) => setName(event.target.value)}
        required
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

export default EncounterForm;
