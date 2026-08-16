function TaskForm({
  title,
  description,
  priority,
  status,
  setTitle,
  setDescription,
  setPriority,
  setStatus,
  onSubmit,
  submitLabel = "Add Task",
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit}>
      <h3>{submitLabel === "Add Task" ? "Create Task" : "Edit Task"}</h3>

      <label>Task Title</label>
      <input
        value={title}
        placeholder="Prepare dragon encounter"
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      <label>Description</label>
      <textarea
        value={description}
        placeholder="Describe what needs to be prepared..."
        onChange={(event) => setDescription(event.target.value)}
      />

      <label>Priority</label>
      <select
        value={priority}
        onChange={(event) => setPriority(event.target.value)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <label>Status</label>
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>

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

export default TaskForm;