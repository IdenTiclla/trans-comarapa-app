"""
Report routes - monthly reports for tickets, packages, and cash registers.

Admin can see all offices; secretary can only see their own office.
"""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from db.session import get_db
from auth.jwt import get_current_user
from models.user import User
from models.person import Person
from models.secretary import Secretary
from services.report_service import ReportService

router = APIRouter(tags=["reports"])


def _resolve_office_id(current_user: User, requested_office_id: Optional[int], db: Session) -> Optional[int]:
    """Admin can query any office (or None for all). Secretary is restricted to their office."""
    if current_user.role.value == "admin":
        return requested_office_id  # admin chooses; None = all
    # Secretary: force their office
    person = db.query(Person).filter(Person.user_id == current_user.id).first()
    if person and person.type == "secretary":
        sec = db.query(Secretary).filter(Secretary.id == person.id).first()
        if sec and sec.office_id:
            return sec.office_id
    return requested_office_id


def get_service(db: Session = Depends(get_db)) -> ReportService:
    return ReportService(db)


# --- JSON endpoints ---

@router.get("/monthly/tickets", response_model=Dict[str, Any])
async def monthly_ticket_report(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    office_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: ReportService = Depends(get_service),
):
    oid = _resolve_office_id(current_user, office_id, db)
    return service.monthly_ticket_report(year, month, oid)


@router.get("/monthly/packages", response_model=Dict[str, Any])
async def monthly_package_report(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    office_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: ReportService = Depends(get_service),
):
    oid = _resolve_office_id(current_user, office_id, db)
    return service.monthly_package_report(year, month, oid)


@router.get("/monthly/cash", response_model=Dict[str, Any])
async def monthly_cash_report(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    office_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: ReportService = Depends(get_service),
):
    oid = _resolve_office_id(current_user, office_id, db)
    return service.monthly_cash_report(year, month, oid)


# --- CSV export endpoints ---

@router.get("/monthly/tickets/csv")
async def monthly_ticket_report_csv(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    office_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: ReportService = Depends(get_service),
):
    oid = _resolve_office_id(current_user, office_id, db)
    content = service.ticket_report_csv(year, month, oid)
    return StreamingResponse(
        iter([content]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=boletos_{year}_{month:02d}.csv"},
    )


@router.get("/monthly/packages/csv")
async def monthly_package_report_csv(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    office_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: ReportService = Depends(get_service),
):
    oid = _resolve_office_id(current_user, office_id, db)
    content = service.package_report_csv(year, month, oid)
    return StreamingResponse(
        iter([content]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=encomiendas_{year}_{month:02d}.csv"},
    )


@router.get("/monthly/cash/csv")
async def monthly_cash_report_csv(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    office_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: ReportService = Depends(get_service),
):
    oid = _resolve_office_id(current_user, office_id, db)
    content = service.cash_report_csv(year, month, oid)
    return StreamingResponse(
        iter([content]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=caja_{year}_{month:02d}.csv"},
    )
