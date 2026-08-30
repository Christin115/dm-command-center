import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiFetch } from "../api";

import CombatantForm from "../components/CombatantForm";
import CombatantCard from "../components/CombatantCard";
import DndResourceSearch from "../components/DndResourceSearch";

const EMPTY_COMBATANT = {
  name: "",
  combatantType: "pc",
  initiative: 10,
  maxHp: 10,
  currentHp: 10,
  armorClass: 10,
  notes: "",
};

function EncounterBuilder() {
  const { campaignId, encounterId } = useParams();

  const [encounter, setEncounter] = useState(null);
  const [error, setError] = useState("");
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // CREATE COMBATANT

  const [name, setName] = useState(EMPTY_COMBATANT.name);
  const [combatantType, setCombatantType] = useState(EMPTY_COMBATANT.combatantType);
  const [initiative, setInitiative] = useState(EMPTY_COMBATANT.initiative);
  const [maxHp, setMaxHp] = useState(EMPTY_COMBATANT.maxHp);
  const [currentHp, setCurrentHp] = useState(EMPTY_COMBATANT.currentHp);
  const [armorClass, setArmorClass] = useState(EMPTY_COMBATANT.armorClass);
  const [notes, setNotes] = useState(EMPTY_COMBATANT.notes);
  const [dndMonsterIndex, setDndMonsterIndex] = useState(null);

  // EDIT COMBATANT

  const [editingCombatantId, setEditingCombatantId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCombatantType, setEditCombatantType] = useState("pc");
  const [editInitiative, setEditInitiative] = useState(10);
  const [editMaxHp, setEditMaxHp] = useState(10);
  const [editCurrentHp, setEditCurrentHp] = useState(10);
  const [editArmorClass, setEditArmorClass] = useState(10);
  const [editNotes, setEditNotes] = useState("");

  function loadEncounter() {
    apiFetch(`/encounters/${encounterId}`)
      .then(setEncounter)
      .catch((error) => setError(error.message));
  }

  useEffect(() => {
    loadEncounter();
  }, [encounterId]);

  function resetCreateForm() {
    setName(EMPTY_COMBATANT.name);
    setCombatantType(EMPTY_COMBATANT.combatantType);
    setInitiative(EMPTY_COMBATANT.initiative);
    setMaxHp(EMPTY_COMBATANT.maxHp);
    setCurrentHp(EMPTY_COMBATANT.currentHp);
    setArmorClass(EMPTY_COMBATANT.armorClass);
    setNotes(EMPTY_COMBATANT.notes);
    setDndMonsterIndex(null);
  }

  async function addCombatant(event) {
    event.preventDefault();

    try {
      await apiFetch(`/encounters/${encounterId}/combatants`, {
        method: "POST",
        body: JSON.stringify({
          name,
          combatant_type: combatantType,
          initiative,
          max_hp: maxHp,
          current_hp: currentHp,
          armor_class: armorClass,
          notes,
          dnd_monster_index: dndMonsterIndex,
        }),
      });

      resetCreateForm();
      setError("");
      loadEncounter();
    } catch (error) {
      setError(error.message);
    }
  }

  function prefillFromMonster(detail) {
    const hitPoints = detail.hit_points || 1;
    const armorClassValue = detail.armor_class?.[0]?.value ?? 10;

    setName(detail.name);
    setCombatantType("monster");
    setMaxHp(hitPoints);
    setCurrentHp(hitPoints);
    setArmorClass(armorClassValue);
    setDndMonsterIndex(detail.index);
  }

  function startEditingCombatant(combatant) {
    setEditingCombatantId(combatant.id);
    setEditName(combatant.name);
    setEditCombatantType(combatant.combatant_type);
    setEditInitiative(combatant.initiative);
    setEditMaxHp(combatant.max_hp);
    setEditCurrentHp(combatant.current_hp);
    setEditArmorClass(combatant.armor_class);
    setEditNotes(combatant.notes || "");
  }

  async function updateCombatant(event) {
    event.preventDefault();

    try {
      await apiFetch(`/combatants/${editingCombatantId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editName,
          combatant_type: editCombatantType,
          initiative: editInitiative,
          max_hp: editMaxHp,
          current_hp: editCurrentHp,
          armor_class: editArmorClass,
          notes: editNotes,
        }),
      });

      setEditingCombatantId(null);
      setError("");
      loadEncounter();
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteCombatant(combatantId) {
    try {
      await apiFetch(`/combatants/${combatantId}`, {
        method: "DELETE",
      });

      setError("");
      loadEncounter();
    } catch (error) {
      setError(error.message);
    }
  }

  async function adjustHp(combatant, delta) {
    const nextHp = Math.max(0, combatant.current_hp + delta);

    try {
      await apiFetch(`/combatants/${combatant.id}`, {
        method: "PATCH",
        body: JSON.stringify({ current_hp: nextHp }),
      });

      setError("");
      loadEncounter();
    } catch (error) {
      setError(error.message);
    }
  }

  async function updateStatus(event) {
    try {
      await apiFetch(`/encounters/${encounterId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: event.target.value }),
      });

      setError("");
      loadEncounter();
    } catch (error) {
      setError(error.message);
    }
  }

  async function nextTurn() {
    const combatantCount = encounter.combatants.length;

    if (combatantCount === 0) return;

    const nextIndex = (Math.min(currentTurnIndex, combatantCount - 1) + 1) % combatantCount;

    setCurrentTurnIndex(nextIndex);

    if (nextIndex === 0) {
      try {
        await apiFetch(`/encounters/${encounterId}`, {
          method: "PATCH",
          body: JSON.stringify({ round_number: encounter.round_number + 1 }),
        });

        setError("");
        loadEncounter();
      } catch (error) {
        setError(error.message);
      }
    }
  }

  async function previousTurn() {
    const combatantCount = encounter.combatants.length;

    if (combatantCount === 0) return;

    const current = Math.min(currentTurnIndex, combatantCount - 1);
    const previousIndex = (current - 1 + combatantCount) % combatantCount;

    setCurrentTurnIndex(previousIndex);

    if (previousIndex === combatantCount - 1 && encounter.round_number > 1) {
      try {
        await apiFetch(`/encounters/${encounterId}`, {
          method: "PATCH",
          body: JSON.stringify({ round_number: encounter.round_number - 1 }),
        });

        setError("");
        loadEncounter();
      } catch (error) {
        setError(error.message);
      }
    }
  }

  async function toggleEncounterActive() {
    try {
      await apiFetch(`/encounters/${encounterId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: encounter.status === "Active" ? "Preparing" : "Active",
        }),
      });

      setError("");
      loadEncounter();
    } catch (error) {
      setError(error.message);
    }
  }

  if (!encounter) {
    return (
      <main>
        <p>Loading encounter...</p>
      </main>
    );
  }

  return (
    <main>
      <div className="page-header">
        <Link to={`/campaigns/${campaignId}`}>Back to Campaign</Link>

        <h1>{encounter.name}</h1>

        <span className="status">{encounter.status}</span>

        <label>Status</label>
        <select value={encounter.status} onChange={updateStatus}>
          <option value="Preparing">Preparing</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {error && <p className="error-message">{error}</p>}

      <section>
        <h2>Add Combatant</h2>

        <DndResourceSearch resource="monsters" onSelect={prefillFromMonster} />

        <CombatantForm
          name={name}
          combatantType={combatantType}
          initiative={initiative}
          maxHp={maxHp}
          currentHp={currentHp}
          armorClass={armorClass}
          notes={notes}
          setName={setName}
          setCombatantType={setCombatantType}
          setInitiative={setInitiative}
          setMaxHp={setMaxHp}
          setCurrentHp={setCurrentHp}
          setArmorClass={setArmorClass}
          setNotes={setNotes}
          onSubmit={addCombatant}
        />
      </section>

      <section>
        <h2>Combatants</h2>

        <div className="encounter-controls">
          <button type="button" onClick={toggleEncounterActive}>
            {encounter.status === "Active" ? "Stop Encounter" : "Start Encounter"}
          </button>

          <div className="turn-controls">
            <button type="button" onClick={previousTurn}>
              Previous Turn
            </button>

            <button type="button" onClick={nextTurn}>
              Next Turn
            </button>
          </div>
        </div>

        <p>Round {encounter.round_number}</p>

        <div className="campaign-grid">
          {encounter.combatants.map((combatant, index) =>
            editingCombatantId === combatant.id ? (
              <article key={combatant.id}>
                <CombatantForm
                  name={editName}
                  combatantType={editCombatantType}
                  initiative={editInitiative}
                  maxHp={editMaxHp}
                  currentHp={editCurrentHp}
                  armorClass={editArmorClass}
                  notes={editNotes}
                  setName={setEditName}
                  setCombatantType={setEditCombatantType}
                  setInitiative={setEditInitiative}
                  setMaxHp={setEditMaxHp}
                  setCurrentHp={setEditCurrentHp}
                  setArmorClass={setEditArmorClass}
                  setNotes={setEditNotes}
                  onSubmit={updateCombatant}
                  submitLabel="Save Combatant"
                  onCancel={() => setEditingCombatantId(null)}
                />
              </article>
            ) : (
              <CombatantCard
                key={combatant.id}
                combatant={combatant}
                onEdit={startEditingCombatant}
                onDelete={deleteCombatant}
                onAdjustHp={adjustHp}
                locked={encounter.status === "Active"}
                isCurrentTurn={
                  index === Math.min(currentTurnIndex, encounter.combatants.length - 1)
                }
              />
            )
          )}
        </div>
      </section>
    </main>
  );
}

export default EncounterBuilder;
