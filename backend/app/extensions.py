"""Extensions module for Flask application to prevent circular imports."""
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

