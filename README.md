# DM Command Center

DM Command Center is a full-stack campaign management application built for tabletop Dungeon Masters who need one organized place to prep, run, and schedule their games — instead of splitting that work across notebooks, spreadsheets, PDFs, and group chats.

## Business Problem

Running a tabletop RPG campaign means juggling a lot of moving pieces: preparation tasks before a session, world-building notes on NPCs and locations, monster stats for combat, initiative order once a fight starts, and coordinating when the group can actually meet again. When that information is spread across five different tools, prep takes longer and details get lost between sessions.

DM Command Center centralizes all of it — scoped to each campaign, owned by the DM who created it — and layers in a live connection to the official D&D 5th Edition ruleset so monster and spell data never has to be looked up or typed in by hand.

## Features

- **Authentication** — signup, login, logout, and session-based auth with bcrypt password hashing. Protected routes redirect to login when signed out; the nav reflects auth state.
- **Campaigns** — create, view, edit, and delete campaigns, each scoped to the logged-in user. Every resource below belongs to a campaign, and every route re-verifies campaign ownership before returning data.
- **Preparation Tasks** — priority (Low/Medium/High) and status (To Do/In Progress/Done) tracking, with a one-click Mark Complete action.
- **Campaign Notes** — organized by category: NPC, Location, Lore, Encounter, Plot Hook, Player Decision, Session Summary, Treasure, and Other.
- **Combat Encounter Tracker** — combatants automatically sorted by initiative; a highlighted "current turn" indicator with Next/Previous Turn controls that cycle through the order and auto-advance the round counter; quick HP damage/heal adjustment; and a monster search that pulls live stats from the D&D 5e API to prefill a combatant's name, HP, and AC. Starting an encounter locks the roster (hides Edit/Delete) so it can't change mid-fight.
- **D&D 5e Compendium** — search across all 7 resource types the API exposes (monsters, spells, equipment, magic items, conditions, classes, races) and view full rendered stat blocks — ability scores, AC, HP, saving throws, damage types, actions, and traits — instead of raw JSON.
- **Session Scheduler** — schedule real-world session dates with notes, track status (Scheduled/Completed/Cancelled), and add a session to Google Calendar in one click via a pre-filled event link (no OAuth required).
- **Validation & error handling** on every form, both client- and server-side.
- **Responsive, dark-fantasy inspired interface.**
- **Automated test coverage** — 52 pytest tests covering authentication, CRUD operations, validation, initiative ordering, cascade deletes, and ownership protection (confirming a user gets a 404, not a 403, when requesting another user's data).

## Technology Stack

### Frontend
- React 19
- Vite
- React Router
- Context API (shared auth state)
- Custom hooks (`useFormState` for form state management)
- Fetch API
- CSS

### Backend
- Python
- Flask
- Flask-SQLAlchemy
- Flask-Migrate (Alembic migrations)
- Flask-Bcrypt
- Flask-CORS
- SQLite

### Testing & Development
- Pytest
- Git / GitHub

## Data Models

```text
User
  |
  | one-to-many
  v
Campaign
  |
  +------------+------------+------------------+------------+
  |            |            |                  |            |
  | 1:many     | 1:many     | 1:many           | 1:many     |
  v            v            v                  v
Task         Note       Encounter          GameSession
                            |
                            | 1:many
                            v
                        Combatant
```

- **Task** — priority, status, optional due date.
- **Note** — content, category.
- **Encounter** — status (Preparing/Active/Completed), round number; owns a list of Combatants ordered by initiative (descending).
- **Combatant** — type (pc/npc/monster), initiative, max/current HP, armor class, optional link back to a D&D API monster index.
- **GameSession** — scheduled date/time, status (Scheduled/Completed/Cancelled), notes.

## API Overview

All routes below except `/`, `/signup`, `/login`, and `/dnd/*` require an active session and are scoped to the logged-in user's own campaigns.

| Resource | Routes |
|---|---|
| Auth | `POST /signup`, `POST /login`, `GET /check_session`, `DELETE /logout` |
| Campaigns | `GET/POST /campaigns`, `GET/PATCH/DELETE /campaigns/:id` |
| Tasks | `GET/POST /campaigns/:id/tasks`, `GET/PATCH/DELETE /tasks/:id` |
| Notes | `GET/POST /campaigns/:id/notes`, `GET/PATCH/DELETE /notes/:id` |
| Encounters | `GET/POST /campaigns/:id/encounters`, `GET/PATCH/DELETE /encounters/:id` |
| Combatants | `GET/POST /encounters/:id/combatants`, `GET/PATCH/DELETE /combatants/:id` |
| Sessions | `GET/POST /campaigns/:id/sessions`, `GET/PATCH/DELETE /sessions/:id` |
| D&D 5e proxy | `GET /dnd/:resource`, `GET /dnd/:resource/:index` |

## Getting Started

### Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

flask db upgrade          # create/update the database schema
python -m server.seed     # optional: seed sample data

flask run --port 5555
```

The API runs at `http://127.0.0.1:5555`. It's configured to accept requests from `http://localhost:5173` and `http://127.0.0.1:5173`.

By default the app uses a local SQLite file (`instance/app.db`). To point it at a different database, set the `DATABASE_URL` environment variable before starting Flask.

### Frontend

```bash
cd client
npm install
npm run dev
```

The client runs at `http://127.0.0.1:5173`.

### Running Tests

```bash
pytest
```

Tests run against an isolated in-memory database and never touch your local development data.

## Project Structure

```text
server/
  app.py          Flask routes
  models.py       SQLAlchemy models
  seed.py         sample data
  tests/          pytest suite
migrations/       Alembic migration history
client/
  src/
    components/   reusable UI components and forms
    pages/        route-level views
    context/      AuthContext / useAuth
    hooks/        useFormState
```
