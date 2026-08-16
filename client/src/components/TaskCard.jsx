function TaskCard({ task, onEdit, onComplete, onDelete }) {
  const displayPriority = task.priority
    ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
    : "None";

  return (
    <article>
      <h3>{task.title}</h3>

      <p>{task.description || "No description."}</p>

      <p>
        <strong>Priority:</strong> {displayPriority}
      </p>

      <p>
        <strong>Status:</strong> {task.status}
      </p>

      <div className="card-actions">
        <button
          type="button"
          onClick={() => onEdit(task)}
        >
          Edit Task
        </button>

        {task.status !== "Done" && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => onComplete(task)}
          >
            Mark Complete
          </button>
        )}

        <button
          type="button"
          className="danger-button"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskCard;