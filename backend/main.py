from fastapi import FastAPI
from .routes import passenger, driver, bus, assistant
from backend.db.base import Base
from backend.db.session import engine
from dotenv import load_dotenv
import os

load_dotenv()
DEBUG = os.getenv("DEBUG", "True")

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

@app.get('/')
def index():
    return "hello world"
