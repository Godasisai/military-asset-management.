import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import NetMoveModal from '../components/NetMoveModal';
import {
  TrendingUp,
  Package,
  Activity,
  Flame,
  ArrowRightLeft,
  RefreshCw,
  SlidersHorizontal,
  Calendar,
  Lock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  
  // Filters
  const [selectedBase, setSelectedBase] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dropdown data
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  
  // Dashboard Metrics & Charts
  const [metrics, setMetrics] = useState({
    openingBalance: 0,
    purchases: 0,
    transfersIn: 0,
    transfersOut: 0,
    netMovement: 0,
    assigned: 0,
    expended: 0,
    closingBalance: 0,
  });
  
  const [stockStatus, setStockStatus] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isNetModalOpen, setIsNetModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lock base selector for Base Commanders
  useEffect(() => {
    if (user && user.role === 'BASE_COMMANDER') {
      setSelectedBase(String(user.baseId));
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch lookup lists
      const [basesRes, eqRes] = await Promise.all([
        api.get('/assets/bases'),
        api.get('/assets/equipment-types'),
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(eqRes.data);

      // 2. Build filters query
      const params = {};
      if (user.role === 'BASE_COMMANDER') {
        params.baseId = user.baseId;
      } else if (selectedBase) {
        params.baseId = selectedBase;
      }
      
      if (selectedEquipment) params.equipmentTypeId = selectedEquipment;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      // 3. Fetch metrics, stock status, and audit logs
      const [metricsRes, statusRes, logsRes] = await Promise.all([
        api.get('/assets/dashboard-metrics', { params }),
        api.get('/assets/status', { params: { baseId: params.baseId } }),
        api.get('/assets/audit-logs', { params: { baseId: params.baseId } }),
      ]);

      setMetrics(metricsRes.data);
      setStockStatus(statusRes.data);
      setAuditLogs(logsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, selectedBase, selectedEquipment, startDate, endDate]);

  const handleResetFilters = () => {
    if (user.role !== 'BASE_COMMANDER') {
      setSelectedBase('');
    }
    setSelectedEquipment('');
    setStartDate('');
    setEndDate('');
  };

  // Format stock data for Recharts chart
  // Group by equipment type name
  const chartData = stockStatus.map((item) => ({
    name: item.equipmentType.name,
    stock: item.quantity,
    base: item.base.name,
  }));

  return (
    <div className="flex-1 space-y-8 p-8 overflow-y-auto">
      {/* Welcome Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-100 m-0">
            Tactical Overview
          </h1>
          <p className="text-sm text-slate-400">
            Real-time readiness metrics and logistics tracking ledger.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 self-start rounded border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-850 hover:text-amber-500 transition cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {/* Dynamic Filter Controls Panel */}
      <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-6">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          <SlidersHorizontal className="h-4 w-4 text-amber-500" />
          <span>Operational Filter Panel</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Base Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Military Base</label>
            <div className="relative">
              <select
                disabled={user?.role === 'BASE_COMMANDER'}
                value={selectedBase}
                onChange={(e) => setSelectedBase(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
              >
                <option value="">All Bases (Global Ops)</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.location})
                  </option>
                ))}
              </select>
              {user?.role === 'BASE_COMMANDER' && (
                <Lock className="absolute right-3 top-2.5 h-4 w-4 text-slate-655" />
              )}
            </div>
          </div>

          {/* Equipment Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Equipment Type</label>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
            >
              <option value="">All Equipment</option>
              {equipmentTypes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} [{e.category}]
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Opening Balance"
          value={metrics.openingBalance}
          icon={Package}
          borderColorClass="border-slate-600"
        />
        <StatCard
          title="Net Movement"
          value={metrics.netMovement > 0 ? `+${metrics.netMovement}` : metrics.netMovement}
          icon={ArrowRightLeft}
          borderColorClass="border-emerald-500"
          onClick={() => setIsNetModalOpen(true)}
        />
        <StatCard
          title="Expended (Consumed)"
          value={metrics.expended}
          icon={Flame}
          borderColorClass="border-red-500"
        />
        <StatCard
          title="Closing (Active Stock)"
          value={metrics.closingBalance}
          icon={TrendingUp}
          borderColorClass="border-amber-500 pulse-glow-amber"
        />
      </div>

      {/* Visual Analytics & Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart Column */}
        <div className="lg:col-span-2 rounded-lg border border-slate-800 bg-slate-950/40 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-amber-500" />
            <h3 className="font-display text-base font-bold text-slate-200">
              Asset Level Quantities per Equipment Type
            </h3>
          </div>
          <div className="h-80 flex-1">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    itemStyle={{ color: '#f59e0b' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar name="Stock Level" dataKey="stock" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No active stock level data matches current filter settings.
              </div>
            )}
          </div>
        </div>

        {/* Audit Log Column */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="font-display text-base font-bold text-slate-200">
              Terminal Audit Log
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              Secure Ledger
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded bg-slate-950 border border-slate-900 text-xs">
                  <div className="flex justify-between text-slate-500 font-mono mb-1">
                    <span>@{log.user.username} ({log.user.role})</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300 font-medium">{log.details}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[9px] px-1.5 py-0.2 bg-slate-900 border border-slate-850 rounded text-amber-500 font-bold tracking-widest uppercase">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {log.user.base ? log.user.base.name : 'Global Operations'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No mutations registered in the log yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Net Movement Detail Pop-up */}
      <NetMoveModal
        isOpen={isNetModalOpen}
        onClose={() => setIsNetModalOpen(false)}
        metrics={metrics}
      />
    </div>
  );
}
