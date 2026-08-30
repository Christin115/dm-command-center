import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { apiFetch } from "../api";

import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";
import NoteForm from "../components/NoteForm";
import NoteCard from "../components/NoteCard";
import EncounterForm from "../components/EncounterForm";
import EncounterCard from "../components/EncounterCard";
import SessionForm from "../components/SessionForm";
import SessionCard from "../components/SessionCard";


function CampaignDetails() {
  const { id } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState("");

  // CREATE TASK

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskStatus, setTaskStatus] = useState("To Do");

  // EDIT TASK

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState("medium");
  const [editTaskStatus, setEditTaskStatus] = useState("To Do");

  // CREATE NOTE

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("Other");

  // EDIT NOTE

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteTitle, setEditNoteTitle] = useState("");
  const [editNoteContent, setEditNoteContent] = useState("");
  const [editNoteCategory, setEditNoteCategory] = useState("Other");

  // CREATE ENCOUNTER

  const [encounterName, setEncounterName] = useState("");

  // CREATE SESSION

  const [sessionScheduledAt, setSessionScheduledAt] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");


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
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          status: taskStatus,
        }),
      });

      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("medium");
      setTaskStatus("To Do");

      setError("");

      loadCampaign();

    } catch (error) {
      setError(error.message);
    }
  }


  function startEditingTask(task) {
    setEditingTaskId(task.id);

    setEditTaskTitle(task.title);

    setEditTaskDescription(
      task.description || ""
    );

    setEditTaskPriority(
      task.priority.toLowerCase()
    );

    setEditTaskStatus(task.status);
  }


  async function updateTask(event) {
    event.preventDefault();

    try {
      await apiFetch(
        `/tasks/${editingTaskId}`,
        {
          method: "PATCH",

          body: JSON.stringify({
            title: editTaskTitle,
            description: editTaskDescription,
            priority: editTaskPriority,
            status: editTaskStatus,
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
            title: noteTitle,
            content: noteContent,
            category: noteCategory,
          }),
        }
      );

      setNoteTitle("");
      setNoteContent("");
      setNoteCategory("Other");

      setError("");

      loadCampaign();

    } catch (error) {
      setError(error.message);
    }
  }


  function startEditingNote(note) {
    setEditingNoteId(note.id);

    setEditNoteTitle(note.title);
    setEditNoteContent(note.content);
    setEditNoteCategory(note.category);
  }


  async function updateNote(event) {
    event.preventDefault();

    try {
      await apiFetch(
        `/notes/${editingNoteId}`,
        {
          method: "PATCH",

          body: JSON.stringify({
            title: editNoteTitle,
            content: editNoteContent,
            category: editNoteCategory,
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
          name: encounterName,
        }),
      });

      setEncounterName("");

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
          scheduled_at: sessionScheduledAt,
          notes: sessionNotes,
        }),
      });

      setSessionScheduledAt("");
      setSessionNotes("");

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
          title={taskTitle}
          description={taskDescription}
          priority={taskPriority}
          status={taskStatus}

          setTitle={setTaskTitle}
          setDescription={setTaskDescription}
          setPriority={setTaskPriority}
          setStatus={setTaskStatus}

          onSubmit={addTask}
        />


        <div className="campaign-grid">

          {campaign.tasks.map((task) => (

            editingTaskId === task.id ? (

              <article key={task.id}>

                <TaskForm
                  title={editTaskTitle}
                  description={editTaskDescription}
                  priority={editTaskPriority}
                  status={editTaskStatus}

                  setTitle={setEditTaskTitle}
                  setDescription={
                    setEditTaskDescription
                  }
                  setPriority={
                    setEditTaskPriority
                  }
                  setStatus={
                    setEditTaskStatus
                  }

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
          title={noteTitle}
          content={noteContent}
          category={noteCategory}

          setTitle={setNoteTitle}
          setContent={setNoteContent}
          setCategory={setNoteCategory}

          onSubmit={addNote}
        />


        <div className="campaign-grid">

          {campaign.notes.map((note) => (

            editingNoteId === note.id ? (

              <article key={note.id}>

                <NoteForm
                  title={editNoteTitle}
                  content={editNoteContent}
                  category={editNoteCategory}

                  setTitle={setEditNoteTitle}
                  setContent={
                    setEditNoteContent
                  }
                  setCategory={
                    setEditNoteCategory
                  }

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
          name={encounterName}
          setName={setEncounterName}
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
          scheduledAt={sessionScheduledAt}
          notes={sessionNotes}

          setScheduledAt={setSessionScheduledAt}
          setNotes={setSessionNotes}

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
