const NOTE_CATEGORIES = [
  "NPC",
  "Location",
  "Lore",
  "Encounter",
  "Plot Hook",
  "Player Decision",
  "Session Summary",
  "Treasure",
  "Other",
];

function NoteForm({
  title,
  content,
  category,
  setTitle,
  setContent,
  setCategory,
  onSubmit,
  submitLabel = "Add Note",
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit}>
      <h3>
        {submitLabel === "Add Note"
          ? "Create Note"
          : "Edit Note"}
      </h3>

      <label>Note Title</label>

      <input
        value={title}
        placeholder="Captain Elira"
        onChange={(event) =>
          setTitle(event.target.value)
        }
        required
      />

      <label>Subject Matter</label>

      <select
        value={category}
        onChange={(event) =>
          setCategory(event.target.value)
        }
      >
        {NOTE_CATEGORIES.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

      <label>Notes</label>

      <textarea
        value={content}
        placeholder="Write your campaign note..."
        onChange={(event) =>
          setContent(event.target.value)
        }
        required
      />

      <button type="submit">
        {submitLabel}
      </button>

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

export default NoteForm;