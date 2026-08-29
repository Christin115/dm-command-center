import pytest

from server.app import app
from server.models import db, User, Campaign, Encounter, Combatant


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["SECRET_KEY"] = "test-secret-key"

    with app.app_context():
        db.drop_all()
        db.create_all()

        user = User(
            username="TestDM",
            email="testdm@example.com"
        )
        user.set_password("password123")

        db.session.add(user)
        db.session.commit()

        campaign = Campaign(
            title="Test Campaign",
            description="A campaign used for testing.",
            game_system="Dungeons & Dragons 5e",
            status="Active",
            user_id=user.id
        )

        db.session.add(campaign)
        db.session.commit()

        yield app.test_client()

        db.session.remove()
        db.drop_all()


def login(client):
    return client.post(
        "/login",
        json={
            "username": "TestDM",
            "password": "password123"
        }
    )


# -------------------------
# BASIC API TEST
# -------------------------

def test_home_route(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.get_json()["message"] == "DM Command Center API"


# -------------------------
# AUTHENTICATION TESTS
# -------------------------

def test_signup(client):
    response = client.post(
        "/signup",
        json={
            "username": "NewDM",
            "email": "newdm@example.com",
            "password": "password123"
        }
    )

    data = response.get_json()

    assert response.status_code == 201
    assert data["username"] == "NewDM"
    assert data["email"] == "newdm@example.com"
    assert "password_hash" not in data


def test_signup_missing_fields(client):
    response = client.post(
        "/signup",
        json={
            "username": "NewDM"
        }
    )

    assert response.status_code == 400
    assert "error" in response.get_json()


def test_signup_duplicate_user(client):
    response = client.post(
        "/signup",
        json={
            "username": "TestDM",
            "email": "another@example.com",
            "password": "password123"
        }
    )

    assert response.status_code == 422
    assert "error" in response.get_json()


def test_login(client):
    response = login(client)

    data = response.get_json()

    assert response.status_code == 200
    assert data["username"] == "TestDM"


def test_login_wrong_password(client):
    response = client.post(
        "/login",
        json={
            "username": "TestDM",
            "password": "wrongpassword"
        }
    )

    assert response.status_code == 401
    assert "error" in response.get_json()


def test_check_session(client):
    login(client)

    response = client.get("/check_session")

    data = response.get_json()

    assert response.status_code == 200
    assert data["username"] == "TestDM"


def test_check_session_without_login(client):
    response = client.get("/check_session")

    assert response.status_code == 401
    assert "error" in response.get_json()


def test_logout(client):
    login(client)

    response = client.delete("/logout")

    assert response.status_code == 204

    response = client.get("/check_session")

    assert response.status_code == 401


# -------------------------
# CAMPAIGN TESTS
# -------------------------

def test_get_campaigns(client):
    login(client)

    response = client.get("/campaigns")

    data = response.get_json()

    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]["title"] == "Test Campaign"


def test_get_campaigns_requires_login(client):
    response = client.get("/campaigns")

    assert response.status_code == 401


def test_create_campaign(client):
    login(client)

    response = client.post(
        "/campaigns",
        json={
            "title": "Dragon Hunt",
            "description": "Track down the ancient dragon.",
            "game_system": "Dungeons & Dragons 5e",
            "status": "Active"
        }
    )

    data = response.get_json()

    assert response.status_code == 201
    assert data["title"] == "Dragon Hunt"
    assert data["status"] == "Active"


def test_get_single_campaign(client):
    login(client)

    response = client.get("/campaigns/1")

    data = response.get_json()

    assert response.status_code == 200
    assert data["title"] == "Test Campaign"
    assert "tasks" in data
    assert "notes" in data


def test_update_campaign(client):
    login(client)

    response = client.patch(
        "/campaigns/1",
        json={
            "title": "Updated Campaign"
        }
    )

    data = response.get_json()

    assert response.status_code == 200
    assert data["title"] == "Updated Campaign"


def test_campaign_not_found(client):
    login(client)

    response = client.get("/campaigns/999")

    assert response.status_code == 404
    assert response.get_json()["error"] == "Campaign not found."


# -------------------------
# TASK CRUD TESTS
# -------------------------

def test_create_task(client):
    login(client)

    response = client.post(
        "/campaigns/1/tasks",
        json={
            "title": "Prepare goblin encounter",
            "description": "Create enemies and map.",
            "priority": "high",
            "status": "To Do"
        }
    )

    data = response.get_json()

    assert response.status_code == 201
    assert data["title"] == "Prepare goblin encounter"
    assert data["priority"] == "high"
    assert data["status"] == "To Do"


