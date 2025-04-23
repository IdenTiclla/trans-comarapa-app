from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, cast, Date
from typing import List, Optional
from datetime import datetime, timedelta, date
from db.session import get_db
from models.ticket import Ticket as TicketModel
from models.package import Package as PackageModel
from models.trip import Trip as TripModel
from models.client import Client as ClientModel
from models.route import Route as RouteModel
from models.bus import Bus as BusModel
from pydantic import BaseModel

router = APIRouter(
    tags=["Statistics"]
)

# Esquemas para las respuestas
class TicketStats(BaseModel):
    count: int
    amount: float
    trend: float
    period: str

class PackageStats(BaseModel):
    count: int
    trend: float
    period: str

class TripStats(BaseModel):
    count: int
    trend: float
    period: str

class DashboardStats(BaseModel):
    tickets: TicketStats
    packages: PackageStats
    trips: TripStats

# Función auxiliar para obtener el rango de fechas según el período
def get_date_range(period: str):
    today = datetime.now().date()
    
    if period == "today":
        start_date = today
        end_date = today
        previous_start_date = today - timedelta(days=1)
        previous_end_date = today - timedelta(days=1)
    elif period == "yesterday":
        start_date = today - timedelta(days=1)
        end_date = today - timedelta(days=1)
        previous_start_date = today - timedelta(days=2)
        previous_end_date = today - timedelta(days=2)
    elif period == "week":
        # Semana actual (desde el lunes hasta hoy)
        weekday = today.weekday()
        start_date = today - timedelta(days=weekday)
        end_date = today
        # Semana anterior (mismo número de días)
        days_in_current_period = (end_date - start_date).days + 1
        previous_end_date = start_date - timedelta(days=1)
        previous_start_date = previous_end_date - timedelta(days=days_in_current_period - 1)
    elif period == "month":
        # Mes actual (desde el día 1 hasta hoy)
        start_date = today.replace(day=1)
        end_date = today
        # Mes anterior (mismo número de días)
        days_in_current_period = (end_date - start_date).days + 1
        previous_end_date = start_date - timedelta(days=1)
        previous_start_date = previous_end_date - timedelta(days=days_in_current_period - 1)
    elif period == "year":
        # Año actual (desde el 1 de enero hasta hoy)
        start_date = today.replace(month=1, day=1)
        end_date = today
        # Año anterior (mismo número de días)
        days_in_current_period = (end_date - start_date).days + 1
        previous_end_date = start_date - timedelta(days=1)
        previous_start_date = previous_end_date - timedelta(days=days_in_current_period - 1)
    else:
        # Por defecto, usar el día de hoy
        start_date = today
        end_date = today
        previous_start_date = today - timedelta(days=1)
        previous_end_date = today - timedelta(days=1)
    
    return start_date, end_date, previous_start_date, previous_end_date

# Función para calcular la tendencia
def calculate_trend(current_value, previous_value):
    if previous_value == 0:
        return 100 if current_value > 0 else 0
    
    return ((current_value - previous_value) / previous_value) * 100

