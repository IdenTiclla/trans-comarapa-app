from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from db.session import get_db
from auth.jwt import get_current_user
from models.user import User
from schemas.stats import (
    TicketStats,
    PackageStats,
    TripStats,
    ReservedTicketStats,
    MonthlyStats,
    DashboardStats,
    TicketsSummaryStats,
    CashSummaryResponse,
)
from services.stats_service import StatsService

router = APIRouter(tags=["Statistics"])


def get_service(db: Session = Depends(get_db)) -> StatsService:
    return StatsService(db)


@router.get("/tickets/stats", response_model=TicketStats)
async def get_ticket_stats(
    period: str = Query("today", description="Período: today, yesterday, week, month, year"),
    service: StatsService = Depends(get_service),
):
    return service.get_ticket_stats(period)


@router.get("/packages/stats", response_model=PackageStats)
async def get_package_stats(
    period: str = Query("today", description="Período: today, yesterday, week, month, year"),
    service: StatsService = Depends(get_service),
):
    return service.get_package_stats(period)


@router.get("/trips/stats", response_model=TripStats)
async def get_trip_stats(
    period: str = Query("today", description="Período: today, yesterday, week, month, year"),
    service: StatsService = Depends(get_service),
):
    return service.get_trip_stats(period)


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    period: str = Query("today", description="Período: today, yesterday, week, month, year"),
    service: StatsService = Depends(get_service),
):
    return service.get_dashboard_stats(period)


@router.get("/tickets/summary-stats", response_model=TicketsSummaryStats)
async def get_tickets_summary_stats(
    period: str = Query("today", description="Período: today, yesterday, week, month, year"),
    service: StatsService = Depends(get_service),
):
    return service.get_tickets_summary(period)


@router.get("/trips/upcoming", response_model=List[dict])
async def get_upcoming_trips(
    limit: int = Query(5, description="Número máximo de viajes a retornar"),
    service: StatsService = Depends(get_service),
):
    return service.get_upcoming_trips(limit)


@router.get("/sales/recent", response_model=List[dict])
async def get_recent_sales(
    limit: int = Query(5, description="Número máximo de ventas a retornar"),
    service: StatsService = Depends(get_service),
):
    return service.get_recent_sales(limit)


@router.get("/sales/summary", response_model=dict)
async def get_sales_summary(
    period: str = Query("today", description="Período: today, yesterday, week, month, year"),
    service: StatsService = Depends(get_service),
):
    return service.get_sales_summary(period)


@router.get("/tickets/reserved/stats", response_model=ReservedTicketStats)
async def get_reserved_ticket_stats(
    period: str = Query("today", description="Período: today, yesterday, week, month, year"),
    service: StatsService = Depends(get_service),
):
    return service.get_reserved_ticket_stats(period)


@router.get("/tickets/monthly", response_model=MonthlyStats)
async def get_monthly_ticket_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas"),
    service: StatsService = Depends(get_service),
):
    return service.get_monthly_ticket_stats(months)


@router.get("/reservations/monthly", response_model=MonthlyStats)
async def get_monthly_reservation_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de reservas"),
    service: StatsService = Depends(get_service),
):
    return service.get_monthly_reservation_stats(months)


@router.get("/packages/monthly", response_model=MonthlyStats)
async def get_monthly_package_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de paquetes"),
    service: StatsService = Depends(get_service),
):
    return service.get_monthly_package_stats(months)


@router.get("/trips/monthly", response_model=MonthlyStats)
async def get_monthly_trip_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de viajes"),
    service: StatsService = Depends(get_service),
):
    return service.get_monthly_trip_stats(months)


@router.get("/revenue/monthly", response_model=MonthlyStats)
async def get_monthly_revenue_stats(
    months: int = Query(6, description="Número de meses para las estadísticas históricas de ingresos"),
    service: StatsService = Depends(get_service),
):
    return service.get_monthly_revenue_stats(months)


@router.get("/tickets/revenue/monthly", response_model=MonthlyStats)
async def get_monthly_ticket_revenue_stats(
    months: int = Query(6, description="Número de meses para las estadísticas de ingresos por boletos"),
    service: StatsService = Depends(get_service),
):
    return service.get_monthly_ticket_revenue_stats(months)


@router.get("/packages/revenue/monthly", response_model=MonthlyStats)
async def get_monthly_package_revenue_stats(
    months: int = Query(6, description="Número de meses para las estadísticas de ingresos por paquetes"),
    service: StatsService = Depends(get_service),
):
    return service.get_monthly_package_revenue_stats(months)


@router.get("/tickets/cancelled/monthly", response_model=MonthlyStats)
async def get_monthly_cancelled_ticket_stats(
    months: int = Query(6, description="Número de meses para las estadísticas de boletos cancelados"),
    service: StatsService = Depends(get_service),
):
    return service.get_monthly_cancelled_ticket_stats(months)


@router.get("/trips/completed/monthly", response_model=MonthlyStats)
async def get_monthly_completed_trip_stats(
    months: int = Query(6, description="Número de meses para las estadísticas de viajes completados"),
    service: StatsService = Depends(get_service),
):
    return service.get_monthly_completed_trip_stats(months)


@router.get("/trips/cancelled/monthly", response_model=MonthlyStats)
async def get_monthly_cancelled_trip_stats(
    months: int = Query(6, description="Número de meses para las estadísticas de viajes cancelados"),
    service: StatsService = Depends(get_service),
):
    return service.get_monthly_cancelled_trip_stats(months)


@router.get("/clients/feedback/monthly", response_model=MonthlyStats)
async def get_monthly_client_feedback_stats(
    months: int = Query(6, description="Número de meses para las estadísticas de feedback de clientes"),
    service: StatsService = Depends(get_service),
):
    return service.get_monthly_client_feedback_stats(months)


@router.get("/clients/registered/monthly", response_model=MonthlyStats)
async def get_monthly_registered_clients_stats(
    months: int = Query(6, description="Número de meses para las estadísticas de clientes registrados"),
    service: StatsService = Depends(get_service),
):
    return service.get_monthly_registered_clients_stats(months)


@router.get("/packages/delivered/monthly", response_model=MonthlyStats)
async def get_monthly_delivered_packages_stats(
    months: int = Query(6, description="Número de meses para las estadísticas de paquetes entregados"),
    service: StatsService = Depends(get_service),
):
    return service.get_monthly_delivered_packages_stats(months)


@router.get("/reservations/cancelled/monthly", response_model=MonthlyStats)
async def get_monthly_cancelled_reservation_stats(
    months: int = Query(6, description="Número de meses para las estadísticas de reservaciones canceladas"),
    service: StatsService = Depends(get_service),
):
    return service.get_monthly_cancelled_reservation_stats(months)


@router.get("/cash-summary", response_model=CashSummaryResponse)
async def get_cash_summary(
    current_user: User = Depends(get_current_user),
    service: StatsService = Depends(get_service),
):
    return service.get_cash_summary(current_user)
