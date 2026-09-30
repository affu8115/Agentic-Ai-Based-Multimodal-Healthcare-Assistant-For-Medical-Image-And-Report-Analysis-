import os
from app import create_app, db
from app.utils.seed_data import seed_database

app = create_app()

with app.app_context():
    # Automatically create database schema and seed demonstration data
    db.create_all()
    seed_database()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"================================================================")
    print(f" Healthcare Multimodal Assistant Backend Running on http://127.0.0.1:{port}")
    print(f" Demo Accounts:")
    print(f"   - Admin:   admin@healthcare.local / Admin@123")
    print(f"   - Doctor:  dr.smith@healthcare.local / Doctor@123")
    print(f"   - Patient: patient.john@healthcare.local / Patient@123")
    print(f"================================================================")
    app.run(host='0.0.0.0', port=port, debug=True)

