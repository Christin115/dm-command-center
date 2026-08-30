function CombatantForm({
  values,
  setField,
  onSubmit,
  submitLabel = "Add Combatant",
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit}>
      <h3>{submitLabel === "Add Combatant" ? "Add Combatant" : "Edit Combatant"}</h3>

      <label>Name</label>
      <input
        value={values.name}
        placeholder="Goblin Scout"
        onChange={(event) => setField("name", event.target.value)}
        required
      />

      <label>Type</label>
      <select
        value={values.combatantType}
        onChange={(event) => setField("combatantType", event.target.value)}
      >
        <option value="pc">PC</option>
        <option value="npc">NPC</option>
        <option value="monster">Monster</option>
      </select>

      <label>Initiative</label>
      <input
        type="number"
        value={values.initiative}
        onChange={(event) => setField("initiative", Number(event.target.value))}
        required
      />

      <label>Max HP</label>
      <input
        type="number"
        value={values.maxHp}
        onChange={(event) => setField("maxHp", Number(event.target.value))}
        required
      />

      <label>Current HP</label>
      <input
        type="number"
        value={values.currentHp}
        onChange={(event) => setField("currentHp", Number(event.target.value))}
        required
      />

      <label>Armor Class</label>
      <input
        type="number"
        value={values.armorClass}
        onChange={(event) => setField("armorClass", Number(event.target.value))}
        required
      />

      <label>Notes</label>
      <textarea
        value={values.notes}
        placeholder="Conditions, reminders..."
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

export default CombatantForm;
