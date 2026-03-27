import pandas as pd
from pathlib import Path

CSV_PATH = Path(__file__).parent.parent / "data" / "climatico.csv"

def cargar_y_limpiar_climatico() -> pd.DataFrame:
    df = pd.read_csv(CSV_PATH)

    # 1. Limpiar nombres de columnas
    df.columns = df.columns.str.strip()

    # 2. Convertir fecha a datetime
    df["fecha"] = pd.to_datetime(df["fecha"], format="%Y-%m-%d")

    # 3. Limpiar departamentos
    df["departamento"] = df["departamento"].str.strip()

    # 4. Eliminar duplicados y nulos
    df = df.drop_duplicates().dropna()

    # 5. Validar rangos físicos razonables
    df = df[df["radiacion_solar_kw_m2"].between(0, 12)]
    df = df[df["velocidad_viento_m_s"].between(0, 25)]
    df = df[df["temperatura_promedio"].between(15, 50)]

    # 6. Columna auxiliar de mes
    df["mes"] = df["fecha"].dt.to_period("M").dt.to_timestamp()

    # 7. Ordenar cronológicamente
    df = df.sort_values("fecha").reset_index(drop=True)

    return df
