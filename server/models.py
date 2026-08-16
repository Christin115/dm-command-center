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
    status = db.Column(db.String(20), nullable=False, default='active')  # e.g., active, completed, on-hold
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', back_populates='campaigns')
    tasks = db.relationship('Task', back_populates='campaign', cascade='all, delete-orphan')
    notes = db.relationship('Note', back_populates='campaign', cascade='all, delete-orphan')
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
        allowed =  ['low', 'medium', 'high']
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