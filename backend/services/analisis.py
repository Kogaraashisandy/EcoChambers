from services.limpieza import cargar_y_limpiar

def produccion_mensual():
    import pandas as pd
    from itertools import product

    df = cargar_y_limpiar()

    grouped = (
        df.groupby([df["mes"].dt.strftime("%Y-%m"), "departamento", "tecnología"])
        ["producción_mwh"].sum()
        .reset_index()
    )
    grouped.columns = ["mes", "departamento", "tecnología", "producción_mwh"]

    # Rango completo de meses del dataset
    todos_meses = sorted(grouped["mes"].unique())
    deptos      = grouped["departamento"].unique()
    techs       = grouped["tecnología"].unique()

    # Combinaciones completas
    combos = pd.DataFrame(
        list(product(todos_meses, deptos, techs)),
        columns=["mes", "departamento", "tecnología"]
    )

    resultado = combos.merge(
        grouped, on=["mes", "departamento", "tecnología"], how="left"
    )

    # Interpolación lineal por grupo — estima los huecos
    resultado = resultado.sort_values(["departamento", "tecnología", "mes"])
    resultado["producción_mwh"] = (
        resultado
        .groupby(["departamento", "tecnología"])["producción_mwh"]
        .transform(lambda s: s.interpolate(method="linear", limit_direction="both"))
    )

    resultado["producción_mwh"] = resultado["producción_mwh"].round().astype(int)
    resultado = resultado.sort_values("mes").reset_index(drop=True)

    return resultado.to_dict(orient="records")
def produccion_por_departamento():
    df = cargar_y_limpiar()
    grouped = (
        df.groupby(["departamento", "tecnología"])["producción_mwh"]
        .sum()
        .reset_index()
    )
    return grouped.to_dict(orient="records")

def stats_generales():
    df = cargar_y_limpiar()
    por_tech  = df.groupby("tecnología")["producción_mwh"].sum()
    por_depto = df.groupby("departamento")["producción_mwh"].sum()
    return {
        "total_mwh":           int(df["producción_mwh"].sum()),
        "solar_mwh":           int(por_tech.get("Solar", 0)),
        "eolica_mwh":          int(por_tech.get("Eólica", 0)),
        "departamento_lider":  por_depto.idxmax(),
        "departamentos":       int(df["departamento"].nunique()),
    }
