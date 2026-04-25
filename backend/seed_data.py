"""Seed the database with sample HCPs, Materials, and Samples."""

from database import SessionLocal, engine, Base
from models import HCP, Material, Sample


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(HCP).count() == 0:
        hcps = [
            HCP(name="Dr. Sarah Smith", specialty="Cardiology", hospital="City General Hospital", email="s.smith@hospital.com", phone="555-0101"),
            HCP(name="Dr. James Chen", specialty="Oncology", hospital="University Medical Center", email="j.chen@umc.edu", phone="555-0102"),
            HCP(name="Dr. Emily Rodriguez", specialty="Neurology", hospital="St. Mary's Hospital", email="e.rodriguez@stmarys.com", phone="555-0103"),
            HCP(name="Dr. Michael Johnson", specialty="Endocrinology", hospital="Regional Health Center", email="m.johnson@rhc.org", phone="555-0104"),
            HCP(name="Dr. Priya Patel", specialty="Pulmonology", hospital="Metro Hospital", email="p.patel@metro.com", phone="555-0105"),
            HCP(name="Dr. Robert Kim", specialty="Rheumatology", hospital="Pacific Medical Group", email="r.kim@pmg.com", phone="555-0106"),
            HCP(name="Dr. Lisa Wang", specialty="Dermatology", hospital="Skin Care Clinic", email="l.wang@skincare.com", phone="555-0107"),
            HCP(name="Dr. David Brown", specialty="Gastroenterology", hospital="Digestive Health Center", email="d.brown@dhc.com", phone="555-0108"),
        ]
        db.add_all(hcps)

    if db.query(Material).count() == 0:
        materials = [
            Material(name="Product X Efficacy Brochure", type="Brochure"),
            Material(name="Product X Clinical Trial Results", type="Study"),
            Material(name="Product Y Patient Guide", type="Guide"),
            Material(name="Dosing Guidelines Card", type="Reference Card"),
            Material(name="Safety Profile Summary", type="Summary"),
            Material(name="Comparative Study Report", type="Study"),
            Material(name="Patient Savings Card", type="Card"),
            Material(name="Mechanism of Action Poster", type="Poster"),
        ]
        db.add_all(materials)

    if db.query(Sample).count() == 0:
        samples = [
            Sample(name="Product X 10mg (7-day)", product="Product X"),
            Sample(name="Product X 25mg (7-day)", product="Product X"),
            Sample(name="Product X 50mg (14-day)", product="Product X"),
            Sample(name="Product Y 100mg (7-day)", product="Product Y"),
            Sample(name="Product Y 200mg (14-day)", product="Product Y"),
            Sample(name="Product Z Topical 30g", product="Product Z"),
        ]
        db.add_all(samples)

    db.commit()
    db.close()
    print("Database seeded successfully.")


if __name__ == "__main__":
    seed()
