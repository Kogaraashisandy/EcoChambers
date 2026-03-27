import datetime
import pandas as pd
from prophet import Prophet
from services.limpieza import cargar_y_limpiar

def meses_hasta_fin_2026(ultimo_mes: pd.Timestamp) -> int:
    fin = pd.Timestamp("2026-12-01")
    diff = (fin.year - ultimo_mes.year) * 12 + (fin.month - ultimo_mes.month)
    return max(diff, 6)

def predecir_por_departamento_tecnologia():
    df = cargar_y_limpiar()
    resultados = []

    combos = df[["departamento", "tecnología"]].drop_duplicates().values

    for departamento, tecnologia in combos:
        subset = (
            df[(df["departamento"] == departamento) & (df["tecnología"] == tecnologia)]
            .groupby("mes")["producción_mwh"]
            .sum()
            .reset_index()
            .rename(columns={"mes": "ds", "producción_mwh": "y"})
        )

        if len(subset) < 4:
            continue

        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=False,
            daily_seasonality=False,
            changepoint_prior_scale=0.05,  # evita overfitting con pocos datos
            interval_width=0.80,
        )
        model.fit(subset)

        future   = model.make_future_dataframe(periods=12, freq="MS")
        forecast = model.predict(future)

        historico = subset.copy()
        historico["ds"] = historico["ds"].dt.strftime("%Y-%m")

        pred = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].copy()
        pred["ds"] = pd.to_datetime(pred["ds"]).dt.strftime("%Y-%m")
        pred = pred.rename(columns={
            "ds":         "fecha",
            "yhat":       "prediccion",
            "yhat_lower": "min",
            "yhat_upper": "max",
        })

        resultados.append({
            "departamento": departamento,
            "tecnologia":   tecnologia,
            "historico":    historico.rename(columns={"ds": "fecha", "y": "real"}).to_dict(orient="records"),
            "prediccion":   pred.to_dict(orient="records"),
        })

    return resultados

def predecir_especifico(departamento: str, tecnologia: str, meses: int):
    df = cargar_y_limpiar()
    subset = (
        df[(df["departamento"] == departamento) & (df["tecnología"] == tecnologia)]
        .groupby("mes")["producción_mwh"].sum()
        .reset_index()
        .rename(columns={"mes": "ds", "producción_mwh": "y"})
    )
    if len(subset) < 4:
        return {"error": "datos insuficientes"}

    model = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=False,
        daily_seasonality=False,
        changepoint_prior_scale=0.05,
        interval_width=0.80,
    )
    model.fit(subset)
    future   = model.make_future_dataframe(periods=meses, freq="MS")
    forecast = model.predict(future)
    if meses is None:
        meses = meses_hasta_fin_2026(subset["ds"].max())
    historico = subset.copy()
    historico["ds"] = historico["ds"].dt.strftime("%Y-%m")

    pred = forecast[["ds","yhat","yhat_lower","yhat_upper"]].copy()
    pred["ds"] = pd.to_datetime(pred["ds"]).dt.strftime("%Y-%m")
    pred = pred.rename(columns={"ds":"fecha","yhat":"prediccion","yhat_lower":"min","yhat_upper":"max"})

    return {
        "departamento": departamento,
        "tecnologia":   tecnologia,
        "historico":    historico.rename(columns={"ds":"fecha","y":"real"}).to_dict(orient="records"),
        "prediccion":   pred.to_dict(orient="records"),
    }
