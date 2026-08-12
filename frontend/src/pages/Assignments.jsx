import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UsersRound, Flame, CheckCircle2, AlertTriangle, RefreshCw, Undo2, ArrowUpRight, ShieldAlert } from 'lucide-react';

export default function Assignments() {
  const { user } = useAuth();

  // Lookup lists
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [stockSnapshot, setStockSnapshot] = useState([]);

  // Assignment Form State
  const [assignBase, setAssignBase] = useState('');
  const [assignEquipment, setAssignEquipment] = useState('');
  const [assignQuantity, setAssignQuantity] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [assignStock, setAssignStock] = useState(null);

  // Expenditure Form State
  const [expendBase, setExpendBase] = useState('');
  const [expendEquipment, setExpendEquipment] = useState('');
  const [expendQuantity, setExpendQuantity] = useState('');
  const [expendReason, setExpendReason] = useState('');
  const [expendStock, setExpendStock] = useState(null);

  // Actions states
  const [loading, setLoading] = useState(false);
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [submittingExpend, setSubmittingExpend] = useState(false);
  
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignError, setAssignError] = useState('');
  const [expendSuccess, setExpendSuccess] = useState('');
  const [expendError, setExpendError] = useState('');

  // Lock base dropdowns for Commanders
  useEffect(() => {
    if (user && user.role === 'BASE_COMMANDER') {
      setAssignBase(String(user.baseId));
      setExpendBase(String(user.baseId));
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [basesRes, eqRes, assignRes, expendRes, stockRes] = await Promise.all([
        api.get('/assets/bases'),
        api.get('/assets/equipment-types'),
        api.get('/assignments'),
        api.get('/expenditures'),
        api.get('/assets/status'),
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(eqRes.data);
      setAssignments(assignRes.data);
      setExpenditures(expendRes.data);
      setStockSnapshot(stockRes.data);
    } catch (err) {
      console.error('Failed to load assignments and expenditures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Available stock indicator for assignment form
  useEffect(() => {
    if (assignBase && assignEquipment && stockSnapshot.length > 0) {
      const match = stockSnapshot.find(
        (item) => item.baseId === parseInt(assignBase) && item.equipmentTypeId === parseInt(assignEquipment)
      );
      setAssignStock(match ? match.quantity : 0);
    } else {
      setAssignStock(null);
    }
  }, [assignBase, assignEquipment, stockSnapshot]);

  // Update Available stock indicator for expenditure form
  useEffect(() => {
    if (expendBase && expendEquipment && stockSnapshot.length > 0) {
      const match = stockSnapshot.find(
        (item) => item.baseId === parseInt(expendBase) && item.equipmentTypeId === parseInt(expendEquipment)
      );
      setExpendStock(match ? match.quantity : 0);
    } else {
      setExpendStock(null);
    }
  }, [expendBase, expendEquipment, stockSnapshot]);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignSuccess('');
    setAssignError('');

    const qty = parseInt(assignQuantity);
    if (assignStock !== null && qty > assignStock) {
      setAssignError(`Insufficient stock. Available: ${assignStock}, Requested: ${qty}`);
      return;
    }

    setSubmittingAssign(true);
    try {
      const response = await api.post('/assignments', {
        baseId: parseInt(assignBase),
        equipmentTypeId: parseInt(assignEquipment),
        quantity: qty,
        assignedTo: assignTo,
      });

      setAssignSuccess(response.data.message || 'Equipment successfully assigned.');
      setAssignQuantity('');
      setAssignTo('');
      setAssignEquipment('');
      setAssignStock(null);

      // Refresh data
      fetchData();
    } catch (err) {
      setAssignError(err.response?.data?.error || err.response?.data?.message || 'Check-out failed.');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleExpendSubmit = async (e) => {
    e.preventDefault();
    setExpendSuccess('');
    setExpendError('');

    const qty = parseInt(expendQuantity);
    if (expendStock !== null && qty > expendStock) {
      setExpendError(`Insufficient stock. Available: ${expendStock}, Requested: ${qty}`);
      return;
    }

    setSubmittingExpend(true);
    try {
      const response = await api.post('/expenditures', {
        baseId: parseInt(expendBase),
        equipmentTypeId: parseInt(expendEquipment),
        quantity: qty,
        reason: expendReason,
      });

      setExpendSuccess(response.data.message || 'Expenditure logged successfully.');
      setExpendQuantity('');
      setExpendReason('');
      setExpendEquipment('');
      setExpendStock(null);

      // Refresh data
      fetchData();
    } catch (err) {
      setExpendError(err.response?.data?.error || err.response?.data?.message || 'Expenditure log failed.');
    } finally {
      setSubmittingExpend(false);
    }
  };

  const handleReturn = async (id) => {
    try {
      await api.post(`/assignments/${id}/return`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Return operation failed.');
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 overflow-y-auto">
      {/* Title Header */}
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-100 m-0">
          Assignments & Expenditures
        </h1>
        <p className="text-sm text-slate-400">
          Track personnel assignments and log consumed assets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* ASSIGNMENTS COLUMN */}
        <div className="space-y-6">
          {/* Assignment Log Form */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
              <UsersRound className="h-5 w-5 text-amber-500" />
              <h3 className="font-display text-base font-bold text-slate-200">
                Log Personnel Assignment
              </h3>
            </div>

            {assignSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{assignSuccess}</span>
              </div>
            )}

            {assignError && (
              <div className="mb-4 flex items-start gap-2 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{assignError}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Base */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Base</label>
                  <select
                    required
                    disabled={user?.role === 'BASE_COMMANDER'}
                    value={assignBase}
                    onChange={(e) => setAssignBase(e.target.value)}
                    className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500 disabled:opacity-60"
                  >
                    <option value="">Select Base...</option>
                    {bases.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Personnel */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Assigned To (Operator/Unit)</label>
                  <input
                    type="text"
                    required
                    value={assignTo}
                    onChange={(e) => setAssignTo(e.target.value)}
                    className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                    placeholder="e.g. Sgt. Miller, Unit 10"
                  />
                </div>
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Equipment Type</label>
                <select
                  required
                  value={assignEquipment}
                  onChange={(e) => setAssignEquipment(e.target.value)}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="">Select Equipment...</option>
                  {equipmentTypes.map((et) => (
                    <option key={et.id} value={et.id}>
                      {et.name} [{et.category}]
                    </option>
                  ))}
                </select>

                {assignStock !== null && (
                  <div className={`mt-2 flex items-center justify-between text-xs font-semibold px-2 py-1 rounded bg-slate-950 border ${
                    assignStock > 0 ? 'border-emerald-500/20 text-emerald-500' : 'border-red-500/20 text-red-550'
                  }`}>
                    <span>Available Stock:</span>
                    <span className="font-mono font-bold">{assignStock}</span>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={assignQuantity}
                  onChange={(e) => setAssignQuantity(e.target.value)}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                  placeholder="Quantity to assign..."
                />
              </div>

              <button
                type="submit"
                disabled={submittingAssign || (assignStock !== null && parseInt(assignQuantity) > assignStock) || assignStock === 0}
                className="w-full rounded bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submittingAssign ? 'Assigning...' : 'Commit Assignment'}
              </button>
            </form>
          </div>

          {/* Assignments History */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-6 flex flex-col h-[320px]">
            <h4 className="font-display text-sm font-bold text-slate-250 mb-4 pb-2 border-b border-slate-800">
              Active Checkout Records
            </h4>
            <div className="flex-1 overflow-y-auto">
              {assignments.length > 0 ? (
                <div className="space-y-3">
                  {assignments.map((asg) => (
                    <div key={asg.id} className="p-3 rounded bg-slate-950 border border-slate-900 text-xs flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-200">{asg.equipmentType.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                            Qty: {asg.quantity}
                          </span>
                        </div>
                        <p className="text-slate-400">Assigned to: <span className="text-slate-250 font-bold">{asg.assignedTo}</span></p>
                        <p className="text-[10px] text-slate-500 mt-1">{asg.base.name} • Checked out {new Date(asg.createdAt).toLocaleDateString()}</p>
                      </div>

                      {asg.status === 'ASSIGNED' ? (
                        <button
                          onClick={() => handleReturn(asg.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition text-[10px] font-bold tracking-widest uppercase cursor-pointer"
                        >
                          <Undo2 className="h-3 w-3" />
                          Return Stock
                        </button>
                      ) : (
                        <span className="text-[10px] px-2 py-1 bg-slate-900 border border-slate-850 rounded text-slate-500 font-bold uppercase tracking-wider">
                          Returned
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No personnel assignments registered.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* EXPENDITURES COLUMN */}
        <div className="space-y-6">
          {/* Expenditure Log Form */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
              <Flame className="h-5 w-5 text-red-500" />
              <h3 className="font-display text-base font-bold text-slate-200">
                Log Asset Expenditure
              </h3>
            </div>

            {expendSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{expendSuccess}</span>
              </div>
            )}

            {expendError && (
              <div className="mb-4 flex items-start gap-2 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{expendError}</span>
              </div>
            )}

            <form onSubmit={handleExpendSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Base */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Base</label>
                  <select
                    required
                    disabled={user?.role === 'BASE_COMMANDER'}
                    value={expendBase}
                    onChange={(e) => setExpendBase(e.target.value)}
                    className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500 disabled:opacity-60"
                  >
                    <option value="">Select Base...</option>
                    {bases.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Reason / Action</label>
                  <input
                    type="text"
                    required
                    value={expendReason}
                    onChange={(e) => setExpendReason(e.target.value)}
                    className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                    placeholder="e.g. Ammo spent at range, Scrap"
                  />
                </div>
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Equipment Type</label>
                <select
                  required
                  value={expendEquipment}
                  onChange={(e) => setExpendEquipment(e.target.value)}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="">Select Equipment...</option>
                  {equipmentTypes.map((et) => (
                    <option key={et.id} value={et.id}>
                      {et.name} [{et.category}]
                    </option>
                  ))}
                </select>

                {expendStock !== null && (
                  <div className={`mt-2 flex items-center justify-between text-xs font-semibold px-2 py-1 rounded bg-slate-950 border ${
                    expendStock > 0 ? 'border-emerald-500/20 text-emerald-500' : 'border-red-500/20 text-red-550'
                  }`}>
                    <span>Available Stock:</span>
                    <span className="font-mono font-bold">{expendStock}</span>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Expended Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={expendQuantity}
                  onChange={(e) => setExpendQuantity(e.target.value)}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                  placeholder="e.g. 500 rounds, 1 vehicle written off"
                />
              </div>

              <button
                type="submit"
                disabled={submittingExpend || (expendStock !== null && parseInt(expendQuantity) > expendStock) || expendStock === 0}
                className="w-full rounded bg-red-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submittingExpend ? 'Logging Expenditure...' : 'Log Resource Consumption'}
              </button>
            </form>
          </div>

          {/* Expenditure Audit Log */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-6 flex flex-col h-[320px]">
            <h4 className="font-display text-sm font-bold text-slate-250 mb-4 pb-2 border-b border-slate-800">
              Resource Consumption Trail
            </h4>
            <div className="flex-1 overflow-y-auto">
              {expenditures.length > 0 ? (
                <div className="space-y-3">
                  {expenditures.map((exp) => (
                    <div key={exp.id} className="p-3 rounded bg-slate-950 border border-slate-900 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-200">{exp.equipmentType.name}</span>
                        <span className="text-red-400 font-mono font-bold">-{exp.quantity} units</span>
                      </div>
                      <p className="text-slate-400">Reason: <span className="text-slate-300 italic">"{exp.reason}"</span></p>
                      <p className="text-[10px] text-slate-500 mt-1">{exp.base.name} • {new Date(exp.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No expenditures logged.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
