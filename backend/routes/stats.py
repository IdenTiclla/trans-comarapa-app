from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, cast, Date, extract, case
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
from models.package_item import PackageItem as PackageItemModel

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
    amount: float
    trend: float
    period: str

class TripStats(BaseModel):
    count: int
    trend: float
    period: str

# New Pydantic model for Reserved Ticket Stats
class ReservedTicketStats(BaseModel):
    count: int
    trend: float
    period: str

# Pydantic model for Monthly Data Point
class MonthlyDataPoint(BaseModel):
    month: str
    label: str
    value: float
    count: int
    amount: float

# Pydantic model for Monthly Stats Response
class MonthlyStats(BaseModel):
    data: List[MonthlyDataPoint]
    trend: float

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
    - **amount**: Monto total de ventas de paquetes en el período
    - **trend**: Tendencia respecto al período anterior (porcentaje)
    - **period**: Período de las estadísticas
    """
    # Obtener el rango de fechas
    start_date, end_date, previous_start_date, previous_end_date = get_date_range(period)
    
    # Consultar paquetes del período actual
    current_packages = db.query(
        func.count(PackageModel.id).label("count"),
        func.coalesce(
            func.sum(
                db.query(func.sum(PackageItemModel.total_price))
                .filter(PackageItemModel.package_id == PackageModel.id)
                .scalar_subquery()
            ), 0
        ).label("amount")
    ).filter(
        cast(PackageModel.created_at, Date) >= start_date,
        cast(PackageModel.created_at, Date) <= end_date
    ).first()
    
    # Consultar paquetes del período anterior
    previous_packages = db.query(
        func.count(PackageModel.id).label("count"),
        func.coalesce(
            func.sum(
                db.query(func.sum(PackageItemModel.total_price))
                .filter(PackageItemModel.package_id == PackageModel.id)
                .scalar_subquery()
            ), 0
        ).label("amount")
    ).filter(
        cast(PackageModel.created_at, Date) >= previous_start_date,
        cast(PackageModel.created_at, Date) <= previous_end_date
    ).first()
    
    # Calcular tendencias
    count_trend = calculate_trend(current_packages.count, previous_packages.count)
    amount_trend = calculate_trend(current_packages.amount, previous_packages.amount)
    
    return {
        "count": current_packages.count,
        "amount": float(current_packages.amount),
        "trend": round(amount_trend, 2),
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
        # Obtener el paquete completo para acceder a total_amount
        full_package = db.query(PackageModel).filter(PackageModel.id == package.id).first()
        package_sales.append({
            "id": package.id,
            "type": "package",
            "reference": f"P-{package.id}",
            "client_name": f"{package.firstname} {package.lastname}",
            "amount": float(full_package.total_amount) if full_package else 0.0,
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
        func.coalesce(
            func.sum(
                db.query(func.sum(PackageItemModel.total_price))
                .filter(PackageItemModel.package_id == PackageModel.id)
                .scalar_subquery()
            ), 0
        ).label("amount")
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
        func.coalesce(
            func.sum(
                db.query(func.sum(PackageItemModel.total_price))
                .filter(PackageItemModel.package_id == PackageModel.id)
                .scalar_subquery()
            ), 0
        ).label("amount")
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

# New endpoint for Reserved Ticket Stats
@router.get("/tickets/reserved/stats", response_model=ReservedTicketStats)
async def get_reserved_ticket_stats(
    period: str = Query("today", description="Período para las estadísticas: today, yesterday, week, month, year"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas de boletos reservados (pendientes) para un período específico
    
    - **period**: Período para las estadísticas (today, yesterday, week, month, year)
    
    Retorna:
    - **count**: Número de boletos reservados en el período
    - **trend**: Tendencia respecto al período anterior (porcentaje)
    - **period**: Período de las estadísticas
    """
    start_date, end_date, previous_start_date, previous_end_date = get_date_range(period)
    
    # Consultar boletos reservados (pendientes) del período actual
    current_reserved_tickets = db.query(
        func.count(TicketModel.id).label("count")
    ).filter(
        cast(TicketModel.created_at, Date) >= start_date,
        cast(TicketModel.created_at, Date) <= end_date,
        TicketModel.state == 'pending'
    ).first()
    
    # Consultar boletos reservados (pendientes) del período anterior
    previous_reserved_tickets = db.query(
        func.count(TicketModel.id).label("count")
    ).filter(
        cast(TicketModel.created_at, Date) >= previous_start_date,
        cast(TicketModel.created_at, Date) <= previous_end_date,
        TicketModel.state == 'pending'
    ).first()
    
    trend = calculate_trend(current_reserved_tickets.count, previous_reserved_tickets.count)
    
    return {
        "count": current_reserved_tickets.count,
        "trend": round(trend, 2),
        "period": period
    }

