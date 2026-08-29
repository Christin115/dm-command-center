import { useState } from "react";

import { apiFetch } from "../api";

import DndDetailPanel from "./DndDetailPanel";

function CombatantCard({ combatant, onEdit, onDelete, onAdjustHp }) {
  const [statBlock, setStatBlock] = useState(null);
  const [showStatBlock, setShowStatBlock] = useState(false);

  async function toggleStatBlock() {
    if (showStatBlock) {
      setShowStatBlock(false);
      return;
    }

    if (!statBlock) {
      try {
        const detail = await apiFetch(
          `/dnd/monsters/${combatant.dnd_monster_index}`
        );

        setStatBlock(detail);
      } catch (error) {
        console.error(error);
        return;
      }
    }

    setShowStatBlock(true);
  }

  return (
    <article>
      <h3>{combatant.name}</h3>

      <span className="status">{combatant.combatant_type}</span>

      <p>
        <strong>Initiative:</strong> {combatant.initiative}
      </p>

      <p>
        <strong>Armor Class:</strong> {combatant.armor_class}
      </p>

      <p>
        <strong>HP:</strong> {combatant.current_hp} / {combatant.max_hp}
      </p>

      {combatant.notes && <p>{combatant.notes}</p>}

      <div className="card-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => onAdjustHp(combatant, -1)}
        >
          -1 HP
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => onAdjustHp(combatant, 1)}
        >
          +1 HP
        </button>

        <button
          type="button"
          onClick={() => onEdit(combatant)}
        >
          Edit
        </button>

        <button
          type="button"
          className="danger-button"
          onClick={() => onDelete(combatant.id)}
        >
          Delete
        </button>

        {combatant.dnd_monster_index && (
          <button
            type="button"
            className="secondary-button"
            onClick={toggleStatBlock}
          >
            {showStatBlock ? "Hide Stat Block" : "View Stat Block"}
          </button>
        )}
      </div>

      {showStatBlock && statBlock && (
        <DndDetailPanel detail={statBlock} />
      )}
    </article>
  );
}

export default CombatantCard;
