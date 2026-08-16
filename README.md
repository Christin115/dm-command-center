# DM Command Center

DM Command Center is a full-stack productivity application designed for Dungeon Masters who need one organized place to manage campaigns, preparation tasks, and campaign notes.

Dungeon Masters often keep important information across notebooks, documents, chat messages, and spreadsheets. DM Command Center reduces that friction by combining campaign organization, task tracking, and note taking in one application.

## Features

- User signup, login, logout, and session authentication
- Protected user data and campaign ownership
- Campaign creation, viewing, editing, and deletion
- Campaign descriptions
- Task creation, viewing, editing, and deletion
- Task priority levels: Low, Medium, and High
- Task statuses: To Do, In Progress, and Done
- One-click Mark Complete action
- Campaign note creation, viewing, editing, and deletion
- Note subject categories including NPC, Location, Lore, Encounter, Plot Hook, Player Decision, Session Summary, Treasure, and Other
- Validation and error handling
- Responsive dark-fantasy inspired interface
- Pytest coverage for authentication, CRUD operations, validations, and ownership protection

## Business Problem

Dungeon Masters manage a large amount of information while preparing and running tabletop role-playing campaigns. Session preparation may involve NPC details, locations, encounters, plot hooks, player decisions, campaign notes, and tasks that must be completed before the next session.

When this information is spread across multiple tools, preparation becomes slower and important details can be missed.

DM Command Center centralizes campaign planning so Dungeon Masters can spend less time searching for information and more time preparing and running their games.

## Technology Stack

### Frontend

- React
- Vite
- React Router
- JavaScript
- Fetch API
- useState
- useEffect
- CSS

### Backend

- Python
- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-Bcrypt
- Flask-CORS
- SQLite

### Testing and Development

- Pytest
- Git
- GitHub
- VS Code

## Data Models

```text
User
  |
  | one-to-many
  v
Campaign
  |
  +----------------+
  |                |
  | one-to-many    | one-to-many
  v                v
Task              Note