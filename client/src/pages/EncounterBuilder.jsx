import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiFetch } from "../api";
import { useFormState } from "../hooks/useFormState";

import CombatantForm from "../components/CombatantForm";
import CombatantCard from "../components/CombatantCard";
import DndResourceSearch from "../components/DndResourceSearch";
import DndDetailPanel from "../components/DndDetailPanel";

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

  const combatantForm = useFormState(EMPTY_COMBATANT);
  const [dndMonsterIndex, setDndMonsterIndex] = useState(null);
  const [previewDetail, setPreviewDetail] = useState(null);
  const previewRef = useRef(null);

  // EDIT COMBATANT

  const [editingCombatantId, setEditingCombatantId] = useState(null);
  const editCombatantForm = useFormState(EMPTY_COMBATANT);

  function loadEncounter() {
    apiFetch(`/encounters/${encounterId}`)
      .then(setEncounter)
      .catch((error) => setError(error.message));
  }

  useEffect(() => {
    loadEncounter();
  }, [encounterId]);

  useEffect(() => {
    if (previewDetail) {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [previewDetail]);

  function resetCreateForm() {
    combatantForm.reset();
    setDndMonsterIndex(null);
    setPreviewDetail(null);
  }

  async function addCombatant(event) {
    event.preventDefault();

    try {
      await apiFetch(`/encounters/${encounterId}/combatants`, {
        method: "POST",
        body: JSON.stringify({
          name: combatantForm.values.name,
          combatant_type: combatantForm.values.combatantType,
          initiative: combatantForm.values.initiative,
          max_hp: combatantForm.values.maxHp,
          current_hp: combatantForm.values.currentHp,
          armor_class: combatantForm.values.armorClass,
          notes: combatantForm.values.notes,
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

    combatantForm.setFields({
      name: detail.name,
      combatantType: "monster",
      maxHp: hitPoints,
      currentHp: hitPoints,
      armorClass: armorClassValue,
    });

    setDndMonsterIndex(detail.index);
    setPreviewDetail(detail);
  }

  function startEditingCombatant(combatant) {
    setEditingCombatantId(combatant.id);

    editCombatantForm.reset({
      name: combatant.name,
      combatantType: combatant.combatant_type,
      initiative: combatant.initiative,
      maxHp: combatant.max_hp,
      currentHp: combatant.current_hp,
      armorClass: combatant.armor_class,
      notes: combatant.notes || "",
    });
  }

  async function updateCombatant(event) {
    event.preventDefault();

    try {
      await apiFetch(`/combatants/${editingCombatantId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editCombatantForm.values.name,
          combatant_type: editCombatantForm.values.combatantType,
          initiative: editCombatantForm.values.initiative,
          max_hp: editCombatantForm.values.maxHp,
          current_hp: editCombatantForm.values.currentHp,
          armor_class: editCombatantForm.values.armorClass,
          notes: editCombatantForm.values.notes,
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

        <div ref={previewRef}>
          <DndDetailPanel detail={previewDetail} />
        </div>

        <CombatantForm
          values={combatantForm.values}
          setField={combatantForm.setField}
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
                  values={editCombatantForm.values}
                  setField={editCombatantForm.setField}
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
