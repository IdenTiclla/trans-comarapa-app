"""
Package routes - thin HTTP adapter that delegates to PackageService.

All business logic lives in services/package_service.py.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Dict

from db.session import get_db
from schemas.package import (
    PackageResponse, PackageCreate, PackageUpdate, PackageSummary,
    PackageAssignTrip, PackageStatusUpdate,
)
from schemas.package_item import PackageItemCreate, PackageItemResponse, PackageItemUpdate
from services.package_service import PackageService

router = APIRouter(tags=["Packages"])


def get_service(db: Session = Depends(get_db)) -> PackageService:
    return PackageService(db)


# ============================================================
# IMPORTANT: Routes with fixed paths MUST come before /{id}
# ============================================================

@router.get("/unassigned", response_model=List[PackageSummary])
async def get_unassigned_packages(
    skip: int = 0, limit: int = 100, service: PackageService = Depends(get_service)
):
    """Get unassigned packages (registered_at_office)."""
    packages = service.get_unassigned(skip, limit)
    return [PackageService.to_summary(pkg) for pkg in packages]


@router.get("", response_model=List[PackageSummary])
async def get_packages(
    skip: int = 0, limit: int = 100, status: str = None,
    service: PackageService = Depends(get_service),
):
    """Get packages list with optional status filter."""
    packages = service.get_all(skip, limit, status)
    return [PackageService.to_summary(pkg) for pkg in packages]


@router.post("", response_model=PackageResponse)
async def create_package(package: PackageCreate, service: PackageService = Depends(get_service)):
    """Create a new package with items."""
    return service.create_package(package)


@router.get("/{package_id}", response_model=PackageResponse)
async def get_package(package_id: int, service: PackageService = Depends(get_service)):
    """Get a package by ID."""
    return service.get_by_id(package_id)


@router.get("/tracking/{tracking_number}", response_model=PackageResponse)
async def get_package_by_tracking(tracking_number: str, service: PackageService = Depends(get_service)):
    """Get a package by tracking number."""
    return service.get_by_tracking(tracking_number)


@router.put("/{package_id}", response_model=PackageResponse)
async def update_package(
    package_id: int, package: PackageUpdate, service: PackageService = Depends(get_service)
):
    """Update package metadata."""
    return service.update_package(package_id, package)


@router.delete("/{package_id}", response_model=Dict[str, str])
async def delete_package(package_id: int, service: PackageService = Depends(get_service)):
    """Delete a package and all items."""
    tracking = service.delete_package(package_id)
    return {"message": f"Package {tracking} and all its items have been successfully deleted"}


# ── Trip assignment ──────────────────────────────────────────────────

@router.put("/{package_id}/assign-trip", response_model=PackageResponse)
async def assign_package_to_trip(
    package_id: int, assign_data: PackageAssignTrip,
    service: PackageService = Depends(get_service),
):
    """Assign a package to a trip."""
    return service.assign_to_trip(package_id, assign_data)


@router.put("/{package_id}/unassign-trip", response_model=PackageResponse)
async def unassign_package_from_trip(
    package_id: int, service: PackageService = Depends(get_service)
):
    """Remove a package from its assigned trip."""
    return service.unassign_from_trip(package_id)


@router.put("/{package_id}/update-status", response_model=PackageResponse)
async def update_package_status(
    package_id: int, status_update: PackageStatusUpdate,
    service: PackageService = Depends(get_service),
):
    """Update package status."""
    return service.update_status(package_id, status_update)


# ── Package items ────────────────────────────────────────────────────

@router.get("/{package_id}/items", response_model=List[PackageItemResponse])
async def get_package_items(package_id: int, service: PackageService = Depends(get_service)):
    """Get all items for a package."""
    return service.get_items(package_id)


@router.post("/{package_id}/items", response_model=PackageItemResponse)
async def add_package_item(
    package_id: int, item: PackageItemCreate, service: PackageService = Depends(get_service)
):
    """Add an item to a package."""
    return service.add_item(package_id, item)


@router.put("/items/{item_id}", response_model=PackageItemResponse)
async def update_package_item(
    item_id: int, item: PackageItemUpdate, service: PackageService = Depends(get_service)
):
    """Update a package item."""
    return service.update_item(item_id, item)


@router.delete("/items/{item_id}", response_model=Dict[str, str])
async def delete_package_item(item_id: int, service: PackageService = Depends(get_service)):
    """Delete a package item."""
    service.delete_item(item_id)
    return {"message": f"Package item {item_id} has been successfully deleted"}


# ── Filtering by client and trip ─────────────────────────────────────

@router.get("/by-sender/{client_id}", response_model=List[PackageSummary])
async def get_packages_by_sender(client_id: int, service: PackageService = Depends(get_service)):
    """Get packages sent by a client."""
    return [PackageService.to_summary(pkg) for pkg in service.get_by_sender(client_id)]


@router.get("/by-recipient/{client_id}", response_model=List[PackageSummary])
async def get_packages_by_recipient(client_id: int, service: PackageService = Depends(get_service)):
    """Get packages received by a client."""
    return [PackageService.to_summary(pkg) for pkg in service.get_by_recipient(client_id)]


@router.get("/by-trip/{trip_id}", response_model=List[PackageSummary])
async def get_packages_by_trip(trip_id: int, service: PackageService = Depends(get_service)):
    """Get packages for a trip."""
    return [PackageService.to_summary(pkg) for pkg in service.get_by_trip(trip_id)]
