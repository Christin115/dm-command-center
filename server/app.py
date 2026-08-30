from datetime import datetime

from flask import Flask, request, session
from flask_migrate import Migrate
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError
import requests

from server.models import (db, bcrypt, User, Campaign, Task, Note, Encounter, Combatant, GameSession)




app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "development-secret-key"
app.json.compact = False
DND_API_BASE = "https://www.dnd5eapi.co/api/2014"

db.init_app(app)
bcrypt.init_app(app)
migrate = Migrate(app, db)

CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]
)

@app.route("/")
def index():

    return {
        "message": "DM Command Center API"
    }, 200

@app.route("/signup", methods=["POST"])
def signup():

    data = request.get_json() or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return {
            "error": "Username, email, and password are required."
        }, 400

    if len(password) < 6:
        return {
            "error": "Password must be at least 6 characters."
        }, 400

    try:

        user = User(
            username=username.strip(),
            email=email.strip().lower()
        )

        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        session["user_id"] = user.id
        return user.to_dict(), 201

    except IntegrityError:

        db.session.rollback()

        return {
            "error": "Username or email already exists."
        }, 422

    except ValueError as error:

        db.session.rollback()
        return {
            "error": str(error)
        }, 400

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json() or {}

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {
            "error": "Username and password are required."
        }, 400

    user = User.query.filter_by(
        username=username
    ).first()

    if not user or not user.authenticate(password):

        return {
            "error": "Invalid username or password."
        }, 401

    session["user_id"] = user.id

    return user.to_dict(), 200

@app.route("/check_session")
def check_session():

    user_id = session.get("user_id")

    if not user_id:
        return {
            "error": "Not authorized."
        }, 401

    user = db.session.get(
        User,
        user_id
    )

    if not user:
        session.clear()

        return {
            "error": "User not found."
        }, 401

    return user.to_dict(), 200

@app.route("/logout", methods=["DELETE"])
def logout():

    session.clear()

    return {}, 204

def current_user_id():
    return session.get("user_id")

@app.route("/campaigns", methods=["GET"])
def campaigns_index():

    user_id = current_user_id()

    if not user_id:
        return {
            "error": "Not authorized."
        }, 401

    campaigns = Campaign.query.filter_by(
        user_id=user_id
    ).all()

    return [
        campaign.to_dict()
        for campaign in campaigns
    ], 200

@app.route("/campaigns", methods=["POST"])
def campaigns_create():

    user_id = current_user_id()

    if not user_id:
        return {
            "error": "Not authorized."
        }, 401

    data = request.get_json() or {}

    try:

        campaign = Campaign(
            title=data.get("title"),
            description=data.get("description"),
            game_system=data.get(
                "game_system",
                "Dungeons & Dragons 5e"
            ),
            status=data.get(
                "status",
                "Active"
            ),
            user_id=user_id
        )

        db.session.add(campaign)

        db.session.commit()

        return campaign.to_dict(), 201

    except ValueError as error:

        db.session.rollback()

        return {
            "error": str(error)
        }, 400

@app.route(
    "/campaigns/<int:id>",
    methods=["GET", "PATCH", "DELETE"]
)
def campaign_by_id(id):

    user_id = current_user_id()

    if not user_id:
        return {
            "error": "Not authorized."
        }, 401

    campaign = Campaign.query.filter_by(
        id=id,
        user_id=user_id
    ).first()

    if not campaign:
        return {
            "error": "Campaign not found."
        }, 404

    if request.method == "GET":

        return campaign.to_dict(
            include_details=True
        ), 200

    if request.method == "PATCH":

        data = request.get_json() or {}

        try:

            if "title" in data:
                campaign.title = data["title"]

            if "description" in data:
                campaign.description = data["description"]

            if "game_system" in data:
                campaign.game_system = data["game_system"]

            if "status" in data:
                campaign.status = data["status"]

            db.session.commit()

            return campaign.to_dict(), 200

        except ValueError as error:

            db.session.rollback()

            return {
                "error": str(error)
            }, 400

    if request.method == "DELETE":

        db.session.delete(campaign)

        db.session.commit()

        return {}, 204