@router.get("/tickets/monthly", response_model=MonthlyStats)
async def get_monthly_ticket_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas mensuales de boletos vendidos para los últimos N meses
    
    - **months**: Número de meses para obtener estadísticas (por defecto 6)
    
    Retorna:
    - **data**: Lista de datos mensuales con tickets vendidos
    - **trend**: Tendencia general en porcentaje
    """
    # Calcular fechas - obtener los últimos N meses completos
    today = datetime.now().date()
    
    # Calcular la fecha de inicio (N meses atrás desde el primer día del mes actual)
    current_month_start = today.replace(day=1)
    
    # Calcular N-1 meses atrás para obtener N meses en total
    start_year = current_month_start.year
    start_month = current_month_start.month - (months - 1)
    
    # Ajustar año si el mes es negativo
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    
    start_date = date(start_year, start_month, 1)
    
    # Consultar tickets agrupados por mes y año
    monthly_data = db.query(
        extract('year', TicketModel.created_at).label('year'),
        extract('month', TicketModel.created_at).label('month'),
        func.count(TicketModel.id).label('count'),
        func.coalesce(func.sum(RouteModel.price), 0).label('amount')
    ).join(
        TripModel, TicketModel.trip_id == TripModel.id
    ).join(
        RouteModel, TripModel.route_id == RouteModel.id
    ).filter(
        TicketModel.created_at >= start_date,
        TicketModel.state != 'cancelled'
    ).group_by(
        extract('year', TicketModel.created_at),
        extract('month', TicketModel.created_at)
    ).order_by(
        extract('year', TicketModel.created_at),
        extract('month', TicketModel.created_at)
    ).all()
    
    # Crear diccionario para lookup rápido de datos existentes
    data_dict = {}
    for row in monthly_data:
        key = f"{int(row.year)}-{int(row.month)}"
        data_dict[key] = {
            'count': row.count,
            'amount': float(row.amount)
        }
    
    # Generar datos para todos los meses en el rango
    result_data = []
    
    # Nombres de meses en español (abreviados)
    month_names = [
        '', 'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    
    # Generar datos para cada mes
    for i in range(months):
        # Calcular año y mes para esta iteración
        target_year = start_year
        target_month = start_month + i
        
        # Ajustar año si el mes excede 12
        while target_month > 12:
            target_month -= 12
            target_year += 1
        
        month_label = month_names[target_month]
        
        # Buscar datos para este mes
        key = f"{target_year}-{target_month}"
        if key in data_dict:
            count = data_dict[key]['count']
            amount = data_dict[key]['amount']
        else:
            count = 0
            amount = 0.0
        
        result_data.append({
            "month": month_label,
            "label": month_label,
            "value": count,
            "count": count,
            "amount": amount
        })
    
    # Calcular tendencia (comparar últimos 2 meses si hay datos)
    trend = 0.0
    if len(result_data) >= 2:
        current_count = result_data[-1]['count']
        previous_count = result_data[-2]['count']
        if previous_count > 0:
            trend = ((current_count - previous_count) / previous_count) * 100
        elif current_count > 0:
            trend = 100.0
    
    return {
        "data": result_data,
        "trend": round(trend, 2)
    }

@router.get("/reservations/monthly", response_model=MonthlyStats)
async def get_monthly_reservation_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de reservas"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas mensuales de reservas (tickets pendientes) para los últimos N meses
    
    - **months**: Número de meses para obtener estadísticas (por defecto 6)
    
    Retorna:
    - **data**: Lista de datos mensuales con reservas
    - **trend**: Tendencia general en porcentaje
    """
    # Calcular fechas - obtener los últimos N meses completos
    today = datetime.now().date()
    
    # Calcular la fecha de inicio (N meses atrás desde el primer día del mes actual)
    current_month_start = today.replace(day=1)
    
    # Calcular N-1 meses atrás para obtener N meses en total
    start_year = current_month_start.year
    start_month = current_month_start.month - (months - 1)
    
    # Ajustar año si el mes es negativo
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    
    start_date = date(start_year, start_month, 1)
    
    # Consultar reservas (tickets pendientes) agrupadas por mes y año
    monthly_data = db.query(
        extract('year', TicketModel.created_at).label('year'),
        extract('month', TicketModel.created_at).label('month'),
        func.count(TicketModel.id).label('count'),
        func.coalesce(func.sum(RouteModel.price), 0).label('amount')
    ).join(
        TripModel, TicketModel.trip_id == TripModel.id
    ).join(
        RouteModel, TripModel.route_id == RouteModel.id
    ).filter(
        TicketModel.created_at >= start_date,
        TicketModel.state == 'pending'  # Solo reservas (tickets pendientes)
    ).group_by(
        extract('year', TicketModel.created_at),
        extract('month', TicketModel.created_at)
    ).order_by(
        extract('year', TicketModel.created_at),
        extract('month', TicketModel.created_at)
    ).all()
    
    # Crear diccionario para lookup rápido de datos existentes
    data_dict = {}
    for row in monthly_data:
        key = f"{int(row.year)}-{int(row.month)}"
        data_dict[key] = {
            'count': row.count,
            'amount': float(row.amount)
        }
    
    # Generar datos para todos los meses en el rango
    result_data = []
    
    # Nombres de meses en español (abreviados)
    month_names = [
        '', 'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    
    # Generar datos para cada mes
    for i in range(months):
        # Calcular año y mes para esta iteración
        target_year = start_year
        target_month = start_month + i
        
        # Ajustar año si el mes excede 12
        while target_month > 12:
            target_month -= 12
            target_year += 1
        
        month_label = month_names[target_month]
        
        # Buscar datos para este mes
        key = f"{target_year}-{target_month}"
        if key in data_dict:
            count = data_dict[key]['count']
            amount = data_dict[key]['amount']
        else:
            count = 0
            amount = 0.0
        
        result_data.append({
            "month": month_label,
            "label": month_label,
            "value": count,
            "count": count,
            "amount": amount
        })
    
    # Calcular tendencia (comparar últimos 2 meses si hay datos)
    trend = 0.0
    if len(result_data) >= 2:
        current_count = result_data[-1]['count']
        previous_count = result_data[-2]['count']
        if previous_count > 0:
            trend = ((current_count - previous_count) / previous_count) * 100
        elif current_count > 0:
            trend = 100.0
    
    return {
        "data": result_data,
        "trend": round(trend, 2)
    }

@router.get("/packages/monthly", response_model=MonthlyStats)
async def get_monthly_package_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de paquetes"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas mensuales de paquetes enviados para los últimos N meses
    
    - **months**: Número de meses para obtener estadísticas (por defecto 6)
    
    Retorna:
    - **data**: Lista de datos mensuales con paquetes enviados
    - **trend**: Tendencia general en porcentaje
    """
    # Calcular fechas - obtener los últimos N meses completos
    today = datetime.now().date()
    
    # Calcular la fecha de inicio (N meses atrás desde el primer día del mes actual)
    current_month_start = today.replace(day=1)
    
    # Calcular N-1 meses atrás para obtener N meses en total
    start_year = current_month_start.year
    start_month = current_month_start.month - (months - 1)
    
    # Ajustar año si el mes es negativo
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    
    start_date = date(start_year, start_month, 1)
    
    # Consultar paquetes agrupados por mes y año
    monthly_data = db.query(
        extract('year', PackageModel.created_at).label('year'),
        extract('month', PackageModel.created_at).label('month'),
        func.count(PackageModel.id).label('count'),
        func.coalesce(
            func.sum(
                db.query(func.sum(PackageItemModel.total_price))
                .filter(PackageItemModel.package_id == PackageModel.id)
                .scalar_subquery()
            ), 0
        ).label('amount')
    ).filter(
        PackageModel.created_at >= start_date,
        PackageModel.status.in_(['registered', 'in_transit', 'delivered'])  # Excluir cancelados
    ).group_by(
        extract('year', PackageModel.created_at),
        extract('month', PackageModel.created_at)
    ).order_by(
        extract('year', PackageModel.created_at),
        extract('month', PackageModel.created_at)
    ).all()
    
    # Crear diccionario para lookup rápido de datos existentes
    data_dict = {}
    for row in monthly_data:
        key = f"{int(row.year)}-{int(row.month)}"
        data_dict[key] = {
            'count': row.count,
            'amount': float(row.amount)
        }
    
    # Generar datos para todos los meses en el rango
    result_data = []
    
    # Nombres de meses en español (abreviados)
    month_names = [
        '', 'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    
    # Generar datos para cada mes
    for i in range(months):
        # Calcular año y mes para esta iteración
        target_year = start_year
        target_month = start_month + i
        
        # Ajustar año si el mes excede 12
        while target_month > 12:
            target_month -= 12
            target_year += 1
        
        month_label = month_names[target_month]
        
        # Buscar datos para este mes
        key = f"{target_year}-{target_month}"
        if key in data_dict:
            count = data_dict[key]['count']
            amount = data_dict[key]['amount']
        else:
            count = 0
            amount = 0.0
        
        result_data.append({
            "month": month_label,
            "label": month_label,
            "value": count,
            "count": count,
            "amount": amount
        })
    
    # Calcular tendencia (comparar últimos 2 meses si hay datos)
    trend = 0.0
    if len(result_data) >= 2:
        current_count = result_data[-1]['count']
        previous_count = result_data[-2]['count']
        if previous_count > 0:
            trend = ((current_count - previous_count) / previous_count) * 100
        elif current_count > 0:
            trend = 100.0
    
    return {
        "data": result_data,
        "trend": round(trend, 2)
    }

@router.get("/trips/monthly", response_model=MonthlyStats)
async def get_monthly_trip_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de viajes"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas mensuales de viajes realizados para los últimos N meses
    
    - **months**: Número de meses para obtener estadísticas (por defecto 6)
    
    Retorna:
    - **data**: Lista de datos mensuales con viajes realizados
    - **trend**: Tendencia general en porcentaje
    """
    # Calcular fechas - obtener los últimos N meses completos
    today = datetime.now().date()
    
    # Calcular la fecha de inicio (N meses atrás desde el primer día del mes actual)
    current_month_start = today.replace(day=1)
    
    # Calcular N-1 meses atrás para obtener N meses en total
    start_year = current_month_start.year
    start_month = current_month_start.month - (months - 1)
    
    # Ajustar año si el mes es negativo
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    
    start_date = date(start_year, start_month, 1)
    
    # Consultar viajes agrupados por mes y año
    # Nota: Para viajes no calculamos amount ya que el ingreso viene de tickets y paquetes
    monthly_data = db.query(
        extract('year', TripModel.trip_datetime).label('year'),
        extract('month', TripModel.trip_datetime).label('month'),
        func.count(TripModel.id).label('count')
    ).filter(
        TripModel.trip_datetime >= start_date,
        TripModel.status.in_(['scheduled', 'in_progress', 'completed'])  # Excluir cancelados
    ).group_by(
        extract('year', TripModel.trip_datetime),
        extract('month', TripModel.trip_datetime)
    ).order_by(
        extract('year', TripModel.trip_datetime),
        extract('month', TripModel.trip_datetime)
    ).all()
    
    # Crear diccionario para lookup rápido de datos existentes
    data_dict = {}
    for row in monthly_data:
        key = f"{int(row.year)}-{int(row.month)}"
        data_dict[key] = {
            'count': row.count,
            'amount': 0.0  # Los viajes no tienen monto directo
        }
    
    # Generar datos para todos los meses en el rango
    result_data = []
    
    # Nombres de meses en español (abreviados)
    month_names = [
        '', 'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    
    # Generar datos para cada mes
    for i in range(months):
        # Calcular año y mes para esta iteración
        target_year = start_year
        target_month = start_month + i
        
        # Ajustar año si el mes excede 12
        while target_month > 12:
            target_month -= 12
            target_year += 1
        
        month_label = month_names[target_month]
        
        # Buscar datos para este mes
        key = f"{target_year}-{target_month}"
        if key in data_dict:
            count = data_dict[key]['count']
            amount = data_dict[key]['amount']
        else:
            count = 0
            amount = 0.0
        
        result_data.append({
            "month": month_label,
            "label": month_label,
            "value": count,
            "count": count,
            "amount": amount
        })
    
    # Calcular tendencia (comparar últimos 2 meses si hay datos)
    trend = 0.0
    if len(result_data) >= 2:
        current_count = result_data[-1]['count']
        previous_count = result_data[-2]['count']
        if previous_count > 0:
            trend = ((current_count - previous_count) / previous_count) * 100
        elif current_count > 0:
            trend = 100.0
    
    return {
        "data": result_data,
        "trend": round(trend, 2)
    }

@router.get("/revenue/monthly", response_model=MonthlyStats)
async def get_monthly_revenue_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de ingresos"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas mensuales de ingresos totales para los últimos N meses
    Combina ingresos de tickets y paquetes
    
    - **months**: Número de meses para obtener estadísticas (por defecto 6)
    
    Retorna:
    - **data**: Lista de datos mensuales con ingresos totales
    - **trend**: Tendencia general en porcentaje
    """
    # Calcular fechas - obtener los últimos N meses completos
    today = datetime.now().date()
    
    # Calcular la fecha de inicio (N meses atrás desde el primer día del mes actual)
    current_month_start = today.replace(day=1)
    
    # Calcular N-1 meses atrás para obtener N meses en total
    start_year = current_month_start.year
    start_month = current_month_start.month - (months - 1)
    
    # Ajustar año si el mes es negativo
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    
    start_date = date(start_year, start_month, 1)
    
    # Consultar ingresos de tickets agrupados por mes y año
    ticket_revenue_data = db.query(
        extract('year', TicketModel.created_at).label('year'),
        extract('month', TicketModel.created_at).label('month'),
        func.coalesce(func.sum(RouteModel.price), 0).label('amount')
    ).join(
        TripModel, TicketModel.trip_id == TripModel.id
    ).join(
        RouteModel, TripModel.route_id == RouteModel.id
    ).filter(
        TicketModel.created_at >= start_date,
        TicketModel.state != 'cancelled'  # Excluir boletos cancelados
    ).group_by(
        extract('year', TicketModel.created_at),
        extract('month', TicketModel.created_at)
    ).all()
    
    # Consultar ingresos de paquetes agrupados por mes y año
    package_revenue_data = db.query(
        extract('year', PackageModel.created_at).label('year'),
        extract('month', PackageModel.created_at).label('month'),
        func.coalesce(
            func.sum(
                db.query(func.sum(PackageItemModel.total_price))
                .filter(PackageItemModel.package_id == PackageModel.id)
                .scalar_subquery()
            ), 0
        ).label('amount')
    ).filter(
        PackageModel.created_at >= start_date,
        PackageModel.status.in_(['registered', 'in_transit', 'delivered'])  # Excluir cancelados
    ).group_by(
        extract('year', PackageModel.created_at),
        extract('month', PackageModel.created_at)
    ).all()
    
    # Crear diccionarios para lookup rápido de datos existentes
    ticket_revenue_dict = {}
    for row in ticket_revenue_data:
        key = f"{int(row.year)}-{int(row.month)}"
        ticket_revenue_dict[key] = float(row.amount)
    
    package_revenue_dict = {}
    for row in package_revenue_data:
        key = f"{int(row.year)}-{int(row.month)}"
        package_revenue_dict[key] = float(row.amount)
    
    # Generar datos para todos los meses en el rango
    result_data = []
    
    # Nombres de meses en español (abreviados)
    month_names = [
        '', 'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    
    # Generar datos para cada mes
    for i in range(months):
        # Calcular año y mes para esta iteración
        target_year = start_year
        target_month = start_month + i
        
        # Ajustar año si el mes excede 12
        while target_month > 12:
            target_month -= 12
            target_year += 1
        
        month_label = month_names[target_month]
        
        # Buscar datos para este mes
        key = f"{target_year}-{target_month}"
        ticket_amount = ticket_revenue_dict.get(key, 0.0)
        package_amount = package_revenue_dict.get(key, 0.0)
        total_amount = ticket_amount + package_amount
        
        result_data.append({
            "month": month_label,
            "label": month_label,
            "value": total_amount,
            "count": 0,  # No aplicable para ingresos
            "amount": total_amount
        })
    
    # Calcular tendencia (comparar últimos 2 meses si hay datos)
    trend = 0.0
    if len(result_data) >= 2:
        current_amount = result_data[-1]['amount']
        previous_amount = result_data[-2]['amount']
        if previous_amount > 0:
            trend = ((current_amount - previous_amount) / previous_amount) * 100
        elif current_amount > 0:
            trend = 100.0
    
    return {
        "data": result_data,
        "trend": round(trend, 2)
    }

@router.get("/tickets/revenue/monthly", response_model=MonthlyStats)
async def get_monthly_ticket_revenue_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de ingresos por boletos"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas mensuales de ingresos por boletos para los últimos N meses
    
    - **months**: Número de meses para obtener estadísticas (por defecto 6)
    
    Retorna:
    - **data**: Lista de datos mensuales con ingresos por boletos
    - **trend**: Tendencia general en porcentaje
    """
    # Calcular fechas - obtener los últimos N meses completos
    today = datetime.now().date()
    
    # Calcular la fecha de inicio (N meses atrás desde el primer día del mes actual)
    current_month_start = today.replace(day=1)
    
    # Calcular N-1 meses atrás para obtener N meses en total
    start_year = current_month_start.year
    start_month = current_month_start.month - (months - 1)
    
    # Ajustar año si el mes es negativo
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    
    start_date = date(start_year, start_month, 1)
    
    # Consultar ingresos de tickets agrupados por mes y año
    monthly_data = db.query(
        extract('year', TicketModel.created_at).label('year'),
        extract('month', TicketModel.created_at).label('month'),
        func.count(TicketModel.id).label('count'),
        func.coalesce(func.sum(RouteModel.price), 0).label('amount')
    ).join(
        TripModel, TicketModel.trip_id == TripModel.id
    ).join(
        RouteModel, TripModel.route_id == RouteModel.id
    ).filter(
        TicketModel.created_at >= start_date,
        TicketModel.state != 'cancelled'  # Excluir boletos cancelados
    ).group_by(
        extract('year', TicketModel.created_at),
        extract('month', TicketModel.created_at)
    ).order_by(
        extract('year', TicketModel.created_at),
        extract('month', TicketModel.created_at)
    ).all()
    
    # Crear diccionario para lookup rápido de datos existentes
    data_dict = {}
    for row in monthly_data:
        key = f"{int(row.year)}-{int(row.month)}"
        data_dict[key] = {
            'count': row.count,
            'amount': float(row.amount)
        }
    
    # Generar datos para todos los meses en el rango
    result_data = []
    
    # Nombres de meses en español (abreviados)
    month_names = [
        '', 'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    
    # Generar datos para cada mes
    for i in range(months):
        # Calcular año y mes para esta iteración
        target_year = start_year
        target_month = start_month + i
        
        # Ajustar año si el mes excede 12
        while target_month > 12:
            target_month -= 12
            target_year += 1
        
        month_label = month_names[target_month]
        
        # Buscar datos para este mes
        key = f"{target_year}-{target_month}"
        if key in data_dict:
            count = data_dict[key]['count']
            amount = data_dict[key]['amount']
        else:
            count = 0
            amount = 0.0
        
        result_data.append({
            "month": month_label,
            "label": month_label,
            "value": amount,
            "count": count,
            "amount": amount
        })
    
    # Calcular tendencia (comparar últimos 2 meses si hay datos)
    trend = 0.0
    if len(result_data) >= 2:
        current_amount = result_data[-1]['amount']
        previous_amount = result_data[-2]['amount']
        if previous_amount > 0:
            trend = ((current_amount - previous_amount) / previous_amount) * 100
        elif current_amount > 0:
            trend = 100.0
    
    return {
        "data": result_data,
        "trend": round(trend, 2)
    }

@router.get("/packages/revenue/monthly", response_model=MonthlyStats)
async def get_monthly_package_revenue_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de ingresos por paquetes"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas mensuales de ingresos por paquetes para los últimos N meses
    
    - **months**: Número de meses para obtener estadísticas (por defecto 6)
    
    Retorna:
    - **data**: Lista de datos mensuales con ingresos por paquetes
    - **trend**: Tendencia general en porcentaje
    """
    # Calcular fechas - obtener los últimos N meses completos
    today = datetime.now().date()
    
    # Calcular la fecha de inicio (N meses atrás desde el primer día del mes actual)
    current_month_start = today.replace(day=1)
    
    # Calcular N-1 meses atrás para obtener N meses en total
    start_year = current_month_start.year
    start_month = current_month_start.month - (months - 1)
    
    # Ajustar año si el mes es negativo
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    
    start_date = date(start_year, start_month, 1)
    
    # Consultar ingresos de paquetes con sus items agrupados por mes y año
    monthly_data = db.query(
        extract('year', PackageModel.created_at).label('year'),
        extract('month', PackageModel.created_at).label('month'),
        func.count(PackageModel.id).label('count'),
        func.coalesce(func.sum(PackageItemModel.total_price), 0).label('amount')
    ).join(
        PackageItemModel, PackageModel.id == PackageItemModel.package_id
    ).filter(
        PackageModel.created_at >= start_date,
        PackageModel.status.in_(['registered', 'in_transit', 'delivered'])  # Excluir cancelados
    ).group_by(
        extract('year', PackageModel.created_at),
        extract('month', PackageModel.created_at)
    ).order_by(
        extract('year', PackageModel.created_at),
        extract('month', PackageModel.created_at)
    ).all()
    
    # Crear diccionario para lookup rápido de datos existentes
    data_dict = {}
    for row in monthly_data:
        key = f"{int(row.year)}-{int(row.month)}"
        data_dict[key] = {
            'count': row.count,
            'amount': float(row.amount)
        }
    
    # Generar datos para todos los meses en el rango
    result_data = []
    
    # Nombres de meses en español (abreviados)
    month_names = [
        '', 'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    
    # Generar datos para cada mes
    for i in range(months):
        # Calcular año y mes para esta iteración
        target_year = start_year
        target_month = start_month + i
        
        # Ajustar año si el mes excede 12
        while target_month > 12:
            target_month -= 12
            target_year += 1
        
        month_label = month_names[target_month]
        
        # Buscar datos para este mes
        key = f"{target_year}-{target_month}"
        if key in data_dict:
            count = data_dict[key]['count']
            amount = data_dict[key]['amount']
        else:
            count = 0
            amount = 0.0
        
        result_data.append({
            "month": month_label,
            "label": month_label,
            "value": amount,
            "count": count,
            "amount": amount
        })
    
    # Calcular tendencia (comparar últimos 2 meses si hay datos)
    trend = 0.0
    if len(result_data) >= 2:
        current_amount = result_data[-1]['amount']
        previous_amount = result_data[-2]['amount']
        if previous_amount > 0:
            trend = ((current_amount - previous_amount) / previous_amount) * 100
        elif current_amount > 0:
            trend = 100.0
    
    return {
        "data": result_data,
        "trend": round(trend, 2)
    }

@router.get("/tickets/cancelled/monthly", response_model=MonthlyStats)
async def get_monthly_cancelled_ticket_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de boletos cancelados"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas mensuales de boletos cancelados para los últimos N meses
    
    - **months**: Número de meses para obtener estadísticas (por defecto 6)
    
    Retorna:
    - **data**: Lista de datos mensuales con boletos cancelados
    - **trend**: Tendencia general en porcentaje
    """
    # Calcular fechas - obtener los últimos N meses completos
    today = datetime.now().date()
    
    # Calcular la fecha de inicio (N meses atrás desde el primer día del mes actual)
    current_month_start = today.replace(day=1)
    
    # Calcular N-1 meses atrás para obtener N meses en total
    start_year = current_month_start.year
    start_month = current_month_start.month - (months - 1)
    
    # Ajustar año si el mes es negativo
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    
    start_date = date(start_year, start_month, 1)
    
    # Consultar tickets cancelados agrupados por mes y año
    monthly_data = db.query(
        extract('year', TicketModel.created_at).label('year'),
        extract('month', TicketModel.created_at).label('month'),
        func.count(TicketModel.id).label('count'),
        func.coalesce(func.sum(RouteModel.price), 0).label('amount')
    ).join(
        TripModel, TicketModel.trip_id == TripModel.id
    ).join(
        RouteModel, TripModel.route_id == RouteModel.id
    ).filter(
        TicketModel.created_at >= start_date,
        TicketModel.state == 'cancelled'  # Solo boletos cancelados
    ).group_by(
        extract('year', TicketModel.created_at),
        extract('month', TicketModel.created_at)
    ).order_by(
        extract('year', TicketModel.created_at),
        extract('month', TicketModel.created_at)
    ).all()
    
    # Crear diccionario para lookup rápido de datos existentes
    data_dict = {}
    for row in monthly_data:
        key = f"{int(row.year)}-{int(row.month)}"
        data_dict[key] = {
            'count': row.count,
            'amount': float(row.amount)
        }
    
    # Generar datos para todos los meses en el rango
    result_data = []
    
    # Nombres de meses en español (abreviados)
    month_names = [
        '', 'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    
    # Generar datos para cada mes
    for i in range(months):
        # Calcular año y mes para esta iteración
        target_year = start_year
        target_month = start_month + i
        
        # Ajustar año si el mes excede 12
        while target_month > 12:
            target_month -= 12
            target_year += 1
        
        month_label = month_names[target_month]
        
        # Buscar datos para este mes
        key = f"{target_year}-{target_month}"
        if key in data_dict:
            count = data_dict[key]['count']
            amount = data_dict[key]['amount']
        else:
            count = 0
            amount = 0.0
        
        result_data.append({
            "month": month_label,
            "label": month_label,
            "value": count,
            "count": count,
            "amount": amount
        })
    
    # Calcular tendencia (comparar últimos 2 meses si hay datos)
    trend = 0.0
    if len(result_data) >= 2:
        current_count = result_data[-1]['count']
        previous_count = result_data[-2]['count']
        if previous_count > 0:
            trend = ((current_count - previous_count) / previous_count) * 100
        elif current_count > 0:
            trend = 100.0
    
    return {
        "data": result_data,
        "trend": round(trend, 2)
    }

@router.get("/trips/completed/monthly", response_model=MonthlyStats)
async def get_monthly_completed_trip_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de viajes completados"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas mensuales de viajes completados para los últimos N meses
    
    - **months**: Número de meses para obtener estadísticas (por defecto 6)
    
    Retorna:
    - **data**: Lista de datos mensuales con viajes completados
    - **trend**: Tendencia general en porcentaje
    """
    # Calcular fechas - obtener los últimos N meses completos
    today = datetime.now().date()
    
    # Calcular la fecha de inicio (N meses atrás desde el primer día del mes actual)
    current_month_start = today.replace(day=1)
    
    # Calcular N-1 meses atrás para obtener N meses en total
    start_year = current_month_start.year
    start_month = current_month_start.month - (months - 1)
    
    # Ajustar año si el mes es negativo
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    
    start_date = date(start_year, start_month, 1)
    
    # Consultar viajes completados agrupados por mes y año
    monthly_data = db.query(
        extract('year', TripModel.trip_datetime).label('year'),
        extract('month', TripModel.trip_datetime).label('month'),
        func.count(TripModel.id).label('count')
    ).filter(
        TripModel.trip_datetime >= start_date,
        TripModel.status == 'completed'  # Solo viajes completados
    ).group_by(
        extract('year', TripModel.trip_datetime),
        extract('month', TripModel.trip_datetime)
    ).order_by(
        extract('year', TripModel.trip_datetime),
        extract('month', TripModel.trip_datetime)
    ).all()
    
    # Crear diccionario para lookup rápido de datos existentes
    data_dict = {}
    for row in monthly_data:
        key = f"{int(row.year)}-{int(row.month)}"
        data_dict[key] = {
            'count': row.count,
            'amount': 0.0  # Los viajes no tienen monto directo
        }
    
    # Generar datos para todos los meses en el rango
    result_data = []
    
    # Nombres de meses en español (abreviados)
    month_names = [
        '', 'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    
    # Generar datos para cada mes
    for i in range(months):
        # Calcular año y mes para esta iteración
        target_year = start_year
        target_month = start_month + i
        
        # Ajustar año si el mes excede 12
        while target_month > 12:
            target_month -= 12
            target_year += 1
        
        month_label = month_names[target_month]
        
        # Buscar datos para este mes
        key = f"{target_year}-{target_month}"
        if key in data_dict:
            count = data_dict[key]['count']
            amount = data_dict[key]['amount']
        else:
            count = 0
            amount = 0.0
        
        result_data.append({
            "month": month_label,
            "label": month_label,
            "value": count,
            "count": count,
            "amount": amount
        })
    
    # Calcular tendencia (comparar últimos 2 meses si hay datos)
    trend = 0.0
    if len(result_data) >= 2:
        current_count = result_data[-1]['count']
        previous_count = result_data[-2]['count']
        if previous_count > 0:
            trend = ((current_count - previous_count) / previous_count) * 100
        elif current_count > 0:
            trend = 100.0
    
    return {
        "data": result_data,
        "trend": round(trend, 2)
    }

@router.get("/trips/cancelled/monthly", response_model=MonthlyStats)
async def get_monthly_cancelled_trip_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de viajes cancelados"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas mensuales de viajes cancelados para los últimos N meses
    
    - **months**: Número de meses para obtener estadísticas (por defecto 6)
    
    Retorna:
    - **data**: Lista de datos mensuales con viajes cancelados
    - **trend**: Tendencia general en porcentaje
    """
    # Calcular fechas - obtener los últimos N meses completos
    today = datetime.now().date()
    
    # Calcular la fecha de inicio (N meses atrás desde el primer día del mes actual)
    current_month_start = today.replace(day=1)
    
    # Calcular N-1 meses atrás para obtener N meses en total
    start_year = current_month_start.year
    start_month = current_month_start.month - (months - 1)
    
    # Ajustar año si el mes es negativo
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    
    start_date = date(start_year, start_month, 1)
    
    # Consultar viajes cancelados agrupados por mes y año
    monthly_data = db.query(
        extract('year', TripModel.trip_datetime).label('year'),
        extract('month', TripModel.trip_datetime).label('month'),
        func.count(TripModel.id).label('count')
    ).filter(
        TripModel.trip_datetime >= start_date,
        TripModel.status == 'cancelled'  # Solo viajes cancelados
    ).group_by(
        extract('year', TripModel.trip_datetime),
        extract('month', TripModel.trip_datetime)
    ).order_by(
        extract('year', TripModel.trip_datetime),
        extract('month', TripModel.trip_datetime)
    ).all()
    
    # Crear diccionario para lookup rápido de datos existentes
    data_dict = {}
    for row in monthly_data:
        key = f"{int(row.year)}-{int(row.month)}"
        data_dict[key] = {
            'count': row.count,
            'amount': 0.0  # Los viajes no tienen monto directo
        }
    
    # Generar datos para todos los meses en el rango
    result_data = []
    
    # Nombres de meses en español (abreviados)
    month_names = [
        '', 'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    
    # Generar datos para cada mes
    for i in range(months):
        # Calcular año y mes para esta iteración
        target_year = start_year
        target_month = start_month + i
        
        # Ajustar año si el mes excede 12
        while target_month > 12:
            target_month -= 12
            target_year += 1
        
        month_label = month_names[target_month]
        
        # Buscar datos para este mes
        key = f"{target_year}-{target_month}"
        if key in data_dict:
            count = data_dict[key]['count']
            amount = data_dict[key]['amount']
        else:
            count = 0
            amount = 0.0
        
        result_data.append({
            "month": month_label,
            "label": month_label,
            "value": count,
            "count": count,
            "amount": amount
        })
    
    # Calcular tendencia (comparar últimos 2 meses si hay datos)
    trend = 0.0
    if len(result_data) >= 2:
        current_count = result_data[-1]['count']
        previous_count = result_data[-2]['count']
        if previous_count > 0:
            trend = ((current_count - previous_count) / previous_count) * 100
        elif current_count > 0:
            trend = 100.0
    
    return {
        "data": result_data,
        "trend": round(trend, 2)
    }

@router.get("/clients/feedback/monthly", response_model=MonthlyStats)
async def get_monthly_client_feedback_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de feedback de clientes"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas mensuales de feedback promedio de clientes para los últimos N meses
    
    - **months**: Número de meses para obtener estadísticas (por defecto 6)
    
    Retorna:
    - **data**: Lista de datos mensuales con rating promedio de feedback
    - **trend**: Tendencia general en porcentaje
    
    Nota: Como no tenemos tabla de feedback real, simularemos datos basados en actividad de clientes
    """
    # Calcular fechas - obtener los últimos N meses completos
    today = datetime.now().date()
    
    # Calcular la fecha de inicio (N meses atrás desde el primer día del mes actual)
    current_month_start = today.replace(day=1)
    
    # Calcular N-1 meses atrás para obtener N meses en total
    start_year = current_month_start.year
    start_month = current_month_start.month - (months - 1)
    
    # Ajustar año si el mes es negativo
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    
    start_date = date(start_year, start_month, 1)
    
    # Como no tenemos tabla de feedback, calcularemos un rating simulado basado en actividad
    # Usaremos la relación entre tickets exitosos vs cancelados como proxy de satisfacción
    monthly_data = db.query(
        extract('year', TicketModel.created_at).label('year'),
        extract('month', TicketModel.created_at).label('month'),
        func.count(case((TicketModel.state != 'cancelled', 1))).label('successful_tickets'),
        func.count(TicketModel.id).label('total_tickets')
    ).filter(
        TicketModel.created_at >= start_date
    ).group_by(
        extract('year', TicketModel.created_at),
        extract('month', TicketModel.created_at)
    ).order_by(
        extract('year', TicketModel.created_at),
        extract('month', TicketModel.created_at)
    ).all()
    
    # Crear diccionario para lookup rápido de datos existentes
    data_dict = {}
    for row in monthly_data:
        key = f"{int(row.year)}-{int(row.month)}"
        # Calcular rating basado en éxito de tickets (entre 3.5 y 5.0)
        if row.total_tickets > 0:
            success_rate = row.successful_tickets / row.total_tickets
            # Mapear success_rate (0-1) a rating (3.5-5.0)
            rating = 3.5 + (success_rate * 1.5)
        else:
            rating = 4.0  # Rating por defecto
        
        data_dict[key] = {
            'rating': round(rating, 1),
            'count': row.total_tickets
        }
    
    # Generar datos para todos los meses en el rango
    result_data = []
    
    # Nombres de meses en español (abreviados)
    month_names = [
        '', 'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    
    # Generar datos para cada mes
    for i in range(months):
        # Calcular año y mes para esta iteración
        target_year = start_year
        target_month = start_month + i
        
        # Ajustar año si el mes excede 12
        while target_month > 12:
            target_month -= 12
            target_year += 1
        
        month_label = month_names[target_month]
        
        # Buscar datos para este mes
        key = f"{target_year}-{target_month}"
        if key in data_dict:
            rating = data_dict[key]['rating']
            count = data_dict[key]['count']
        else:
            rating = 4.0  # Rating por defecto
            count = 0
        
        result_data.append({
            "month": month_label,
            "label": month_label,
            "value": rating,
            "count": count,
            "amount": rating  # Para consistencia con otros endpoints
        })
    
    # Calcular tendencia (comparar últimos 2 meses si hay datos)
    trend = 0.0
    if len(result_data) >= 2:
        current_rating = result_data[-1]['value']
        previous_rating = result_data[-2]['value']
        if previous_rating > 0:
            trend = ((current_rating - previous_rating) / previous_rating) * 100
    
    return {
        "data": result_data,
        "trend": round(trend, 2)
    }

@router.get("/clients/registered/monthly", response_model=MonthlyStats)
async def get_monthly_registered_clients_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de clientes registrados"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas mensuales de clientes registrados para los últimos N meses
    Los clientes registrados son aquellos que han comprado tickets o enviado paquetes
    
    - **months**: Número de meses para obtener estadísticas (por defecto 6)
    
    Retorna:
    - **data**: Lista de datos mensuales con nuevos clientes registrados
    - **trend**: Tendencia general en porcentaje
    """
    # Calcular fechas - obtener los últimos N meses completos
    today = datetime.now().date()
    
    # Calcular la fecha de inicio (N meses atrás desde el primer día del mes actual)
    current_month_start = today.replace(day=1)
    
    # Calcular N-1 meses atrás para obtener N meses en total
    start_year = current_month_start.year
    start_month = current_month_start.month - (months - 1)
    
    # Ajustar año si el mes es negativo
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    
    start_date = date(start_year, start_month, 1)
    
    # Obtener clientes únicos por mes que han comprado tickets o enviado paquetes
    # Usaremos la fecha de creación del cliente como proxy para cuando se registró
    monthly_data = db.query(
        extract('year', ClientModel.created_at).label('year'),
        extract('month', ClientModel.created_at).label('month'),
        func.count(ClientModel.id).label('count')
    ).filter(
        ClientModel.created_at >= start_date,
        # Solo contar clientes que han realizado transacciones
        or_(
            ClientModel.id.in_(
                db.query(TicketModel.client_id).distinct().subquery()
            ),
            ClientModel.id.in_(
                db.query(PackageModel.sender_id).distinct().subquery()
            )
        )
    ).group_by(
        extract('year', ClientModel.created_at),
        extract('month', ClientModel.created_at)
    ).order_by(
        extract('year', ClientModel.created_at),
        extract('month', ClientModel.created_at)
    ).all()
    
    # Crear diccionario para lookup rápido de datos existentes
    data_dict = {}
    for row in monthly_data:
        key = f"{int(row.year)}-{int(row.month)}"
        data_dict[key] = {
            'count': row.count,
            'amount': 0.0  # Los clientes no tienen monto directo
        }
    
    # Generar datos para todos los meses en el rango
    result_data = []
    
    # Nombres de meses en español (abreviados)
    month_names = [
        '', 'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    
    # Generar datos para cada mes
    for i in range(months):
        # Calcular año y mes para esta iteración
        target_year = start_year
        target_month = start_month + i
        
        # Ajustar año si el mes excede 12
        while target_month > 12:
            target_month -= 12
            target_year += 1
        
        month_label = month_names[target_month]
        
        # Buscar datos para este mes
        key = f"{target_year}-{target_month}"
        if key in data_dict:
            count = data_dict[key]['count']
            amount = data_dict[key]['amount']
        else:
            count = 0
            amount = 0.0
        
        result_data.append({
            "month": month_label,
            "label": month_label,
            "value": count,
            "count": count,
            "amount": amount
        })
    
    # Calcular tendencia (comparar últimos 2 meses si hay datos)
    trend = 0.0
    if len(result_data) >= 2:
        current_count = result_data[-1]['count']
        previous_count = result_data[-2]['count']
        if previous_count > 0:
            trend = ((current_count - previous_count) / previous_count) * 100
        elif current_count > 0:
            trend = 100.0
    
    return {
        "data": result_data,
        "trend": round(trend, 2)
    }

@router.get("/packages/delivered/monthly", response_model=MonthlyStats)
async def get_monthly_delivered_packages_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de paquetes entregados"),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas mensuales de paquetes entregados para los últimos N meses
    
    - **months**: Número de meses para obtener estadísticas (por defecto 6)
    
    Retorna:
    - **data**: Lista de datos mensuales con paquetes entregados
    - **trend**: Tendencia general en porcentaje
    """
    # Calcular fechas - obtener los últimos N meses completos
    today = datetime.now().date()
    
    # Calcular la fecha de inicio (N meses atrás desde el primer día del mes actual)
    current_month_start = today.replace(day=1)
    
    # Calcular N-1 meses atrás para obtener N meses en total
    start_year = current_month_start.year
    start_month = current_month_start.month - (months - 1)
    
    # Ajustar año si el mes es negativo
    while start_month <= 0:
        start_month += 12
        start_year -= 1
    
    start_date = date(start_year, start_month, 1)
    
    # Consultar paquetes entregados agrupados por mes y año
    # Usaremos updated_at para determinar cuándo fue entregado el paquete
    monthly_data = db.query(
        extract('year', PackageModel.updated_at).label('year'),
        extract('month', PackageModel.updated_at).label('month'),
        func.count(PackageModel.id).label('count'),
        func.coalesce(
            func.sum(
                db.query(func.sum(PackageItemModel.total_price))
                .filter(PackageItemModel.package_id == PackageModel.id)
                .scalar_subquery()
            ), 0
        ).label('amount')
    ).filter(
        PackageModel.updated_at >= start_date,
        PackageModel.status == 'delivered'  # Solo paquetes entregados
    ).group_by(
        extract('year', PackageModel.updated_at),
        extract('month', PackageModel.updated_at)
    ).order_by(
        extract('year', PackageModel.updated_at),
        extract('month', PackageModel.updated_at)
    ).all()
    
    # Crear diccionario para lookup rápido de datos existentes
    data_dict = {}
    for row in monthly_data:
        key = f"{int(row.year)}-{int(row.month)}"
        data_dict[key] = {
            'count': row.count,
            'amount': float(row.amount)
        }
    
    # Generar datos para todos los meses en el rango
    result_data = []
    
    # Nombres de meses en español (abreviados)
    month_names = [
        '', 'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    
    # Generar datos para cada mes
    for i in range(months):
        # Calcular año y mes para esta iteración
        target_year = start_year
        target_month = start_month + i
        
        # Ajustar año si el mes excede 12
        while target_month > 12:
            target_month -= 12
            target_year += 1
        
        month_label = month_names[target_month]
        
        # Buscar datos para este mes
        key = f"{target_year}-{target_month}"
        if key in data_dict:
            count = data_dict[key]['count']
            amount = data_dict[key]['amount']
        else:
            count = 0
            amount = 0.0
        
        result_data.append({
            "month": month_label,
            "label": month_label,
            "value": count,
            "count": count,
            "amount": amount
        })
    
    # Calcular tendencia (comparar últimos 2 meses si hay datos)
    trend = 0.0
    if len(result_data) >= 2:
        current_count = result_data[-1]['count']
        previous_count = result_data[-2]['count']
        if previous_count > 0:
            trend = ((current_count - previous_count) / previous_count) * 100
        elif current_count > 0:
            trend = 100.0
    
    return {
        "data": result_data,
        "trend": round(trend, 2)
    }
