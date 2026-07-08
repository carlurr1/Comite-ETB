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
3. Completa el único campo manual: **Corte** (los casos por llamada/correo se cuentan de la BBDD).
4. **Generar tablero** → bloque **General** + bloques por segmento.
5. Botón **PNG** en cada bloque (o **Descargar todas**) → imágenes listas para pegar en la presentación.

## Reglas de cálculo (resumen)

- **Atención** (llamadas, solo General): NS/NA/AHT = promedio diario; Ofrecidas/Atendidas = total del período.
- **Casos por llamada / correo**: conteo de la `BBDD` (`BASE=Ingresos`, `Origen del caso`);
  correo incluye "correo automático". General y por segmento.
- **Operativos** (semáforo, **Sin y Con COFO**): Resolutividad = `%SNU` y TMS = "Promedio de TMS"
  leídos de las hojas `SN1`/`TMS` (bloque Sin/Con COFO); respaldo calculado de `BBDD`.
  TMS N2 se subdivide por `BaseCerradosAreaSolucion` (col AI) y hay gráfica de TMS por
  tipo de falla (col BF).
- **Metas por segmento**: Resolutividad y TMS por segmento (definidas en el objeto `METAS` del HTML,
  iguales Con y Sin COFO); NS 80% / NA 95% generales.
- **Bolsa**: toda la bolsa; por `RESPONSABLE`: HDP → Nivel 1, ASG_CORP → CPE,
  FALLA GPON → GPON, FIBRA → COFO, OTROS → bolsa de OTROS (tabla `ESTADO` × `DIAS_ABIERTO`);
  segmento por NIT (base de clientes → respaldo semáforo).

## Ajustes

Toda la lógica y el estilo están en el mismo `tablero.html` (sección `<script>`).
Para cambiar metas, colores, textos o reglas, se edita ese archivo. Es la versión
equivalente al CLI de la carpeta superior (`npm run graficas`), pensada para uso
semanal sin terminal.
