import pandas as pd
from pathlib import Path

CSV_PATH = Path(__file__).parent.parent / "data" / "energia.csv"

def cargar_y_limpiar() -> pd.DataFrame:
    df = pd.read_csv(CSV_PATH)

    # 1. Limpiar nombres de columnas (espacios, tildes en código)
    df.columns = df.columns.str.strip()

    # 2. Convertir fecha de string a datetime
    df["fecha"] = pd.to_datetime(df["fecha"], format="%Y-%m-%d")

    # 3. Estandarizar tecnología (strip espacios, capitalizar)
    df["tecnología"] = df["tecnología"].str.strip().str.capitalize()

    # 4. Estandarizar departamento
    df["departamento"] = df["departamento"].str.strip()

    # 5. Eliminar duplicados exactos
    df = df.drop_duplicates()

    # 6. Eliminar filas con nulos
    df = df.dropna()

    # 7. Filtrar solo tecnologías válidas
    tecnologias_validas = ["Solar", "Eólica"]
    df = df[df["tecnología"].isin(tecnologias_validas)]

    # 8. Columna auxiliar: mes (para agrupar en gráficas)
    df["mes"] = df["fecha"].dt.to_period("M").dt.to_timestamp()

    # 9. Ordenar cronológicamente
    df = df.sort_values("fecha").reset_index(drop=True)

    return df
