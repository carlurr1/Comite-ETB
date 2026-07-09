# Tablero de comité — herramienta web (`tablero.html`)

Página **autónoma** (un solo archivo) para generar el tablero del comité por
segmento cada semana, sin instalar nada. Trae SheetJS y el logo eTb incrustados;
funciona **offline** (no necesita internet).

## Cómo usarla

1. Abre `index.html` con doble clic (Chrome/Edge). También sirve por Vercel/GitHub Pages.
2. Sube los archivos de la semana:
   - **Semáforo de soporte** → operativos por segmento Sin/Con COFO (Resolutividad, TMS,
     TMS N2 por área, TMS por tipo de falla) y casos creados por canal.
   - **Bolsa de INC** (`Bolsa_*.xlsx`) → toda la bolsa: HDP/escalados + tabla OTROS.
   - **Base de clientes** → clasifica la bolsa por segmento (NIT → `AGENTE_SEGUIMIENTO`).
   - **Llamadas (ACD)** (`NS_SOPORTE.xls`) → indicadores de atención (solo bloque General).
   - **Datos base** (opcional) → hojas `Evolutivo` / `CasosMes` / `Desglose`.
   - **Ingresos / Cierres / Pendientes** → Excel por mes y segmento (INGRESOS/CERRADOS/PENDIENTES);
     barras por segmento en el bloque General (se usa el último mes con datos).
   - **Tipificación (del mes)** → Excel con `MES` / `TIEMPO` / `EFECTIVIDAD`; tabla en el General.
3. Completa el único campo manual: **Corte** (los casos por llamada/correo se cuentan de la BBDD).
4. **Generar tablero** → bloque **General** + bloques por segmento.
5. **Descargar todas** → imágenes listas para pegar en la presentación (sin logo ni botones).

## Reglas de cálculo (resumen)

- **Atención** (llamadas, solo General): NS/NA/AHT = promedio diario; Ofrecidas/Atendidas = total del período.
- **Casos por llamada / correo**: conteo de la `BBDD` (`BASE=Ingresos`, `Origen del caso`),
  **excluyendo `Estado`=Cancelado**; correo incluye "correo automático". Junto a esto, el
  **Top 4 origen del caso** (ingresos sin cancelados) reemplaza al ratio de contacto.
- **Operativos** (semáforo, **Sin y Con COFO**): Resolutividad = `%SNU` y TMS = "Promedio de TMS"
  leídos de las hojas `SN1`/`TMS` (bloque Sin/Con COFO); respaldo calculado de `BBDD`.
  El split **COFO se hace por causa** (`Categoría de Resolución Nivel 2` de infraestructura/fibra:
  última milla, transmisión, red metro ethernet, cable troncal, planta…; ver `CAUSAS_COFO` en el HTML),
  no por la columna `COFO` (que casi no marca casos). TMS N1 y N2 se subdividen por
  `BaseCerradosAreaSolucion` y hay gráfica de TMS por tipo de falla.
- **Metas por segmento**: Resolutividad y TMS por segmento (definidas en el objeto `METAS` del HTML,
  iguales Con y Sin COFO); NS 80% / NA 95% generales.
- **Bolsa**: toda la bolsa. Segmento por la columna **`MESA`** (MEN + PREMIUM 1..4 → Premium,
  GOLD 1 → Gold, DISTRITO/ELITE/MAYORISTAS directos; SILVER y SIN MESA se ignoran). Si el
  archivo no trae `MESA`, respaldo por NIT (base de clientes → semáforo).
  Nivel 1 = `GRUPO_ASIGNADO` empieza por `HDPREMIUM`; los escalados se categorizan por
  `RESPONSABLE`: ASG_CORP → CPE, FALLA GPON → GPON, FIBRA → COFO, OTROS → bolsa de OTROS
  (tabla `ESTADO` × `DIAS_ABIERTO`).

## Ajustes

Toda la lógica y el estilo están en el mismo `tablero.html` (sección `<script>`).
Para cambiar metas, colores, textos o reglas, se edita ese archivo. Es la versión
equivalente al CLI de la carpeta superior (`npm run graficas`), pensada para uso
semanal sin terminal.
