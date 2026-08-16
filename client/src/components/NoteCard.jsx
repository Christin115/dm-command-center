function NoteCard({ note, onEdit, onDelete }) {
  return (
    <article>
      <h3>{note.title}</h3>

      <span className="status">
        {note.category}
      </span>

      <p>{note.content}</p>

      <div className="card-actions">
        <button
          type="button"
          onClick={() => onEdit(note)}
        >
          Edit Note
        </button>

        <button
          type="button"
          className="danger-button"
          onClick={() => onDelete(note.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default NoteCard;