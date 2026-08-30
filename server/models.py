from datetime import datetime

from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy.orm import validates

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    campaigns= db.relationship('Campaign', back_populates='user', cascade='all, delete-orphan')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # tasks = db.relationship('Task', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Campaign(db.Model):
    __tablename__ = 'campaigns'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    game_system = db.Column(db.String(50), nullable=True, default='Dungeons & Dragons 5e')
    status = db.Column(db.String(20), nullable=False, default='Active')  # e.g., Active, Completed, On Hold
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', back_populates='campaigns')
    tasks = db.relationship('Task', back_populates='campaign', cascade='all, delete-orphan')
    notes = db.relationship('Note', back_populates='campaign', cascade='all, delete-orphan')
    encounters = db.relationship('Encounter', back_populates='campaign', cascade='all, delete-orphan')
    sessions = db.relationship(
        'GameSession',
        back_populates='campaign',
        cascade='all, delete-orphan',
        order_by='GameSession.scheduled_at'
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @validates('title')
    def validate_title(self, key, value):
        if not value or len(value.strip()) < 2:
            raise ValueError("Title must be at least 2 characters long.")
        return value.strip()

    def to_dict(self, include_details=False):

        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'game_system': self.game_system,
            'status': self.status,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
            if self.updated_at else None
        }

        if include_details:
            data['tasks'] = [task.to_dict() for task in self.tasks]
            data['notes'] = [note.to_dict() for note in self.notes]
            data['encounters'] = [encounter.to_dict() for encounter in self.encounters]
            data['sessions'] = [game_session.to_dict() for game_session in self.sessions]

        return data

class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(20), nullable=True)  # e.g., low, medium, high
    status = db.Column(db.String(20), nullable=False, default='To Do')
    due_date = db.Column(db.DateTime, nullable=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    campaign = db.relationship('Campaign', back_populates='tasks')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @validates('title')
    def validate_title(self, key, value):
        if not value or len(value.strip()) < 2:
            raise ValueError("Title must be at least 2 characters long.")
        return value.strip()

    @validates('priority')
    def validate_priority(self, key, value):
        allowed = ['low', 'medium', 'high']
        if value not in allowed:
            raise ValueError("Priority must be one of: low, medium, high")
        return value

    @validates('status')
    def validate_status(self, key, value):
        allowed = ['To Do', 'In Progress', 'Done']
        if value not in allowed:
            raise ValueError("Status must be one of: To Do, In Progress, Done")
        return value
    
    def to_dict(self):

        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "priority": self.priority,
            "status": self.status,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "campaign_id": self.campaign_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
            if self.updated_at else None
        }

class Note(db.Model):
    __tablename__ = 'notes'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    campaign = db.relationship('Campaign', back_populates='notes')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @validates('title')
    def validate_title(self, key, value):
        if not value or len(value.strip()) < 2:
            raise ValueError("Title must be at least 2 characters long.")
        return value.strip()

    @validates('content')
    def validate_content(self, key, value):
        if not value or len(value.strip()) < 5:
            raise ValueError("Content must be at least 5 characters long.")
        return value.strip()
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "category": self.category,
            "campaign_id": self.campaign_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
            if self.updated_at else None
        }

class Encounter(db.Model):
    __tablename__ = 'encounters'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Preparing')
    round_number = db.Column(db.Integer, nullable=False, default=1)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    campaign = db.relationship('Campaign', back_populates='encounters')
    combatants = db.relationship(
        'Combatant',
        back_populates='encounter',
        cascade='all, delete-orphan',
        order_by='Combatant.initiative.desc()'
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @validates('name')
    def validate_name(self, key, value):
        if not value or len(value.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long.")
        return value.strip()

    @validates('status')
    def validate_status(self, key, value):
        allowed = ['Preparing', 'Active', 'Completed']
        if value not in allowed:
            raise ValueError("Status must be one of: Preparing, Active, Completed")
        return value

    @validates('round_number')
    def validate_round_number(self, key, value):
        if value is None or value < 1:
            raise ValueError("Round number must be at least 1.")
        return value

    def to_dict(self, include_details=False):

        data = {
            "id": self.id,
            "name": self.name,
            "status": self.status,
            "round_number": self.round_number,
            "campaign_id": self.campaign_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
            if self.updated_at else None
        }

        if include_details:
            data['combatants'] = [combatant.to_dict() for combatant in self.combatants]

        return data

class Combatant(db.Model):
    __tablename__ = 'combatants'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    combatant_type = db.Column(db.String(20), nullable=False, default='pc')
    initiative = db.Column(db.Integer, nullable=False, default=10)
    max_hp = db.Column(db.Integer, nullable=False)
    current_hp = db.Column(db.Integer, nullable=False)
    armor_class = db.Column(db.Integer, nullable=False)
    dnd_monster_index = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    encounter_id = db.Column(db.Integer, db.ForeignKey('encounters.id'), nullable=False)
    encounter = db.relationship('Encounter', back_populates='combatants')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @validates('name')
    def validate_name(self, key, value):
        if not value or len(value.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long.")
        return value.strip()

    @validates('combatant_type')
    def validate_combatant_type(self, key, value):
        allowed = ['pc', 'npc', 'monster']
        if value not in allowed:
            raise ValueError("Combatant type must be one of: pc, npc, monster")
        return value

    @validates('initiative')
    def validate_initiative(self, key, value):
        if value is None or value < -10 or value > 50:
            raise ValueError("Initiative must be between -10 and 50.")
        return value

    @validates('max_hp')
    def validate_max_hp(self, key, value):
        if value is None or value <= 0:
            raise ValueError("Max HP must be greater than 0.")
        return value

    @validates('current_hp')
    def validate_current_hp(self, key, value):
        if value is None or value < 0:
            raise ValueError("Current HP must be 0 or greater.")
        return value

    @validates('armor_class')
    def validate_armor_class(self, key, value):
        if value is None or value < 0:
            raise ValueError("Armor class must be 0 or greater.")
        return value

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "combatant_type": self.combatant_type,
            "initiative": self.initiative,
            "max_hp": self.max_hp,
            "current_hp": self.current_hp,
            "armor_class": self.armor_class,
            "dnd_monster_index": self.dnd_monster_index,
            "notes": self.notes,
            "encounter_id": self.encounter_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
            if self.updated_at else None
        }

class GameSession(db.Model):
    __tablename__ = 'game_sessions'

    id = db.Column(db.Integer, primary_key=True)
    scheduled_at = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Scheduled')
    notes = db.Column(db.Text, nullable=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    campaign = db.relationship('Campaign', back_populates='sessions')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @validates('scheduled_at')
    def validate_scheduled_at(self, key, value):
        if not value:
            raise ValueError("Scheduled date and time is required.")
        return value

    @validates('status')
    def validate_status(self, key, value):
        allowed = ['Scheduled', 'Completed', 'Cancelled']
        if value not in allowed:
            raise ValueError("Status must be one of: Scheduled, Completed, Cancelled")
        return value

    def to_dict(self):
        return {
            "id": self.id,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "status": self.status,
            "notes": self.notes,
            "campaign_id": self.campaign_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
            if self.updated_at else None
        }