from fastapi import APIRouter
from services.analisis   import produccion_mensual, produccion_por_departamento, stats_generales
from services.prediccion import predecir_especifico
from services.insights   import generar_insights

router = APIRouter(prefix="/api", tags=["energia"])

@router.get("/stats")
def get_stats():
    return stats_generales()

@router.get("/produccion-mensual")
def get_produccion_mensual():
    return produccion_mensual()

@router.get("/por-departamento")
def get_por_departamento():
    return produccion_por_departamento()

@router.get("/prediccion")
def get_prediccion(departamento: str, tecnologia: str, meses: int = 12):
    return predecir_especifico(departamento, tecnologia, meses)

@router.get("/insights")
def get_insights():
    return generar_insights()
