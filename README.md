# Comité ETB — Tablero de soporte por segmento

Genera el tablero del **comité de soporte** por segmento (Mayoristas, Distrito,
Élite, Gold, Premium) con el estilo visual eTb, a partir de los archivos de la
semana. Produce imágenes **PNG** listas para copiar/pegar en la presentación.

Hay dos formas de usarlo:

- **Web (recomendada, sin instalar nada):** [`index.html`](index.html) — desplegada en Vercel.
- **CLI (línea de comandos):** scripts de `cli/`.

---

## Web — `index.html`

Página autónoma (un solo archivo, SheetJS y logo eTb incrustados; funciona
**offline**).

1. Entra a la URL de Vercel (o abre `index.html` con doble clic en Chrome/Edge).
2. Sube los archivos de la semana:
   - **Semáforo de soporte** → operativos por segmento **Sin y Con COFO** (Resolutividad,
     TMS, TMS N2 por área, TMS por tipo de falla) y casos creados por canal.
   - **Bolsa de INC** (`Bolsa_*.xlsx`) → **toda la bolsa**: división HDP/escalados
     (CPE, GPON, COFO, OTROS) + tabla de INC en gestión (OTROS).
   - **Base de clientes** → clasifica la bolsa por segmento (NIT → `AGENTE_SEGUIMIENTO`).
   - **Llamadas (ACD)** (`NS_SOPORTE.xls`) → indicadores de atención (**solo bloque General**).
   - **Datos base** (opcional) → hojas `Evolutivo` / `CasosMes` / `Desglose`.
3. Completa **Corte** (los casos por llamada/correo ya no se digitan: se cuentan de la BBDD).
4. **Generar tablero** → primero el bloque **General** (atención + ratio) y luego los
   bloques por segmento; botón **PNG** en cada bloque (o **Descargar todas**).

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
| **Atención** (NS, NA, AHT) — solo General | Llamadas ACD | promedio diario |
| **Atención** (Ofrecidas, Atendidas) — solo General | Llamadas ACD | total del período |
| **Casos por llamada / correo** (General y por segmento) | Semáforo `BBDD`, `Origen del caso` (col V), `BASE=Ingresos` | teléfono/llamada → llamada; correo **y** correo automático → correo |
| **Resolutividad** (`%SNU`) Sin y Con COFO | Semáforo, hoja `SN1` | leído de la tabla oficial (bloque Sin/Con COFO); respaldo: cálculo desde `BBDD` |
| **TMS** Sin y Con COFO | Semáforo, hoja `TMS` | leído de la tabla oficial (bloque Sin/Con COFO); respaldo: cálculo desde `BBDD` |
| **TMS Nivel 2 por área** (llaves) | Semáforo `BBDD`, `BaseCerradosAreaSolucion` (col AI) | promedio TMS por área de solución, incluye "(En blanco)" |
| **TMS por tipo de falla** | Semáforo `BBDD`, tipo de falla (col BF) | promedio TMS por falla, series Sin y Con COFO |
| **Bolsa INC total** | Bolsa completa + Base de clientes | por `RESPONSABLE` (col BM): HDP → Nivel 1; ASG_CORP → CPE, FALLA GPON → GPON, FIBRA → COFO, OTROS; días abiertos prom/máx |
| **Bolsa OTROS** (estado × días) | Bolsa, `RESPONSABLE=OTROS` | estado × días abiertos, segmento por NIT |

- **Metas por segmento**: Resolutividad y TMS por segmento (iguales Con y Sin COFO);
  NS 80% / NA 95% generales.
- **Nivel 1 (HDP)** = área de solución empieza por `HDP`; **Nivel 2** = el resto
  (incluye área en blanco).
- **"Con COFO" desde BBDD** (cuando la hoja oficial no trae el bloque): un caso se
  considera COFO si la columna `COFO` = 1 **o** el tipo de falla contiene
  "COFO"/"FIBRA".
- El CLI (`cli/`) conserva la versión anterior del tablero; la web es la vigente.

## Estructura

```
index.html           Herramienta web autónoma (raíz, la sirve Vercel)
cli/                 Versión de línea de comandos (TypeScript, tsx)
assets/etb.png       Logo eTb (para el CLI)
```

## Pendiente

- Fuente del evolutivo semanal, casos finales por mes y desglose COFO/OTROS
  (hoy se cargan desde un Excel "Datos base" opcional).
