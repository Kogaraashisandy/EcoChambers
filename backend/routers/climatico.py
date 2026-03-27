from fastapi import APIRouter
from services.climatico import (
    resumen_por_departamento,
    series_temporales,
    zonas_optimas,
)

router = APIRouter(prefix="/api/climatico", tags=["climatico"])


@router.get("/resumen")
def get_resumen():
    return resumen_por_departamento()


@router.get("/series")
def get_series():
    return series_temporales()


@router.get("/zonas-optimas")
def get_zonas_optimas():
    return zonas_optimas()
