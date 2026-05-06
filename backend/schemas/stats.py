from typing import List
from pydantic import BaseModel


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


class ReservedTicketStats(BaseModel):
    count: int
    trend: float
    period: str


class MonthlyDataPoint(BaseModel):
    month: str
    label: str
    value: float
    count: int
    amount: float


class MonthlyStats(BaseModel):
    data: List[MonthlyDataPoint]
    trend: float


class DashboardStats(BaseModel):
    tickets: TicketStats
    packages: PackageStats
    trips: TripStats


class TicketsSummaryStats(BaseModel):
    confirmed: int
    pending: int
    cancelled: int
    totalRevenue: float
    period: str


class CashSummaryResponse(BaseModel):
    total_income_today: float
    total_withdrawals_today: float
    registers_open: int
    total_available: float
