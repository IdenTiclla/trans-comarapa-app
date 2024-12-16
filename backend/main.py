from fastapi import FastAPI
from .routes import passenger, driver, bus
from backend.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bus Ticketing Application",
    description="API for managing bus tickets, packages, trips, and more.",
    version="1.0.0",
)

app.include_router(passenger.router)
app.include_router(driver.router)
app.include_router(bus.router)

@app.get('/')
def index():
    return "hello world"
