import csv
from io import StringIO
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from db.session import get_db
from auth.jwt import get_current_user
from models.user import User
from services.financial_summary_service import FinancialSummaryService

router = APIRouter(prefix="/financial", tags=["Financial"])


def get_service(db: Session = Depends(get_db)) -> FinancialSummaryService:
    return FinancialSummaryService(db)


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=403, detail="Solo administradores pueden acceder"
        )
    return current_user


@router.get("/offices-summary")
def get_offices_summary(
    target_date: Optional[date] = Query(None, description="Fecha (default: hoy)"),
    service: FinancialSummaryService = Depends(get_service),
    current_user: User = Depends(require_admin),
):
    """Obtiene resumen financiero de todas las oficinas para una fecha. Solo admin."""
    return service.get_offices_financial_summary(target_date)


@router.get("/withdrawals")
def get_withdrawals(
    office_id: Optional[int] = Query(None, description="Filtrar por oficina"),
    date_from: Optional[date] = Query(None, description="Fecha desde"),
    date_to: Optional[date] = Query(None, description="Fecha hasta"),
    service: FinancialSummaryService = Depends(get_service),
    current_user: User = Depends(require_admin),
):
    """Obtiene historial de retiros. Solo admin."""
    return service.get_withdrawal_history(office_id, date_from, date_to)


@router.get("/withdrawals/csv")
def get_withdrawals_csv(
    office_id: Optional[int] = Query(None, description="Filtrar por oficina"),
    date_from: Optional[date] = Query(None, description="Fecha desde"),
    date_to: Optional[date] = Query(None, description="Fecha hasta"),
    service: FinancialSummaryService = Depends(get_service),
    current_user: User = Depends(require_admin),
):
    """Descarga historial de retiros en CSV. Solo admin."""
    withdrawals = service.get_withdrawal_history(office_id, date_from, date_to)

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "ID",
            "Fecha",
            "Oficina",
            "Monto (Bs)",
            "Motivo",
            "Registrado por",
            "Fecha/Hora",
        ]
    )

    for w in withdrawals:
        writer.writerow(
            [
                w["id"],
                w["date"],
                w["office_name"],
                f"{w['amount']:.2f}",
                w["description"] or "",
                w["registered_by"],
                w["created_at"],
            ]
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=retiros_{date_from or 'all'}_{date_to or 'all'}.csv"
        },
    )


@router.get("/collections-by-office")
def get_collections_by_office(
    target_date: Optional[date] = Query(None, description="Fecha (default: hoy)"),
    service: FinancialSummaryService = Depends(get_service),
    current_user: User = Depends(require_admin),
):
    """Obtiene desglose de cobros POR_COBRAR_COLLECTION por oficina. Solo admin."""
    return service.get_collections_by_office(target_date)
