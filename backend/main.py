from fastapi import FastAPI
from routes import passenger, driver, bus, assistant, trip, location, route  # import route router
from db.base import Base
from db.session import engine
from dotenv import load_dotenv
import os

# Import all models to ensure they are registered with SQLAlchemy
from models.passenger import Passenger
from models.driver import Driver
from models.bus import Bus
from models.assistant import Assistant
from models.trip import Trip
from models.route import Route
from models.location import Location

load_dotenv()
DEBUG = os.getenv("DEBUG", "True")

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bus Ticketing Application",
    description="API for managing bus tickets, packages, trips, and more.",
    version="1.0.0",
    debug=DEBUG
)

app.include_router(passenger.router)
app.include_router(driver.router)
app.include_router(bus.router)
app.include_router(assistant.router)
app.include_router(trip.router)
app.include_router(location.router)
app.include_router(route.router)  # include route routes

@app.get('/')
def index():
    return "hello world"
