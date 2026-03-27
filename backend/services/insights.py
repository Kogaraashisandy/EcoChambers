import numpy as np
from services.limpieza import cargar_y_limpiar

def _tasa_crecimiento_robusta(serie):
    """
    Compara promedio último trimestre vs primer trimestre.
    Más estable que regresión lineal con datos irregulares.
    """
    if len(serie) < 4:
        return 0.0
    n       = len(serie)
    inicio  = serie.iloc[:n//4].mean()
    fin     = serie.iloc[-n//4:].mean()
    if inicio == 0:
        return 0.0
    return round(float((fin - inicio) / inicio * 100), 1)

def _clasificar_potencial(tasa):
    if tasa >= 10:
        return "alto"
    elif tasa >= -25:   # ← antes era -10, Magdalena queda en medio
        return "medio"
    else:
        return "bajo"

def generar_insights():
    df = cargar_y_limpiar()

    # ── Potencial por departamento ────────────────────────────────────────
    potencial = []
    for depto in df["departamento"].unique():
        serie = (
            df[df["departamento"] == depto]
            .groupby("mes")["producción_mwh"]
            .sum()
            .sort_index()
        )
        tasa = _tasa_crecimiento_robusta(serie)
        potencial.append({
            "departamento":         depto,
            "tasa_crecimiento_pct": tasa,
            "potencial":            _clasificar_potencial(tasa),
            "total_mwh":            int(serie.sum()),
        })

    potencial.sort(key=lambda x: x["tasa_crecimiento_pct"], reverse=True)

    # ── Estacionalidad ────────────────────────────────────────────────────
    mensual    = df.groupby(df["fecha"].dt.month)["producción_mwh"].sum()
    mes_pico_n = int(mensual.idxmax())
    meses_es   = ["","enero","febrero","marzo","abril","mayo","junio",
                  "julio","agosto","septiembre","octubre","noviembre","diciembre"]
    mes_pico   = meses_es[mes_pico_n]

    # ── Tecnología dominante ──────────────────────────────────────────────
    por_tech    = df.groupby("tecnología")["producción_mwh"].sum()
    tech_lider  = por_tech.idxmax()
    tech_pct    = round(float(por_tech.max() / por_tech.sum() * 100), 1)

    # ── Recomendación ─────────────────────────────────────────────────────
    top = potencial[0]
    return {
        "potencial_por_departamento": potencial,
        "estacionalidad": {
            "mes_pico":    mes_pico,
            "mes_pico_num": mes_pico_n,
            "descripcion": f"La producción alcanza su punto máximo en {mes_pico}, "
                           f"lo que sugiere condiciones climáticas favorables en ese período.",
        },
        "tecnologia_dominante": {
            "tecnologia":  tech_lider,
            "porcentaje":  tech_pct,
            "descripcion": f"La energía {tech_lider.lower()} representa el {tech_pct}% "
                           f"de la producción total en la región.",
        },
        "recomendacion_inversion": {
            "departamento": top["departamento"],
            "razon":        f"presenta la mayor tasa de crecimiento ({top['tasa_crecimiento_pct']}%)",
            "descripcion":  f"Con base en el análisis de tendencias, {top['departamento']} "
                           f"muestra el crecimiento más acelerado de la región con un "
                           f"{top['tasa_crecimiento_pct']}% de variación entre el primer "
                           f"y último trimestre de 2024. Priorizar inversión en "
                           f"infraestructura {tech_lider.lower()} en esta zona "
                           f"maximizaría el retorno energético.",
        },
    }
