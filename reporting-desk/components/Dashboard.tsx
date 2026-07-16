"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/login/actions";
import type { Usuario, MetricaAnalista, ResumenPeriodo } from "@/lib/types";

const ETB = "#0098d6";

// Primer día del mes actual en formato YYYY-MM-01.
function mesActual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Dashboard({ perfil }: { perfil: Usuario }) {
  const sb = useMemo(() => createClient(), []);
  const [mes, setMes] = useState(mesActual());        // 'YYYY-MM'
  const periodo = `${mes}-01`;
  const [resumen, setResumen] = useState<ResumenPeriodo | null>(null);
  const [porAnalista, setPorAnalista] = useState<MetricaAnalista[]>([]);
  const [porEstado, setPorEstado] = useState<{ estado_nombre: string; total: number; color: string }[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    (async () => {
      setCargando(true);
      const [r, a, e] = await Promise.all([
        sb.rpc("resumen_periodo", { p_periodo: periodo }).single(),
        sb.from("v_productividad_analista").select("*").eq("periodo", periodo).order("enviados", { ascending: false }),
        sb.from("v_estado_periodo").select("estado_nombre,total,color").eq("periodo", periodo),
      ]);
      if (!vivo) return;
      setResumen((r.data as ResumenPeriodo) ?? null);
      setPorAnalista((a.data as MetricaAnalista[]) ?? []);
      setPorEstado((e.data as any[]) ?? []);
      setCargando(false);
    })();
    return () => { vivo = false; };
  }, [sb, periodo]);

  const puedeGestionar = ["coordinador", "superadmin"].includes(perfil.rol);

  return (
    <div className="shell">
      <div className="topbar">
        <h1>
          <span className="brandmark" style={{ width: 34, height: 34, fontSize: 14 }}>RD</span>
          Reporting Desk
          <span className="pill">{perfil.rol}</span>
        </h1>
        <div className="row" style={{ alignItems: "center" }}>
          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
          <span className="sub">{perfil.nombre} {perfil.apellido ?? ""} ({perfil.iniciales})</span>
          <form action={logout}><button className="btn">Salir</button></form>
        </div>
      </div>

      {/* KPIs ─ encabezado del período */}
      <div className="kpis">
        <Kpi n={resumen?.total} l="Informes del período" />
        <Kpi n={resumen?.enviados} l="Enviados" color="var(--good)" />
        <Kpi n={resumen?.programados} l="Programados" color={ETB} />
        <Kpi n={resumen?.pendientes} l="Pendientes" color="var(--warn)" />
        <Kpi n={resumen ? `${resumen.pct_cumplimiento ?? 0}%` : undefined} l="Cumplimiento" />
        <Kpi n={resumen?.casos_validados} l="Casos SF validados" />
      </div>

      <div className="grid2">
        {/* Productividad por analista — una serie, magnitud */}
        <div className="card">
          <h2>Productividad por analista · enviados</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={porAnalista} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="iniciales" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="enviados" fill={ETB} radius={[4, 4, 0, 0]} name="Enviados" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estado del período — dona con colores de estado */}
        <div className="card">
          <h2>Estado del período</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={porEstado} dataKey="total" nameKey="estado_nombre"
                   innerRadius={60} outerRadius={100} paddingAngle={2}>
                {porEstado.map((s, i) => <Cell key={i} fill={s.color || "#cbd5e1"} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla detalle por analista */}
      <div className="card">
        <h2>Detalle por analista</h2>
        {cargando ? <p className="sub">Cargando…</p> : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Analista</th><th>Total</th><th>Enviados</th><th>Programados</th>
                  <th>Pendientes</th><th>Parciales</th><th>Casos válidos</th><th>Cumplimiento</th>
                </tr>
              </thead>
              <tbody>
                {porAnalista.map((a) => (
                  <tr key={a.analista_id}>
                    <td><strong>{a.iniciales}</strong> · {a.nombre} {a.apellido ?? ""}</td>
                    <td>{a.total}</td><td>{a.enviados}</td><td>{a.programados}</td>
                    <td>{a.pendientes}</td><td>{a.parciales}</td>
                    <td>{a.casos_validados}/{a.con_caso}</td>
                    <td>{a.pct_cumplimiento ?? 0}%</td>
                  </tr>
                ))}
                {!porAnalista.length && (
                  <tr><td colSpan={8} className="sub">Sin informes en este período. {puedeGestionar && "Genera el período desde la programación."}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ n, l, color }: { n?: number | string; l: string; color?: string }) {
  return (
    <div className="kpi">
      <div className="n" style={color ? { color } : undefined}>{n ?? "—"}</div>
      <div className="l">{l}</div>
    </div>
  );
}
