import pandas as pd
from services.limpieza_climatico import cargar_y_limpiar_climatico

def resumen_por_departamento():
    df = cargar_y_limpiar_climatico()

    resumen = (
        df.groupby("departamento")
        .agg(
            radiacion_promedio  = ("radiacion_solar_kw_m2", "mean"),
            radiacion_max       = ("radiacion_solar_kw_m2", "max"),
            viento_promedio     = ("velocidad_viento_m_s",  "mean"),
            viento_max          = ("velocidad_viento_m_s",  "max"),
            temperatura_promedio= ("temperatura_promedio",  "mean"),
            temperatura_max     = ("temperatura_promedio",  "max"),
        )
        .reset_index()
    )

    # Redondear a 2 decimales
    cols_num = [c for c in resumen.columns if c != "departamento"]
    resumen[cols_num] = resumen[cols_num].round(2)

    # Clasificar aptitud solar y eólica por departamento
    rad_max   = resumen["radiacion_promedio"].max()
    viento_max_val = resumen["viento_promedio"].max()

    def _aptitud_solar(rad):
        if rad >= rad_max * 0.95:   return "óptima"
        elif rad >= rad_max * 0.88: return "alta"
        elif rad >= rad_max * 0.80: return "media"
        else:                       return "baja"

    def _aptitud_eolica(v):
        if v >= viento_max_val * 0.95:   return "óptima"
        elif v >= viento_max_val * 0.75: return "alta"
        elif v >= viento_max_val * 0.60: return "media"
        else:                            return "baja"

    resumen["aptitud_solar"]  = resumen["radiacion_promedio"].apply(_aptitud_solar)
    resumen["aptitud_eolica"] = resumen["viento_promedio"].apply(_aptitud_eolica)

    # Ranking 1-4 por cada variable
    resumen["ranking_solar"]  = resumen["radiacion_promedio"].rank(ascending=False).astype(int)
    resumen["ranking_eolico"] = resumen["viento_promedio"].rank(ascending=False).astype(int)

    return resumen.to_dict(orient="records")


def series_temporales():
    df = cargar_y_limpiar_climatico()

    # Promedio mensual por departamento de las 3 variables
    series = (
        df.groupby(["mes", "departamento"])
        .agg(
            radiacion = ("radiacion_solar_kw_m2", "mean"),
            viento    = ("velocidad_viento_m_s",  "mean"),
            temperatura = ("temperatura_promedio", "mean"),
        )
        .reset_index()
    )

    series["mes"]       = series["mes"].dt.strftime("%Y-%m")
    series[["radiacion", "viento", "temperatura"]] = (
        series[["radiacion", "viento", "temperatura"]].round(2)
    )

    return series.to_dict(orient="records")


def zonas_optimas():
    df = cargar_y_limpiar_climatico()

    por_depto = (
        df.groupby("departamento")
        .agg(
            radiacion = ("radiacion_solar_kw_m2", "mean"),
            viento    = ("velocidad_viento_m_s",  "mean"),
            temp      = ("temperatura_promedio",   "mean"),
        )
        .round(2)
    )

    # Zona óptima solar — mayor radiación
    lider_solar = por_depto["radiacion"].idxmax()
    # Zona óptima eólica — mayor viento consistente
    lider_eolico = por_depto["viento"].idxmax()

    # Score combinado para renovables en general
    # Normalizar cada variable 0-1 y promediar
    rad_norm    = (por_depto["radiacion"] - por_depto["radiacion"].min()) / \
                  (por_depto["radiacion"].max() - por_depto["radiacion"].min())
    viento_norm = (por_depto["viento"] - por_depto["viento"].min()) / \
                  (por_depto["viento"].max() - por_depto["viento"].min())
    # Temperatura alta penaliza eficiencia de paneles solares levemente
    temp_norm   = 1 - (por_depto["temp"] - por_depto["temp"].min()) / \
                  (por_depto["temp"].max() - por_depto["temp"].min())

    por_depto["score_renovable"] = (
        (rad_norm * 0.45) + (viento_norm * 0.40) + (temp_norm * 0.15)
    ).round(3)

    lider_general = por_depto["score_renovable"].idxmax()

    ranking = (
        por_depto.reset_index()
        .sort_values("score_renovable", ascending=False)
        [["departamento", "radiacion", "viento", "temp", "score_renovable"]]
        .rename(columns={"temp": "temperatura"})
    )

    return {
        "zona_optima_solar":   lider_solar,
        "zona_optima_eolica":  lider_eolico,
        "zona_optima_general": lider_general,
        "ranking": ranking.to_dict(orient="records"),
        "metodologia": (
            "Score compuesto: 45% radiación solar, 40% velocidad viento, "
            "15% penalización por temperatura (valores altos reducen "
            "eficiencia fotovoltaica). Fuente: Atlas IDEAM-UPME."
        ),
    }
