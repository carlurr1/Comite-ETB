# Comité ETB — Tablero de soporte por segmento

Genera el tablero del **comité de soporte** por segmento (Mayoristas, Distrito,
Élite, Gold, Premium) con el estilo visual eTb, a partir de los archivos de la
semana. Produce imágenes **PNG** listas para copiar/pegar en la presentación.

Hay dos formas de usarlo:

- **Web (recomendada, sin instalar nada):** [`web/tablero.html`](web/tablero.html).
- **CLI (línea de comandos):** scripts de `cli/`.

---

## Web — `web/tablero.html`

Página autónoma (un solo archivo, SheetJS y logo eTb incrustados; funciona
**offline**).

1. Abre `web/tablero.html` con doble clic (Chrome/Edge).
2. Sube los archivos de la semana:
   - **Semáforo de soporte** → indicadores operativos (Resolutividad, TMS) por segmento.
   - **Bolsa de INC** (`Bolsa_*.xlsx`) → tabla de INC en gestión (OTROS).
   - **Base de clientes** → clasifica la bolsa por segmento (NIT → `AGENTE_SEGUIMIENTO`).
   - **Llamadas (ACD)** (`NS_SOPORTE.xls`) → indicadores de atención (general).
   - **Datos base** (opcional) → hojas `Evolutivo` / `CasosMes` / `Desglose`.
3. Completa **Corte** y **Solicitudes Mail**.
4. **Generar tablero** → botón **PNG** en cada bloque (o **Descargar todas**).

---

## CLI

```bash
npm install
npm run graficas:plantilla                       # crea plantilla-comite.xlsx de ejemplo
npm run graficas -- ./datos.xlsx ./salida \
  --llamadas ./NS_SOPORTE.xls \
  --semaforo ./ETB_Semaforo_Soporte.xlsx \
  --bolsa ./Bolsa_08072026.xlsx --clientes ./base_clientes.xlsx
# inspección rápida:
npm run graficas:llamadas -- ./NS_SOPORTE.xls
npm run graficas:semaforo -- ./ETB_Semaforo_Soporte.xlsx
```

El CLI usa el Chromium de Playwright para renderizar; si hace falta apuntar a un
binario concreto, exporta `PLAYWRIGHT_CHROMIUM`.

---

## Reglas de cálculo (resumen)

| Bloque | Fuente | Cálculo |
|---|---|---|
| **Atención** (NS, NA, AHT) | Llamadas ACD | promedio diario |
| **Atención** (Ofrecidas, Atendidas) | Llamadas ACD | total del período |
| **Solicitudes Mail** | manual | — |
| **Casos creados por llamada** | Semáforo, `Origen del caso` (col V), `BASE=Ingresos` | conteo de ingresos telefónicos |
| **Resolutividad** (`%SNU`, Sin COFO) | Semáforo, hoja `SN1` | leído de la tabla oficial |
| **TMS** (Sin COFO) | Semáforo, hoja `TMS` | leído de la tabla oficial |
| **TMS Telefónico / Correo N1, Nivel 2** | Semáforo `BBDD` | promedio TMS por canal / nivel |
| **Bolsa INC (OTROS)** | Bolsa + Base de clientes | estado × días abiertos, segmento por NIT |

- **Metas por segmento**: Resolutividad y TMS por segmento; NS 80% / NA 95% generales.
- **Nivel 1 (HDP)** = área de solución empieza por `HDP`; **Nivel 2** = escalado (≠ HDP).

## Estructura

```
web/tablero.html     Herramienta web autónoma (uso semanal)
cli/                 Versión de línea de comandos (TypeScript, tsx)
assets/etb.png       Logo eTb (para el CLI)
```

## Pendiente

- Fuente del evolutivo semanal, casos finales por mes y desglose COFO/OTROS
  (hoy se cargan desde un Excel "Datos base" opcional).