@app.route(
    "/campaigns/<int:campaign_id>/tasks",
    methods=["GET", "POST"]
)
def campaign_tasks(campaign_id):

    user_id = current_user_id()

    if not user_id:
        return {
            "error": "Not authorized."
        }, 401

    campaign = Campaign.query.filter_by(
        id=campaign_id,
        user_id=user_id
    ).first()

    if not campaign:
        return {
            "error": "Campaign not found."
        }, 404

    if request.method == "GET":

        return [
            task.to_dict()
            for task in campaign.tasks
        ], 200

    data = request.get_json() or {}

    due_date = None

    if data.get("due_date"):

        try:
            due_date = datetime.fromisoformat(
                data["due_date"]
            )

        except ValueError:

            return {
                "error": "Invalid due date."
            }, 400

    try:

        task = Task(
            title=data.get("title"),
            description=data.get("description"),
            priority=data.get(
                "priority",
                "medium"
            ),
            status=data.get(
                "status",
                "To Do"
            ),
            due_date=due_date,
            campaign_id=campaign.id
        )

        db.session.add(task)

        db.session.commit()

        return task.to_dict(), 201

    except ValueError as error:

        db.session.rollback()

        return {
            "error": str(error)
        }, 400

@app.route(
    "/tasks/<int:id>",
    methods=["GET", "PATCH", "DELETE"]
)
def task_by_id(id):

    user_id = current_user_id()

    if not user_id:
        return {
            "error": "Not authorized."
        }, 401

    task = (
        Task.query
        .join(Campaign)
        .filter(
            Task.id == id,
            Campaign.user_id == user_id
        )
        .first()
    )

    if not task:
        return {
            "error": "Task not found."
        }, 404

    if request.method == "GET":

        return task.to_dict(), 200

    if request.method == "PATCH":

        data = request.get_json() or {}

        try:

            if "title" in data:
                task.title = data["title"]

            if "description" in data:
                task.description = data["description"]

            if "priority" in data:
                task.priority = data["priority"]

            if "status" in data:
                task.status = data["status"]

            if "due_date" in data:

                if data["due_date"]:
                    task.due_date = datetime.fromisoformat(
                        data["due_date"]
                    )

                else:
                    task.due_date = None

            db.session.commit()

            return task.to_dict(), 200

        except ValueError as error:

            db.session.rollback()

            return {
                "error": str(error)
            }, 400

    if request.method == "DELETE":

        db.session.delete(task)

        db.session.commit()

        return {}, 204

@app.route(
    "/campaigns/<int:campaign_id>/notes",
    methods=["GET", "POST"]
)
def campaign_notes(campaign_id):

    user_id = current_user_id()

    if not user_id:
        return {
            "error": "Not authorized."
        }, 401

    campaign = Campaign.query.filter_by(
        id=campaign_id,
        user_id=user_id
    ).first()

    if not campaign:
        return {
            "error": "Campaign not found."
        }, 404

    if request.method == "GET":

        return [
            note.to_dict()
            for note in campaign.notes
        ], 200

    data = request.get_json() or {}

    try:

        note = Note(
            title=data.get("title"),
            content=data.get("content"),
            category=data.get(
                "category",
                "Other"
            ),
            campaign_id=campaign.id
        )

        db.session.add(note)

        db.session.commit()

        return note.to_dict(), 201

    except ValueError as error:

        db.session.rollback()

        return {
            "error": str(error)
        }, 400

@app.route(
    "/notes/<int:id>",
    methods=["GET", "PATCH", "DELETE"]
)
def note_by_id(id):

    user_id = current_user_id()

    if not user_id:
        return {
            "error": "Not authorized."
        }, 401

    note = (
        Note.query
        .join(Campaign)
        .filter(
            Note.id == id,
            Campaign.user_id == user_id
        )
        .first()
    )

    if not note:
        return {
            "error": "Note not found."
        }, 404

    if request.method == "GET":

        return note.to_dict(), 200

    if request.method == "PATCH":

        data = request.get_json() or {}

        try:

            if "title" in data:
                note.title = data["title"]

            if "content" in data:
                note.content = data["content"]

            if "category" in data:
                note.category = data["category"]

            db.session.commit()

            return note.to_dict(), 200

        except ValueError as error:

            db.session.rollback()

            return {
                "error": str(error)
            }, 400

    if request.method == "DELETE":

        db.session.delete(note)

        db.session.commit()

        return {}, 204