def test_get_campaign_tasks(client):
    login(client)

    client.post(
        "/campaigns/1/tasks",
        json={
            "title": "Prepare NPCs",
            "priority": "medium",
            "status": "To Do"
        }
    )

    response = client.get("/campaigns/1/tasks")

    data = response.get_json()

    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]["title"] == "Prepare NPCs"


def test_get_single_task(client):
    login(client)

    create_response = client.post(
        "/campaigns/1/tasks",
        json={
            "title": "Create dungeon map",
            "priority": "high",
            "status": "To Do"
        }
    )

    task_id = create_response.get_json()["id"]

    response = client.get(
        f"/tasks/{task_id}"
    )

    data = response.get_json()

    assert response.status_code == 200
    assert data["title"] == "Create dungeon map"


def test_update_task(client):
    login(client)

    create_response = client.post(
        "/campaigns/1/tasks",
        json={
            "title": "Prepare boss fight",
            "priority": "high",
            "status": "To Do"
        }
    )

    task_id = create_response.get_json()["id"]

    response = client.patch(
        f"/tasks/{task_id}",
        json={
            "status": "Done"
        }
    )

    data = response.get_json()

    assert response.status_code == 200
    assert data["status"] == "Done"


def test_delete_task(client):
    login(client)

    create_response = client.post(
        "/campaigns/1/tasks",
        json={
            "title": "Temporary task",
            "priority": "low",
            "status": "To Do"
        }
    )

    task_id = create_response.get_json()["id"]

    response = client.delete(
        f"/tasks/{task_id}"
    )

    assert response.status_code == 204

    second_response = client.get(
        f"/tasks/{task_id}"
    )

    assert second_response.status_code == 404


def test_invalid_task_priority(client):
    login(client)

    response = client.post(
        "/campaigns/1/tasks",
        json={
            "title": "Invalid task",
            "priority": "Super Important",
            "status": "To Do"
        }
    )

    assert response.status_code == 400
    assert "error" in response.get_json()


# -------------------------
# NOTE CRUD TESTS
# -------------------------

def test_create_note(client):
    login(client)

    response = client.post(
        "/campaigns/1/notes",
        json={
            "title": "Mysterious Merchant",
            "content": "The merchant knows about the cursed artifact.",
            "category": "NPC"
        }
    )

    data = response.get_json()

    assert response.status_code == 201
    assert data["title"] == "Mysterious Merchant"
    assert data["category"] == "NPC"


def test_get_campaign_notes(client):
    login(client)

    client.post(
        "/campaigns/1/notes",
        json={
            "title": "Ancient Castle",
            "content": "The castle sits north of the village.",
            "category": "Location"
        }
    )

    response = client.get(
        "/campaigns/1/notes"
    )

    data = response.get_json()

    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]["title"] == "Ancient Castle"


def test_get_single_note(client):
    login(client)

    create_response = client.post(
        "/campaigns/1/notes",
        json={
            "title": "Hidden Temple",
            "content": "A temple hidden beneath the forest.",
            "category": "Location"
        }
    )

    note_id = create_response.get_json()["id"]

    response = client.get(
        f"/notes/{note_id}"
    )

    data = response.get_json()

    assert response.status_code == 200
    assert data["title"] == "Hidden Temple"


def test_update_note(client):
    login(client)

    create_response = client.post(
        "/campaigns/1/notes",
        json={
            "title": "Strange Artifact",
            "content": "The artifact glows at night.",
            "category": "Lore"
        }
    )

    note_id = create_response.get_json()["id"]

    response = client.patch(
        f"/notes/{note_id}",
        json={
            "category": "Plot Hook"
        }
    )

    data = response.get_json()

    assert response.status_code == 200
    assert data["category"] == "Plot Hook"


def test_delete_note(client):
    login(client)

    create_response = client.post(
        "/campaigns/1/notes",
        json={
            "title": "Temporary Note",
            "content": "Delete this later.",
            "category": "Other"
        }
    )

    note_id = create_response.get_json()["id"]

    response = client.delete(
        f"/notes/{note_id}"
    )

    assert response.status_code == 204

    second_response = client.get(
        f"/notes/{note_id}"
    )

    assert second_response.status_code == 404


def test_empty_note_content(client):
    login(client)

    response = client.post(
        "/campaigns/1/notes",
        json={
            "title": "Empty Note",
            "content": "",
            "category": "Other"
        }
    )

    assert response.status_code == 400
    assert "error" in response.get_json()