@router.get("/tickets/stats", response_model=TicketStats)
async def get_ticket_stats(
    period: str = Query("today", description="Período para las estadísticas: today, yesterday, week, month, year"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas de boletos para un período específico
    
    - **period**: Período para las estadísticas (today, yesterday, week, month, year)
    
    Retorna:
    - **count**: Número de boletos vendidos en el período
    - **amount**: Monto total de ventas de boletos en el período
    - **trend**: Tendencia respecto al período anterior (porcentaje)
    - **period**: Período de las estadísticas
    """
    # Obtener el rango de fechas
    start_date, end_date, previous_start_date, previous_end_date = get_date_range(period)
    
    # Consultar boletos del período actual
    current_tickets = db.query(
        func.count(TicketModel.id).label("count"),
        func.coalesce(func.sum(RouteModel.price), 0).label("amount")
    ).join(
        TripModel, TicketModel.trip_id == TripModel.id
    ).join(
        RouteModel, TripModel.route_id == RouteModel.id
    ).filter(
        cast(TicketModel.created_at, Date) >= start_date,
        cast(TicketModel.created_at, Date) <= end_date,
        TicketModel.state != 'cancelled'  # Excluir boletos cancelados
    ).first()
    
    # Consultar boletos del período anterior
    previous_tickets = db.query(
        func.count(TicketModel.id).label("count"),
        func.coalesce(func.sum(RouteModel.price), 0).label("amount")
    ).join(
        TripModel, TicketModel.trip_id == TripModel.id
    ).join(
        RouteModel, TripModel.route_id == RouteModel.id
    ).filter(
        cast(TicketModel.created_at, Date) >= previous_start_date,
        cast(TicketModel.created_at, Date) <= previous_end_date,
        TicketModel.state != 'cancelled'  # Excluir boletos cancelados
    ).first()
    
    # Calcular tendencias
    count_trend = calculate_trend(current_tickets.count, previous_tickets.count)
    amount_trend = calculate_trend(current_tickets.amount, previous_tickets.amount)
    
    # Usar la tendencia del monto como tendencia general
    trend = amount_trend
    
    return {
        "count": current_tickets.count,
        "amount": float(current_tickets.amount),
        "trend": round(trend, 2),
        "period": period
    }

@router.get("/packages/stats", response_model=PackageStats)
async def get_package_stats(
    period: str = Query("today", description="Período para las estadísticas: today, yesterday, week, month, year"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas de paquetes para un período específico
    
    - **period**: Período para las estadísticas (today, yesterday, week, month, year)
    
    Retorna:
    - **count**: Número de paquetes registrados en el período
    - **trend**: Tendencia respecto al período anterior (porcentaje)
    - **period**: Período de las estadísticas
    """
    # Obtener el rango de fechas
    start_date, end_date, previous_start_date, previous_end_date = get_date_range(period)
    
    # Consultar paquetes del período actual
    current_packages = db.query(
        func.count(PackageModel.id).label("count")
    ).filter(
        cast(PackageModel.created_at, Date) >= start_date,
        cast(PackageModel.created_at, Date) <= end_date
    ).first()
    
    # Consultar paquetes del período anterior
    previous_packages = db.query(
        func.count(PackageModel.id).label("count")
    ).filter(
        cast(PackageModel.created_at, Date) >= previous_start_date,
        cast(PackageModel.created_at, Date) <= previous_end_date
    ).first()
    
    # Calcular tendencia
    trend = calculate_trend(current_packages.count, previous_packages.count)
    
    return {
        "count": current_packages.count,
        "trend": round(trend, 2),
        "period": period
    }

@router.get("/trips/stats", response_model=TripStats)
async def get_trip_stats(
    period: str = Query("today", description="Período para las estadísticas: today, yesterday, week, month, year"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas de viajes para un período específico
    
    - **period**: Período para las estadísticas (today, yesterday, week, month, year)
    
    Retorna:
    - **count**: Número de viajes programados en el período
    - **trend**: Tendencia respecto al período anterior (porcentaje)
    - **period**: Período de las estadísticas
    """
    # Obtener el rango de fechas
    start_date, end_date, previous_start_date, previous_end_date = get_date_range(period)
    
    # Consultar viajes del período actual
    current_trips = db.query(
        func.count(TripModel.id).label("count")
    ).filter(
        cast(TripModel.trip_datetime, Date) >= start_date,
        cast(TripModel.trip_datetime, Date) <= end_date
    ).first()
    
    # Consultar viajes del período anterior
    previous_trips = db.query(
        func.count(TripModel.id).label("count")
    ).filter(
        cast(TripModel.trip_datetime, Date) >= previous_start_date,
        cast(TripModel.trip_datetime, Date) <= previous_end_date
    ).first()
    
    # Calcular tendencia
    trend = calculate_trend(current_trips.count, previous_trips.count)
    
    return {
        "count": current_trips.count,
        "trend": round(trend, 2),
        "period": period
    }

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    period: str = Query("today", description="Período para las estadísticas: today, yesterday, week, month, year"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas consolidadas para el dashboard
    
    - **period**: Período para las estadísticas (today, yesterday, week, month, year)
    
    Retorna estadísticas de boletos, paquetes y viajes en un solo endpoint
    """
    # Obtener estadísticas de boletos
    ticket_stats = await get_ticket_stats(period, db)
    
    # Obtener estadísticas de paquetes
    package_stats = await get_package_stats(period, db)
    
    # Obtener estadísticas de viajes
    trip_stats = await get_trip_stats(period, db)
    
    return {
        "tickets": ticket_stats,
        "packages": package_stats,
        "trips": trip_stats
    }

@router.get("/trips/upcoming", response_model=List[dict])
async def get_upcoming_trips(
    limit: int = Query(5, description="Número máximo de viajes a retornar"),
    db: Session = Depends(get_db)
):
    """
    Obtener los próximos viajes programados
    
    - **limit**: Número máximo de viajes a retornar
    
    Retorna una lista de los próximos viajes con información básica
    """
    now = datetime.now()
    
    # Consultar los próximos viajes
    upcoming_trips = db.query(TripModel).filter(
        TripModel.trip_datetime >= now,
        TripModel.status.in_(['scheduled', 'in_progress'])
    ).order_by(
        TripModel.trip_datetime
    ).limit(limit).all()
    
    # Transformar los resultados
    result = []
    for trip in upcoming_trips:
        # Obtener origen y destino
        origin = trip.route.origin_location.name if trip.route and trip.route.origin_location else "Desconocido"
        destination = trip.route.destination_location.name if trip.route and trip.route.destination_location else "Desconocido"
        
        # Obtener asientos disponibles
        total_seats = trip.bus.capacity if trip.bus else 40
        occupied_seats = db.query(func.count(TicketModel.id)).filter(
            TicketModel.trip_id == trip.id,
            TicketModel.state != 'cancelled'
        ).scalar()
        available_seats = total_seats - occupied_seats
        
        result.append({
            "id": trip.id,
            "route": {
                "origin": origin,
                "destination": destination
            },
            "trip_datetime": trip.trip_datetime,
            "status": trip.status,
            "available_seats": available_seats,
            "total_seats": total_seats
        })
    
    return result

@router.get("/sales/recent", response_model=List[dict])
async def get_recent_sales(
    limit: int = Query(5, description="Número máximo de ventas a retornar"),
    db: Session = Depends(get_db)
):
    """
    Obtener las ventas más recientes (boletos y paquetes)
    
    - **limit**: Número máximo de ventas a retornar
    
    Retorna una lista de las ventas más recientes con información básica
    """
    # Consultar los boletos más recientes
    recent_tickets = db.query(
        TicketModel.id,
        TicketModel.created_at,
        TicketModel.state,
        ClientModel.firstname,
        ClientModel.lastname,
        RouteModel.price,
        TripModel.id.label("trip_id")
    ).join(
        ClientModel, TicketModel.client_id == ClientModel.id
    ).join(
        TripModel, TicketModel.trip_id == TripModel.id
    ).join(
        RouteModel, TripModel.route_id == RouteModel.id
    ).order_by(
        desc(TicketModel.created_at)
    ).limit(limit).all()
    
    # Consultar los paquetes más recientes
    recent_packages = db.query(
        PackageModel.id,
        PackageModel.created_at,
        PackageModel.status,
        ClientModel.firstname,
        ClientModel.lastname,
        PackageModel.price,
        PackageModel.trip_id
    ).join(
        ClientModel, PackageModel.sender_id == ClientModel.id
    ).order_by(
        desc(PackageModel.created_at)
    ).limit(limit).all()
    
    # Transformar los resultados de boletos
    ticket_sales = []
    for ticket in recent_tickets:
        ticket_sales.append({
            "id": ticket.id,
            "type": "ticket",
            "reference": f"T-{ticket.id}",
            "client_name": f"{ticket.firstname} {ticket.lastname}",
            "amount": float(ticket.price),
            "date": ticket.created_at,
            "status": ticket.state,
            "trip_id": ticket.trip_id
        })
    
    # Transformar los resultados de paquetes
    package_sales = []
    for package in recent_packages:
        package_sales.append({
            "id": package.id,
            "type": "package",
            "reference": f"P-{package.id}",
            "client_name": f"{package.firstname} {package.lastname}",
            "amount": float(package.price) if package.price else 0.0,
            "date": package.created_at,
            "status": package.status,
            "trip_id": package.trip_id
        })
    
    # Combinar y ordenar por fecha
    all_sales = ticket_sales + package_sales
    all_sales.sort(key=lambda x: x["date"], reverse=True)
    
    # Limitar al número solicitado
    return all_sales[:limit]

@router.get("/sales/summary", response_model=dict)
async def get_sales_summary(
    period: str = Query("today", description="Período para las estadísticas: today, yesterday, week, month, year"),
    db: Session = Depends(get_db)
):
    """
    Obtener un resumen de ventas para un período específico
    
    - **period**: Período para las estadísticas (today, yesterday, week, month, year)
    
    Retorna un resumen con el monto total, cantidad de boletos, cantidad de paquetes y tendencia
    """
    # Obtener el rango de fechas
    start_date, end_date, previous_start_date, previous_end_date = get_date_range(period)
    
    # Consultar boletos del período actual
    current_tickets = db.query(
        func.count(TicketModel.id).label("count"),
        func.coalesce(func.sum(RouteModel.price), 0).label("amount")
    ).join(
        TripModel, TicketModel.trip_id == TripModel.id
    ).join(
        RouteModel, TripModel.route_id == RouteModel.id
    ).filter(
        cast(TicketModel.created_at, Date) >= start_date,
        cast(TicketModel.created_at, Date) <= end_date,
        TicketModel.state != 'cancelled'
    ).first()
    
    # Consultar paquetes del período actual
    current_packages = db.query(
        func.count(PackageModel.id).label("count"),
        func.coalesce(func.sum(PackageModel.price), 0).label("amount")
    ).filter(
        cast(PackageModel.created_at, Date) >= start_date,
        cast(PackageModel.created_at, Date) <= end_date
    ).first()
    
    # Consultar boletos del período anterior
    previous_tickets = db.query(
        func.count(TicketModel.id).label("count"),
        func.coalesce(func.sum(RouteModel.price), 0).label("amount")
    ).join(
        TripModel, TicketModel.trip_id == TripModel.id
    ).join(
        RouteModel, TripModel.route_id == RouteModel.id
    ).filter(
        cast(TicketModel.created_at, Date) >= previous_start_date,
        cast(TicketModel.created_at, Date) <= previous_end_date,
        TicketModel.state != 'cancelled'
    ).first()
    
    # Consultar paquetes del período anterior
    previous_packages = db.query(
        func.count(PackageModel.id).label("count"),
        func.coalesce(func.sum(PackageModel.price), 0).label("amount")
    ).filter(
        cast(PackageModel.created_at, Date) >= previous_start_date,
        cast(PackageModel.created_at, Date) <= previous_end_date
    ).first()
    
    # Calcular totales actuales
    current_total_amount = float(current_tickets.amount) + float(current_packages.amount)
    current_ticket_count = current_tickets.count
    current_package_count = current_packages.count
    
    # Calcular totales anteriores
    previous_total_amount = float(previous_tickets.amount) + float(previous_packages.amount)
    
    # Calcular tendencia
    trend = calculate_trend(current_total_amount, previous_total_amount)
    
    return {
        "totalAmount": current_total_amount,
        "ticketCount": current_ticket_count,
        "packageCount": current_package_count,
        "trend": round(trend, 2),
        "period": period
    }
