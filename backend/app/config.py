import os
from pathlib import Path
from dotenv import load_dotenv

# Base backend directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file from root or backend
env_path = BASE_DIR.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv(BASE_DIR / '.env')


class Config:
    """Application configuration settings."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-healthcare-secret-key-btech-2026')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-key-btech-2026')
    JWT_ACCESS_TOKEN_EXPIRES_HOURS = 24

    # Database
    db_env = os.getenv('DATABASE_URL')
    if db_env:
        SQLALCHEMY_DATABASE_URI = db_env
    else:
        # SQLite database in backend directory
        db_file = BASE_DIR / 'healthcare.db'
        SQLALCHEMY_DATABASE_URI = f'sqlite:///{db_file}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Uploads
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', str(BASE_DIR / 'uploads'))
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH_MB', 16)) * 1024 * 1024  # 16 MB

    # Supported file extensions
    ALLOWED_REPORT_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'txt'}
    ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}

    # AI Service Configuration
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '').strip()
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')

    # OCR binary path (for Windows if tesseract is in custom directory)
    TESSERACT_CMD = os.getenv('TESSERACT_CMD', '')
