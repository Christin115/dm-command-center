function CombatantForm({
  name,
  combatantType,
  initiative,
  maxHp,
  currentHp,
  armorClass,
  notes,
  setName,
  setCombatantType,
  setInitiative,
  setMaxHp,
  setCurrentHp,
  setArmorClass,
  setNotes,
  onSubmit,
  submitLabel = "Add Combatant",
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit}>
      <h3>{submitLabel === "Add Combatant" ? "Add Combatant" : "Edit Combatant"}</h3>

      <label>Name</label>
      <input
        value={name}
        placeholder="Goblin Scout"
        onChange={(event) => setName(event.target.value)}
        required
      />

      <label>Type</label>
      <select
        value={combatantType}
        onChange={(event) => setCombatantType(event.target.value)}
      >
        <option value="pc">PC</option>
        <option value="npc">NPC</option>
        <option value="monster">Monster</option>
      </select>

      <label>Initiative</label>
      <input
        type="number"
        value={initiative}
        onChange={(event) => setInitiative(Number(event.target.value))}
        required
      />

      <label>Max HP</label>
      <input
        type="number"
        value={maxHp}
        onChange={(event) => setMaxHp(Number(event.target.value))}
        required
      />

      <label>Current HP</label>
      <input
        type="number"
        value={currentHp}
        onChange={(event) => setCurrentHp(Number(event.target.value))}
        required
      />

      <label>Armor Class</label>
      <input
        type="number"
        value={armorClass}
        onChange={(event) => setArmorClass(Number(event.target.value))}
        required
      />

      <label>Notes</label>
      <textarea
        value={notes}
        placeholder="Conditions, reminders..."
        onChange={(event) => setNotes(event.target.value)}
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
