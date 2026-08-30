import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { apiFetch } from "../api";
import { useFormState } from "../hooks/useFormState";

import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";
import NoteForm from "../components/NoteForm";
import NoteCard from "../components/NoteCard";
import EncounterForm from "../components/EncounterForm";
import EncounterCard from "../components/EncounterCard";
import SessionForm from "../components/SessionForm";
import SessionCard from "../components/SessionCard";


const EMPTY_TASK = {
  title: "",
  description: "",
  priority: "medium",
  status: "To Do",
};

const EMPTY_NOTE = {
  title: "",
  content: "",
  category: "Other",
};

const EMPTY_ENCOUNTER = {
  name: "",
};

const EMPTY_SESSION = {
  scheduledAt: "",
  notes: "",
};


function CampaignDetails() {
  const { id } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState("");

  // TASK

  const taskForm = useFormState(EMPTY_TASK);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const editTaskForm = useFormState(EMPTY_TASK);

  // NOTE

  const noteForm = useFormState(EMPTY_NOTE);

  const [editingNoteId, setEditingNoteId] = useState(null);
  const editNoteForm = useFormState(EMPTY_NOTE);

  // ENCOUNTER

  const encounterForm = useFormState(EMPTY_ENCOUNTER);

  // SESSION

  const sessionForm = useFormState(EMPTY_SESSION);


  function loadCampaign() {
    apiFetch(`/campaigns/${id}`)
      .then(setCampaign)
      .catch((error) => setError(error.message));
  }


  useEffect(() => {
    loadCampaign();
  }, [id]);


  async function addTask(event) {
    event.preventDefault();

    try {
      await apiFetch(`/campaigns/${id}/tasks`, {
        method: "POST",

        body: JSON.stringify({
          title: taskForm.values.title,
          description: taskForm.values.description,
          priority: taskForm.values.priority,
          status: taskForm.values.status,
        }),
      });

      taskForm.reset();

      setError("");

      loadCampaign();

    } catch (error) {
      setError(error.message);
    }
  }


  function startEditingTask(task) {
    setEditingTaskId(task.id);

    editTaskForm.reset({
      title: task.title,
      description: task.description || "",
      priority: task.priority.toLowerCase(),
      status: task.status,
    });
  }


  async function updateTask(event) {
    event.preventDefault();

    try {
      await apiFetch(
        `/tasks/${editingTaskId}`,
        {
          method: "PATCH",

          body: JSON.stringify({
            title: editTaskForm.values.title,
            description: editTaskForm.values.description,
            priority: editTaskForm.values.priority,
            status: editTaskForm.values.status,
          }),
        }
      );

      setEditingTaskId(null);

      setError("");

      loadCampaign();

    } catch (error) {
      setError(error.message);
    }
  }


  async function completeTask(task) {
    try {
      await apiFetch(
        `/tasks/${task.id}`,
        {
          method: "PATCH",

          body: JSON.stringify({
            status: "Done",
          }),
        }
      );

      setError("");

      loadCampaign();

    } catch (error) {
      setError(error.message);
    }
  }


  async function deleteTask(taskId) {
    try {
      await apiFetch(
        `/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      setError("");

      loadCampaign();

    } catch (error) {
      setError(error.message);
    }
  }


  async function addNote(event) {
    event.preventDefault();

    try {
      await apiFetch(
        `/campaigns/${id}/notes`,
        {
          method: "POST",

          body: JSON.stringify({
            title: noteForm.values.title,
            content: noteForm.values.content,
            category: noteForm.values.category,
          }),
        }
      );

      noteForm.reset();

      setError("");

      loadCampaign();

    } catch (error) {
      setError(error.message);
    }
  }


  function startEditingNote(note) {
    setEditingNoteId(note.id);

    editNoteForm.reset({
      title: note.title,
      content: note.content,
      category: note.category,
    });
  }


  async function updateNote(event) {
    event.preventDefault();

    try {
      await apiFetch(
        `/notes/${editingNoteId}`,
        {
          method: "PATCH",

          body: JSON.stringify({
            title: editNoteForm.values.title,
            content: editNoteForm.values.content,
            category: editNoteForm.values.category,
          }),
        }
      );

      setEditingNoteId(null);

      setError("");

      loadCampaign();

    } catch (error) {
      setError(error.message);
    }
  }


  async function deleteNote(noteId) {
    try {
      await apiFetch(
        `/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );

      setError("");

      loadCampaign();

    } catch (error) {
      setError(error.message);
    }
  }


  async function addEncounter(event) {
    event.preventDefault();

    try {
      await apiFetch(`/campaigns/${id}/encounters`, {
        method: "POST",

        body: JSON.stringify({
          name: encounterForm.values.name,
        }),
      });

      encounterForm.reset();

      setError("");

      loadCampaign();

    } catch (error) {
      setError(error.message);
    }
  }


  async function deleteEncounter(encounterId) {
    try {
      await apiFetch(
        `/encounters/${encounterId}`,
        {
          method: "DELETE",
        }
      );

      setError("");

      loadCampaign();

    } catch (error) {
      setError(error.message);
    }
  }


  async function addSession(event) {
    event.preventDefault();

    try {
      await apiFetch(`/campaigns/${id}/sessions`, {
        method: "POST",

        body: JSON.stringify({
          scheduled_at: sessionForm.values.scheduledAt,
          notes: sessionForm.values.notes,
        }),
      });

      sessionForm.reset();

      setError("");

      loadCampaign();

    } catch (error) {
      setError(error.message);
    }
  }


  async function updateSessionStatus(sessionId, status) {
    try {
      await apiFetch(
        `/sessions/${sessionId}`,
        {
          method: "PATCH",

          body: JSON.stringify({
            status,
          }),
        }
      );

      setError("");

      loadCampaign();

    } catch (error) {
      setError(error.message);
    }
  }


  async function deleteSession(sessionId) {
    try {
      await apiFetch(
        `/sessions/${sessionId}`,
        {
          method: "DELETE",
        }
      );

      setError("");

      loadCampaign();

    } catch (error) {
      setError(error.message);
    }
  }


  if (!campaign) {
    return (
      <main>
        <p>Loading campaign...</p>
      </main>
    );
  }


  return (
    <main>

      <div className="page-header">

        <h1>
          {campaign.title}
        </h1>

        <p>
          {campaign.description ||
            "No campaign description yet."}
        </p>

      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      {/* TASK SECTION */}

      <section>

        <h2>
          Preparation Tasks
        </h2>


        <TaskForm
          values={taskForm.values}
          setField={taskForm.setField}
          onSubmit={addTask}
        />


        <div className="campaign-grid">

          {campaign.tasks.map((task) => (

            editingTaskId === task.id ? (

              <article key={task.id}>

                <TaskForm
                  values={editTaskForm.values}
                  setField={editTaskForm.setField}

                  onSubmit={updateTask}

                  submitLabel="Save Task"

                  onCancel={() =>
                    setEditingTaskId(null)
                  }
                />

              </article>

            ) : (

              <TaskCard
                key={task.id}

                task={task}

                onEdit={
                  startEditingTask
                }

                onComplete={
                  completeTask
                }

                onDelete={
                  deleteTask
                }
              />

            )

          ))}

        </div>

      </section>


      {/* NOTE SECTION */}

      <section>

        <h2>
          Campaign Notes
        </h2>


        <NoteForm
          values={noteForm.values}
          setField={noteForm.setField}
          onSubmit={addNote}
        />


        <div className="campaign-grid">

          {campaign.notes.map((note) => (

            editingNoteId === note.id ? (

              <article key={note.id}>

                <NoteForm
                  values={editNoteForm.values}
                  setField={editNoteForm.setField}

                  onSubmit={updateNote}

                  submitLabel="Save Note"

                  onCancel={() =>
                    setEditingNoteId(null)
                  }
                />

              </article>

            ) : (

              <NoteCard
                key={note.id}

                note={note}

                onEdit={
                  startEditingNote
                }

                onDelete={
                  deleteNote
                }
              />

            )

          ))}

        </div>

      </section>


      {/* ENCOUNTER SECTION */}

      <section>

        <h2>
          Encounters
        </h2>


        <EncounterForm
          values={encounterForm.values}
          setField={encounterForm.setField}
          onSubmit={addEncounter}
        />


        <div className="campaign-grid">

          {campaign.encounters.map((encounter) => (

            <EncounterCard
              key={encounter.id}

              encounter={encounter}

              campaignId={id}

              onDelete={
                deleteEncounter
              }
            />

          ))}

        </div>

      </section>


      {/* SESSION SECTION */}

      <section>

        <h2>
          Sessions
        </h2>


        <SessionForm
          values={sessionForm.values}
          setField={sessionForm.setField}
          onSubmit={addSession}
        />


        <div className="campaign-grid">

          {campaign.sessions.map((session) => (

            <SessionCard
              key={session.id}

              session={session}

              campaignTitle={campaign.title}

              onStatusChange={
                updateSessionStatus
              }

              onDelete={
                deleteSession
              }
            />

          ))}

        </div>

      </section>

    </main>
  );
}


export default CampaignDetails;