@app.route(
    "/campaigns/<int:campaign_id>/encounters",
    methods=["GET", "POST"]
)
def campaign_encounters(campaign_id):

    user_id = current_user_id()

    if not user_id:
        return {
            "error": "Not authorized."
        }, 401

    campaign = Campaign.query.filter_by(
        id=campaign_id,
        user_id=user_id
    ).first()

    if not campaign:
        return {
            "error": "Campaign not found."
        }, 404

    if request.method == "GET":

        return [
            encounter.to_dict()
            for encounter in campaign.encounters
        ], 200

    data = request.get_json() or {}

    try:

        encounter = Encounter(
            name=data.get("name"),
            status=data.get(
                "status",
                "Preparing"
            ),
            round_number=data.get(
                "round_number",
                1
            ),
            campaign_id=campaign.id
        )

        db.session.add(encounter)

        db.session.commit()

        return encounter.to_dict(), 201

    except ValueError as error:

        db.session.rollback()

        return {
            "error": str(error)
        }, 400

@app.route(
    "/encounters/<int:id>",
    methods=["GET", "PATCH", "DELETE"]
)
def encounter_by_id(id):

    user_id = current_user_id()

    if not user_id:
        return {
            "error": "Not authorized."
        }, 401

    encounter = (
        Encounter.query
        .join(Campaign)
        .filter(
            Encounter.id == id,
            Campaign.user_id == user_id
        )
        .first()
    )

    if not encounter:
        return {
            "error": "Encounter not found."
        }, 404

    if request.method == "GET":

        return encounter.to_dict(
            include_details=True
        ), 200

    if request.method == "PATCH":

        data = request.get_json() or {}

        try:

            if "name" in data:
                encounter.name = data["name"]

            if "status" in data:
                encounter.status = data["status"]

            if "round_number" in data:
                encounter.round_number = data["round_number"]

            db.session.commit()

            return encounter.to_dict(), 200

        except ValueError as error:

            db.session.rollback()

            return {
                "error": str(error)
            }, 400

    if request.method == "DELETE":

        db.session.delete(encounter)

        db.session.commit()

        return {}, 204

@app.route(
    "/encounters/<int:encounter_id>/combatants",
    methods=["GET", "POST"]
)
def encounter_combatants(encounter_id):

    user_id = current_user_id()

    if not user_id:
        return {
            "error": "Not authorized."
        }, 401

    encounter = (
        Encounter.query
        .join(Campaign)
        .filter(
            Encounter.id == encounter_id,
            Campaign.user_id == user_id
        )
        .first()
    )

    if not encounter:
        return {
            "error": "Encounter not found."
        }, 404

    if request.method == "GET":

        return [
            combatant.to_dict()
            for combatant in encounter.combatants
        ], 200

    data = request.get_json() or {}

    try:

        combatant = Combatant(
            name=data.get("name"),
            combatant_type=data.get(
                "combatant_type",
                "pc"
            ),
            initiative=data.get(
                "initiative",
                10
            ),
            max_hp=data.get("max_hp"),
            current_hp=data.get(
                "current_hp",
                data.get("max_hp")
            ),
            armor_class=data.get("armor_class"),
            dnd_monster_index=data.get("dnd_monster_index"),
            notes=data.get("notes"),
            encounter_id=encounter.id
        )

        db.session.add(combatant)

        db.session.commit()

        return combatant.to_dict(), 201

    except ValueError as error:

        db.session.rollback()

        return {
            "error": str(error)
        }, 400

@app.route(
    "/combatants/<int:id>",
    methods=["GET", "PATCH", "DELETE"]
)
def combatant_by_id(id):

    user_id = current_user_id()

    if not user_id:
        return {
            "error": "Not authorized."
        }, 401

    combatant = (
        Combatant.query
        .join(Encounter)
        .join(Campaign)
        .filter(
            Combatant.id == id,
            Campaign.user_id == user_id
        )
        .first()
    )

    if not combatant:
        return {
            "error": "Combatant not found."
        }, 404

    if request.method == "GET":

        return combatant.to_dict(), 200

    if request.method == "PATCH":

        data = request.get_json() or {}

        try:

            if "name" in data:
                combatant.name = data["name"]

            if "combatant_type" in data:
                combatant.combatant_type = data["combatant_type"]

            if "initiative" in data:
                combatant.initiative = data["initiative"]

            if "max_hp" in data:
                combatant.max_hp = data["max_hp"]

            if "current_hp" in data:
                combatant.current_hp = data["current_hp"]

            if "armor_class" in data:
                combatant.armor_class = data["armor_class"]

            if "notes" in data:
                combatant.notes = data["notes"]

            db.session.commit()

            return combatant.to_dict(), 200

        except ValueError as error:

            db.session.rollback()

            return {
                "error": str(error)
            }, 400

    if request.method == "DELETE":

        db.session.delete(combatant)

        db.session.commit()

        return {}, 204

