from fastapi import APIRouter, Query
from typing import Optional
from app.services.alert_service import alert_service

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("")
def get_alerts(machine_id: Optional[str] = None, severity: Optional[str] = None):
    """Get system alert timeline list with optional filtering."""
    return alert_service.get_alerts(machine_id=machine_id, severity=severity)

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    """Mark an active alert as resolved."""
    success = alert_service.resolve_alert(alert_id)
    return {"success": success, "alert_id": alert_id}