# -------------------------
# ENCOUNTER CRUD TESTS
# -------------------------

def test_create_encounter(client):
    login(client)

    response = client.post(
        "/campaigns/1/encounters",
        json={
            "name": "Goblin Ambush"
        }
    )

    data = response.get_json()

    assert response.status_code == 201
    assert data["name"] == "Goblin Ambush"
    assert data["status"] == "Preparing"
    assert data["round_number"] == 1


def test_get_campaign_encounters(client):
    login(client)

    client.post(
        "/campaigns/1/encounters",
        json={
            "name": "Bandit Ambush"
        }
    )

    response = client.get("/campaigns/1/encounters")

    data = response.get_json()

    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]["name"] == "Bandit Ambush"


def test_get_single_encounter_includes_combatants(client):
    login(client)

    create_response = client.post(
        "/campaigns/1/encounters",
        json={
            "name": "Dragon's Lair"
        }
    )

    encounter_id = create_response.get_json()["id"]

    response = client.get(f"/encounters/{encounter_id}")

    data = response.get_json()

    assert response.status_code == 200
    assert data["name"] == "Dragon's Lair"
    assert "combatants" in data


def test_update_encounter(client):
    login(client)

    create_response = client.post(
        "/campaigns/1/encounters",
        json={
            "name": "Cave Skirmish"
        }
    )

    encounter_id = create_response.get_json()["id"]

    response = client.patch(
        f"/encounters/{encounter_id}",
        json={
            "status": "Active",
            "round_number": 2
        }
    )

    data = response.get_json()

    assert response.status_code == 200
    assert data["status"] == "Active"
    assert data["round_number"] == 2


def test_delete_encounter(client):
    login(client)

    create_response = client.post(
        "/campaigns/1/encounters",
        json={
            "name": "Temporary Encounter"
        }
    )

    encounter_id = create_response.get_json()["id"]

    combatant_response = client.post(
        f"/encounters/{encounter_id}/combatants",
        json={
            "name": "Goblin",
            "max_hp": 7,
            "armor_class": 15
        }
    )

    combatant_id = combatant_response.get_json()["id"]

    response = client.delete(f"/encounters/{encounter_id}")

    assert response.status_code == 204

    second_response = client.get(f"/combatants/{combatant_id}")

    assert second_response.status_code == 404


def test_invalid_encounter_status(client):
    login(client)

    create_response = client.post(
        "/campaigns/1/encounters",
        json={
            "name": "Invalid Status Encounter"
        }
    )

    encounter_id = create_response.get_json()["id"]

    response = client.patch(
        f"/encounters/{encounter_id}",
        json={
            "status": "Not A Real Status"
        }
    )

    assert response.status_code == 400
    assert "error" in response.get_json()


# -------------------------
# COMBATANT CRUD TESTS
# -------------------------

def create_encounter(client):
    response = client.post(
        "/campaigns/1/encounters",
        json={
            "name": "Test Encounter"
        }
    )

    return response.get_json()["id"]


def test_create_combatant(client):
    login(client)

    encounter_id = create_encounter(client)

    response = client.post(
        f"/encounters/{encounter_id}/combatants",
        json={
            "name": "Goblin Scout",
            "combatant_type": "monster",
            "initiative": 14,
            "max_hp": 7,
            "armor_class": 15
        }
    )

    data = response.get_json()

    assert response.status_code == 201
    assert data["name"] == "Goblin Scout"
    assert data["current_hp"] == 7


def test_get_encounter_combatants(client):
    login(client)

    encounter_id = create_encounter(client)

    client.post(
        f"/encounters/{encounter_id}/combatants",
        json={
            "name": "Low Initiative",
            "initiative": 5,
            "max_hp": 10,
            "armor_class": 12
        }
    )

    client.post(
        f"/encounters/{encounter_id}/combatants",
        json={
            "name": "High Initiative",
            "initiative": 18,
            "max_hp": 10,
            "armor_class": 12
        }
    )

    response = client.get(f"/encounters/{encounter_id}/combatants")

    data = response.get_json()

    assert response.status_code == 200
    assert len(data) == 2
    assert data[0]["name"] == "High Initiative"
    assert data[1]["name"] == "Low Initiative"


