from datetime import datetime

from server.app import app
from server.models import (
    db,
    User,
    Campaign,
    Task,
    Note
)


with app.app_context():

    print("Deleting existing data...")

    Note.query.delete()
    Task.query.delete()
    Campaign.query.delete()
    User.query.delete()

    print("Creating user...")

    user = User(
        username="DungeonMaster",
        email="dm@example.com"
    )

    user.set_password("password123")

    db.session.add(user)
    db.session.commit()

    print("Creating campaign...")

    campaign = Campaign(
        title="Curse of the Forgotten King",
        description="A dark fantasy campaign.",
        game_system="Dungeons & Dragons 5e",
        status="Active",
        user_id=user.id
    )

    db.session.add(campaign)
    db.session.commit()

    print("Creating tasks...")

    task1 = Task(
        title="Prepare tavern encounter",
        description="Create NPCs and rumors.",
        priority="high",
        status="To Do",
        campaign_id=campaign.id
    )

    task2 = Task(
        title="Choose treasure rewards",
        description="Prepare rewards for the dungeon.",
        priority="medium",
        status="In Progress",
        campaign_id=campaign.id
    )

    db.session.add_all([
        task1,
        task2
    ])

    print("Creating notes...")

    note1 = Note(
        title="Captain Elira",
        content=(
            "Captain Elira works secretly "
            "for the royal council."
        ),
        category="NPC",
        campaign_id=campaign.id
    )

    note2 = Note(
        title="Session One",
        content=(
            "The party discovered the abandoned tower."
        ),
        category="Session Summary",
        campaign_id=campaign.id
    )

    db.session.add_all([
        note1,
        note2
    ])

    db.session.commit()

    print("Database seeded successfully.")