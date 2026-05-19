"""
Loader y validador del golden dataset compartido con RAGAS y DeepEval.

Equivalente Python de goldenDataset.ts — leen el mismo data/seeds/golden-dataset.json
para que toda la suite (TS + Python) trabaje sobre la misma fuente de verdad.

Uso:
    from golden_dataset import load_golden, filter_rag_pairs
    dataset = load_golden()
    pairs = filter_rag_pairs(dataset)
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

# Resolver respecto a la raíz del repo (4 niveles arriba):
# uc-08-evaluacion-testing/src/evaluation/golden_dataset.py
REPO_ROOT = Path(__file__).resolve().parents[3]
GOLDEN_PATH = REPO_ROOT / "data" / "seeds" / "golden-dataset.json"
CATALOGO_PATH = REPO_ROOT / "data" / "seeds" / "propiedades.json"

# Categorías donde expectedPropertyIds = [] es válido (preguntas conceptuales)
CATEGORIES_ALLOW_EMPTY = {"fuera-de-rango", "conversacional"}


def load_golden() -> list[dict[str, Any]]:
    """Carga las 20 preguntas. Lanza FileNotFoundError si el seed no está generado."""
    with GOLDEN_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    return data["preguntas"]


def load_catalog_ids() -> set[str]:
    """IDs de propiedades del catálogo — para validar referencias del dataset."""
    with CATALOGO_PATH.open(encoding="utf-8") as f:
        return {p["id"] for p in json.load(f)}


def filter_rag_pairs(dataset: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Devuelve solo las preguntas que sirven para evaluar RAG:
    - tienen propiedades esperadas (expectedPropertyIds no vacío)
    - no son conceptuales (fuera-de-rango, conversacional)
    """
    return [p for p in dataset if p["expectedPropertyIds"] and p["categoria"] not in CATEGORIES_ALLOW_EMPTY]


def filter_conceptual(dataset: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Preguntas conceptuales — se evalúan con métricas de comportamiento defensivo."""
    return [p for p in dataset if p["categoria"] in CATEGORIES_ALLOW_EMPTY]


if __name__ == "__main__":
    dataset = load_golden()
    rag_pairs = filter_rag_pairs(dataset)
    conceptual = filter_conceptual(dataset)
    print(f"Total preguntas: {len(dataset)}")
    print(f"  Para RAG (RAGAS):       {len(rag_pairs)}")
    print(f"  Conceptuales/fuera:     {len(conceptual)}")
    print("\nMuestras:")
    for q in dataset[:3]:
        print(f"  [{q['categoria']}] {q['question']}")
