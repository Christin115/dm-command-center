const SESSION_DURATION_HOURS = 3;

function pad(number) {
  return String(number).padStart(2, "0");
}

// Google Calendar treats a dates value with no trailing "Z" as a floating
// local time, taken literally rather than converted through UTC — which is
// what we want, since scheduled_at has no timezone of its own.
function formatForGoogleCalendar(date) {
  const datePart = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const timePart = `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

  return `${datePart}T${timePart}`;
}

function buildGoogleCalendarUrl(session, campaignTitle) {
  const start = new Date(session.scheduled_at);
  const end = new Date(start.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: campaignTitle ? `${campaignTitle} Session` : "DM Session",
    dates: `${formatForGoogleCalendar(start)}/${formatForGoogleCalendar(end)}`,
    details: session.notes || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function SessionCard({ session, campaignTitle, onStatusChange, onDelete }) {
  const scheduledLabel = session.scheduled_at
    ? new Date(session.scheduled_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "No date set";

  return (
    <article>
      <h3>{scheduledLabel}</h3>

      <span className="status">{session.status}</span>

      {session.notes && <p>{session.notes}</p>}

      <label>Status</label>

      <select
        value={session.status}
        onChange={(event) => onStatusChange(session.id, event.target.value)}
      >
        <option value="Scheduled">Scheduled</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      <div className="card-actions">
        {session.scheduled_at && (
          <a
            className="link-button"
            href={buildGoogleCalendarUrl(session, campaignTitle)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Add to Google Calendar
          </a>
        )}

        <button
          type="button"
          className="danger-button"
          onClick={() => onDelete(session.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default SessionCard;
