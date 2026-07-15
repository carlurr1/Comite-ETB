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
| **TMS** Sin y Con COFO | Semáforo, hoja `TMS` | leído de la tabla oficial (bloque Sin/Con COFO); respaldo: cálculo desde `BBDD` con la regla COFO/masivo/propietario oficial (ver notas abajo) |
| **TMS Nivel 2 por área** (llaves) | Semáforo `BBDD`, `BaseCerradosAreaSolucion` (col AI) | promedio TMS por área de solución, incluye "(En blanco)" |
| **TMS por tipo de falla** | Semáforo `BBDD`, tipo de falla (col BF) | promedio TMS por falla, series Sin y Con COFO |
| **Top 10 clientes por TMS** | Semáforo `BBDD`, `Nombre de la cuenta` | por segmento (Sin/Con COFO): ranking por TMS promedio del cliente (misma regla COFO/masivo/propietario), mín. `TOP_CLIENTES_MIN` casos |
| **Top 5 categoría de resolución** | Semáforo `BBDD`, `Cat. Resolución Nivel 5` (col AX) | por segmento (Sin/Con COFO): categorías con más casos cerrados |
| **Ingresos vs Cierres** | Semáforo `BBDD`, fechas apertura/cierre | línea diaria por segmento (doble eje: día + semana); ingresos por apertura, cierres por cierre |
| **TMB (tiempo en bolsa)** | Semáforo `BBDD`, `apertura`→`cierre` | por segmento: tiempo medio abierto (creación→cierre) vs TMS (afectación) y su relación |
| **Imputabilidad** | Semáforo `BBDD`, `Cat. Resolución Nivel 1` (col AT) | por segmento: dona ETB/CLIENTE/FUERZA MAYOR/… solo incidencias (excluye WO por prefijo `Id Sistema Legado`) |
| **Casos masivos** | Semáforo `BBDD`, `Incidente Masivo` (col E) | por segmento: conteo de masivos + clientes más impactados |
| **Bolsa INC total** | Bolsa completa + Base de clientes | por `RESPONSABLE` (col BM): HDP → Nivel 1; ASG_CORP → CPE, FALLA GPON → GPON, FIBRA → COFO, OTROS; días abiertos prom/máx |
| **Bolsa OTROS** (estado × días) | Bolsa, `RESPONSABLE=OTROS` | estado × días abiertos, segmento por NIT |

- **Metas por segmento**: Resolutividad y TMS por segmento (iguales Con y Sin COFO);
  NS 80% / NA 95% generales.
- **Nivel 1 (HDP)** = área de solución empieza por `HDP`; **Nivel 2** = el resto
  (incluye área en blanco).
- **COFO** (replicado del semáforo oficial, ver `detectarCofo` del GAS `semaforo-mayoristas`):
  un caso es COFO si `Cat. Resolución Nivel 4` ∈ `N4_COFO` (excepto MALA MANIPULACION +
  N2 MEDIO DE TRANSMISION), **o** `Nivel 2` ∈ {RETIRO, MEDIO DE TRANSMISION, DAÑO POR
  TERCEROS, VISITA CANCELADA}, **o** `Nivel 5` en la lista (distinta para SN1 y TMS:
  `N5_COFO_SN1` / `N5_COFO_TMS`). Comparación en MAYÚSCULAS con acentos.
- **Exclusiones de los cálculos** (igual que el oficial):
  - **Propietario**: se excluyen `OWNERS_EX` (Integraciones TIBCO + agentes COS).
  - **Masivo**: en **SN1** se excluye cualquier masivo; en **TMS** solo `CORTE DE CABLE`.
  - **Mesa**: solo Comdata / ETB Empresas Soporte (si la columna trae esos valores).
  - El **promedio de TMS incluye los ceros** (suma/conteo de la población), como el oficial.
- El CLI (`cli/`) conserva la versión anterior del tablero; la web es la vigente.

## Nube (Supabase) — compartir la carga entre todos

Por defecto cada quien guarda sus archivos solo en su navegador (IndexedDB). Si configuras
**Supabase Storage**, la carga se comparte: cuando **alguien** sube un archivo queda en la nube
y **cualquiera** que abra la página lo carga solo, sin volver a subirlo (modelo *el último gana*).

**Activarlo:**

1. Crea un proyecto en [supabase.com](https://supabase.com) (plan gratis). En **Settings → API**
   copia el **Project URL** y la **anon public key**.
2. En **Storage** crea un bucket llamado `comite`. En **SQL Editor** corre las políticas:
   ```sql
   insert into storage.buckets (id, name) values ('comite','comite') on conflict do nothing;
   create policy "comite lee"      on storage.objects for select using (bucket_id='comite');
   create policy "comite inserta"  on storage.objects for insert with check (bucket_id='comite');
   create policy "comite actualiza"on storage.objects for update using (bucket_id='comite');
   ```
3. En `index.html`, en el objeto `SUPABASE` (sección `<script>`), pon tu `url` y `anon`:
   ```js
   const SUPABASE={ url:"https://xxxxx.supabase.co", anon:"eyJ...", bucket:"comite" };
   ```

**Seguridad:** la `anon key` es pública (va en el cliente, es lo normal en Supabase). Con las
políticas de arriba, cualquiera que tenga la URL de la página puede leer/reemplazar los archivos
del bucket `comite`. Para una herramienta interna del comité suele ser aceptable; si quieres
restringir escritura, se puede exigir login y ajustar las políticas. Los datos se guardan como
archivos `.xlsx` (uno por tipo) más un `meta.json` con nombres y el corte. Si dejas `SUPABASE`
vacío, la nube queda **desactivada** y todo funciona offline igual que antes.

## Estructura

```
index.html           Herramienta web autónoma (raíz, la sirve Vercel)
cli/                 Versión de línea de comandos (TypeScript, tsx)
assets/etb.png       Logo eTb (para el CLI)
```

## Pendiente

- Fuente del evolutivo semanal, casos finales por mes y desglose COFO/OTROS
  (hoy se cargan desde un Excel "Datos base" opcional).
