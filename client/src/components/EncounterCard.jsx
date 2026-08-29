import { Link } from "react-router-dom";

function EncounterCard({ encounter, campaignId, onDelete }) {
  return (
    <article>
      <h3>{encounter.name}</h3>

      <span className="status">{encounter.status}</span>

      <p>Round {encounter.round_number}</p>

      <div className="card-actions">
        <Link
          className="link-button"
          to={`/campaigns/${campaignId}/encounters/${encounter.id}`}
        >
          Open Encounter
        </Link>

        <button
          type="button"
          className="danger-button"
          onClick={() => onDelete(encounter.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default EncounterCard;
