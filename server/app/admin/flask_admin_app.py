from flask import Flask
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from app.database import SessionLocal, engine
from app.core.config import settings
from app.database.models import User, Service, Doctor, DoctorSchedule, Booking


class HealthPlusModelView(ModelView):
    can_view_details = True
    page_size = 20

    def __init__(self, model, session, **kwargs):
        super().__init__(model, session, **kwargs)


class UserModelView(HealthPlusModelView):
    column_list = ["id", "email", "full_name", "phone", "role", "is_active", "created_at"]
    column_searchable_list = ["email", "full_name", "phone"]
    column_filters = ["role", "is_active"]
    form_excluded_columns = ["hashed_password", "doctor_profile", "bookings"]


class ServiceModelView(HealthPlusModelView):
    column_list = ["id", "name", "duration", "price", "icon", "is_active", "created_at"]
    column_searchable_list = ["name", "description"]
    column_filters = ["is_active", "duration"]


class DoctorModelView(HealthPlusModelView):
    column_list = ["id", "full_name", "specialty", "consultation_fee", "rating", "experience_years", "is_active"]
    column_searchable_list = ["full_name", "specialty", "location"]
    column_filters = ["specialty", "is_active", "rating"]


class DoctorScheduleModelView(HealthPlusModelView):
    column_list = ["id", "doctor_id", "day_of_week", "start_time", "end_time", "break_start", "break_end", "is_active"]
    column_filters = ["day_of_week", "is_active"]


class BookingModelView(HealthPlusModelView):
    column_list = ["id", "booking_reference", "user_id", "doctor_id", "service_id", "start_time", "end_time", "status", "total_price"]
    column_searchable_list = ["booking_reference"]
    column_filters = ["status", "start_time", "doctor_id"]


def create_flask_admin_app() -> Flask:
    flask_app = Flask(__name__)
    flask_app.config["SECRET_KEY"] = settings.SECRET_KEY

    # Use scoped session for Flask-Admin
    session = SessionLocal()

    admin = Admin(
        flask_app,
        name="HealthPlus Database Admin",
        url="/"
    )

    admin.add_view(UserModelView(User, session, name="Users", endpoint="admin_users"))
    admin.add_view(ServiceModelView(Service, session, name="Services", endpoint="admin_services"))
    admin.add_view(DoctorModelView(Doctor, session, name="Doctors", endpoint="admin_doctors"))
    admin.add_view(DoctorScheduleModelView(DoctorSchedule, session, name="Schedules", endpoint="admin_schedules"))
    admin.add_view(BookingModelView(Booking, session, name="Bookings", endpoint="admin_bookings"))

    return flask_app