@app.route(
    "/campaigns/<int:campaign_id>/sessions",
    methods=["GET", "POST"]
)
def campaign_sessions(campaign_id):

    user_id = current_user_id()

    if not user_id:
        return {
            "error": "Not authorized."
        }, 401

    campaign = Campaign.query.filter_by(
        id=campaign_id,
        user_id=user_id
    ).first()

    if not campaign:
        return {
            "error": "Campaign not found."
        }, 404

    if request.method == "GET":

        return [
            game_session.to_dict()
            for game_session in campaign.sessions
        ], 200

    data = request.get_json() or {}

    scheduled_at = None

    if data.get("scheduled_at"):

        try:
            scheduled_at = datetime.fromisoformat(
                data["scheduled_at"]
            )

        except ValueError:

            return {
                "error": "Invalid scheduled date and time."
            }, 400

    try:

        game_session = GameSession(
            scheduled_at=scheduled_at,
            notes=data.get("notes"),
            campaign_id=campaign.id
        )

        db.session.add(game_session)

        db.session.commit()

        return game_session.to_dict(), 201

    except ValueError as error:

        db.session.rollback()

        return {
            "error": str(error)
        }, 400

@app.route(
    "/sessions/<int:id>",
    methods=["GET", "PATCH", "DELETE"]
)
def session_by_id(id):

    user_id = current_user_id()

    if not user_id:
        return {
            "error": "Not authorized."
        }, 401

    game_session = (
        GameSession.query
        .join(Campaign)
        .filter(
            GameSession.id == id,
            Campaign.user_id == user_id
        )
        .first()
    )

    if not game_session:
        return {
            "error": "Session not found."
        }, 404

    if request.method == "GET":

        return game_session.to_dict(), 200

    if request.method == "PATCH":

        data = request.get_json() or {}

        try:

            if "scheduled_at" in data:

                if not data["scheduled_at"]:
                    return {
                        "error": "Scheduled date and time is required."
                    }, 400

                game_session.scheduled_at = datetime.fromisoformat(
                    data["scheduled_at"]
                )

            if "status" in data:
                game_session.status = data["status"]

            if "notes" in data:
                game_session.notes = data["notes"]

            db.session.commit()

            return game_session.to_dict(), 200

        except ValueError as error:

            db.session.rollback()

            return {
                "error": str(error)
            }, 400

    if request.method == "DELETE":

        db.session.delete(game_session)

        db.session.commit()

        return {}, 204

@app.route("/dnd/<string:resource>", methods=["GET"])
def dnd_search(resource):
    allowed_resources = {
        "monsters",
        "spells",
        "equipment",
        "magic-items",
        "conditions",
        "classes",
        "races"
    }

    if resource not in allowed_resources:
        return {
            "error": "Invalid D&D resource."
        }, 400

    search = request.args.get("name", "").strip()

    try:
        response = requests.get(
            f"{DND_API_BASE}/{resource}",
            params={"name": search} if search else {},
            timeout=10
        )

        response.raise_for_status()

        return response.json(), 200

    except requests.RequestException:
        return {
            "error": "Unable to reach the D&D API."
        }, 502

@app.route("/dnd/<string:resource>/<string:index>", methods = ["GET"])
def dnd_details(resource, index):
    allowed_resources = {
        "monsters",
        "spells",
        "equipment",
        "magic-items",
        "conditions",
        "classes",
        "races"
    }

    if resource not in allowed_resources:
        return {"error": "Invalid D&D resource."}, 400

    try:
        response = requests.get(
            f"{DND_API_BASE}/{resource}/{index}", timeout=10
        )

        if response.status_code == 404:
            return {
                "error": "D&D resource not found."
            }, 404

        response.raise_for_status()

        return response.json(), 200

    except requests.RequestException:
        return {
            "error": "Unable to reach the D&D API."
        }, 502





if __name__ == "__main__":
    app.run(
        port=5555,
        debug=True
    )

    