def test_get_single_combatant(client):
    login(client)

    encounter_id = create_encounter(client)

    create_response = client.post(
        f"/encounters/{encounter_id}/combatants",
        json={
            "name": "Skeleton",
            "max_hp": 13,
            "armor_class": 13
        }
    )

    combatant_id = create_response.get_json()["id"]

    response = client.get(f"/combatants/{combatant_id}")

    data = response.get_json()

    assert response.status_code == 200
    assert data["name"] == "Skeleton"


def test_update_combatant_hp(client):
    login(client)

    encounter_id = create_encounter(client)

    create_response = client.post(
        f"/encounters/{encounter_id}/combatants",
        json={
            "name": "Orc",
            "max_hp": 15,
            "armor_class": 13
        }
    )

    combatant_id = create_response.get_json()["id"]

    response = client.patch(
        f"/combatants/{combatant_id}",
        json={
            "current_hp": 6
        }
    )

    data = response.get_json()

    assert response.status_code == 200
    assert data["current_hp"] == 6


def test_delete_combatant(client):
    login(client)

    encounter_id = create_encounter(client)

    create_response = client.post(
        f"/encounters/{encounter_id}/combatants",
        json={
            "name": "Temporary Combatant",
            "max_hp": 10,
            "armor_class": 10
        }
    )

    combatant_id = create_response.get_json()["id"]

    response = client.delete(f"/combatants/{combatant_id}")

    assert response.status_code == 204

    second_response = client.get(f"/combatants/{combatant_id}")

    assert second_response.status_code == 404


def test_invalid_combatant_type(client):
    login(client)

    encounter_id = create_encounter(client)

    response = client.post(
        f"/encounters/{encounter_id}/combatants",
        json={
            "name": "Mystery Creature",
            "combatant_type": "villain",
            "max_hp": 10,
            "armor_class": 10
        }
    )

    assert response.status_code == 400
    assert "error" in response.get_json()


def test_negative_max_hp(client):
    login(client)

    encounter_id = create_encounter(client)

    response = client.post(
        f"/encounters/{encounter_id}/combatants",
        json={
            "name": "Broken Combatant",
            "max_hp": -5,
            "armor_class": 10
        }
    )

    assert response.status_code == 400
    assert "error" in response.get_json()


# -------------------------
# SECURITY TEST
# -------------------------

def test_user_cannot_access_another_users_campaign(client):
    with app.app_context():
        second_user = User(
            username="SecondDM",
            email="second@example.com"
        )

        second_user.set_password(
            "password123"
        )

        db.session.add(second_user)
        db.session.commit()

        second_campaign = Campaign(
            title="Private Campaign",
            user_id=second_user.id
        )

        db.session.add(second_campaign)
        db.session.commit()

        second_campaign_id = second_campaign.id

    login(client)

    response = client.get(
        f"/campaigns/{second_campaign_id}"
    )

    assert response.status_code == 404


def test_user_cannot_access_another_users_encounter(client):
    with app.app_context():
        second_user = User(
            username="ThirdDM",
            email="third@example.com"
        )

        second_user.set_password(
            "password123"
        )

        db.session.add(second_user)
        db.session.commit()

        second_campaign = Campaign(
            title="Hidden Campaign",
            user_id=second_user.id
        )

        db.session.add(second_campaign)
        db.session.commit()

        second_encounter = Encounter(
            name="Hidden Encounter",
            campaign_id=second_campaign.id
        )

        db.session.add(second_encounter)
        db.session.commit()

        second_encounter_id = second_encounter.id

    login(client)

    response = client.get(
        f"/encounters/{second_encounter_id}"
    )

    assert response.status_code == 404


def test_user_cannot_access_another_users_combatant(client):
    with app.app_context():
        second_user = User(
            username="FourthDM",
            email="fourth@example.com"
        )

        second_user.set_password(
            "password123"
        )

        db.session.add(second_user)
        db.session.commit()

        second_campaign = Campaign(
            title="Guarded Campaign",
            user_id=second_user.id
        )

        db.session.add(second_campaign)
        db.session.commit()

        second_encounter = Encounter(
            name="Guarded Encounter",
            campaign_id=second_campaign.id
        )

        db.session.add(second_encounter)
        db.session.commit()

        second_combatant = Combatant(
            name="Guarded Combatant",
            max_hp=10,
            current_hp=10,
            armor_class=10,
            encounter_id=second_encounter.id
        )

        db.session.add(second_combatant)
        db.session.commit()

        second_combatant_id = second_combatant.id

    login(client)

    response = client.get(
        f"/combatants/{second_combatant_id}"
    )

    assert response.status_code == 404