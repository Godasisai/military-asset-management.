import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowRightLeft, Send, CheckCircle2, AlertTriangle, RefreshCw, User, Calendar, MapPin } from 'lucide-react';

export default function Transfers() {
  const { user } = useAuth();
  
  // Lookup lists
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [stockSnapshot, setStockSnapshot] = useState([]);

  // Form inputs
  const [sourceBase, setSourceBase] = useState('');
  const [destBase, setDestBase] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [quantity, setQuantity] = useState('');
  const [availableStock, setAvailableStock] = useState(null);

  // States
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Base Commanders locked to their base
  useEffect(() => {
    if (user && user.role === 'BASE_COMMANDER') {
      setSourceBase(String(user.baseId));
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [basesRes, eqRes, transRes, stockRes] = await Promise.all([
        api.get('/assets/bases'),
        api.get('/assets/equipment-types'),
        api.get('/transfers'),
        api.get('/assets/status'),
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(eqRes.data);
      setTransfers(transRes.data);
      setStockSnapshot(stockRes.data);
    } catch (err) {
      console.error('Failed to load transfers information:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Available Stock Helper when source base or equipment changes
  useEffect(() => {
    if (sourceBase && selectedEquipment && stockSnapshot.length > 0) {
      const match = stockSnapshot.find(
        (item) => item.baseId === parseInt(sourceBase) && item.equipmentTypeId === parseInt(selectedEquipment)
      );
      setAvailableStock(match ? match.quantity : 0);
    } else {
      setAvailableStock(null);
    }
  }, [sourceBase, selectedEquipment, stockSnapshot]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    const qty = parseInt(quantity);
    if (availableStock !== null && qty > availableStock) {
      setErrorMessage(`Insufficient stock. Available: ${availableStock}, Requested: ${qty}`);
      return;
    }

    if (parseInt(sourceBase) === parseInt(destBase)) {
      setErrorMessage('Source base and destination base cannot be the same.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/transfers', {
        sourceBaseId: parseInt(sourceBase),
        destinationBaseId: parseInt(destBase),
        equipmentTypeId: parseInt(selectedEquipment),
        quantity: qty,
      });

      setSuccessMessage(response.data.message || 'Transfer completed successfully.');
      setQuantity('');
      setSelectedEquipment('');
      setAvailableStock(null);
      
      // Reload history & stock levels
      const [transRes, stockRes] = await Promise.all([
        api.get('/transfers'),
        api.get('/assets/status'),
      ]);
      setTransfers(transRes.data);
      setStockSnapshot(stockRes.data);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.response?.data?.message || 'Transfer transaction failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 overflow-y-auto">
      {/* Title Header */}
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-100 m-0">
          Base-to-Base Transfers
        </h1>
        <p className="text-sm text-slate-400">
          Reallocate active assets across bases with full transactional logging.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Transfer Form Card */}
        <div className="glass-card rounded-xl p-6 h-fit">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
            <Send className="h-5 w-5 text-amber-500" />
            <h3 className="font-display text-base font-bold text-slate-200">
              Initiate Asset Dispatch
            </h3>
          </div>

          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 flex items-start gap-2 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Source Base */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Dispatch Source Base</label>
              <select
                required
                disabled={user?.role === 'BASE_COMMANDER'}
                value={sourceBase}
                onChange={(e) => setSourceBase(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500 disabled:opacity-60"
              >
                <option value="">Select Dispatch Source Base...</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Base */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Destination Base</label>
              <select
                required
                value={destBase}
                onChange={(e) => setDestBase(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
              >
                <option value="">Select Destination Base...</option>
                {bases
                  .filter((b) => b.id !== parseInt(sourceBase))
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.location})
                    </option>
                  ))}
              </select>
            </div>

            {/* Equipment Type */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Equipment Type</label>
              <select
                required
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
              >
                <option value="">Select Equipment...</option>
                {equipmentTypes.map((et) => (
                  <option key={et.id} value={et.id}>
                    {et.name}
                  </option>
                ))}
              </select>
              
              {/* Stock availability indicator */}
              {availableStock !== null && (
                <div className={`mt-2 flex items-center justify-between text-xs font-semibold px-2 py-1 rounded bg-slate-950 border ${
                  availableStock > 0 ? 'border-emerald-500/20 text-emerald-500' : 'border-red-500/20 text-red-550'
                }`}>
                  <span>Current Available Stock at Source:</span>
                  <span className="font-mono font-bold">{availableStock}</span>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Transfer Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                placeholder="Enter stock quantity..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting || (availableStock !== null && parseInt(quantity) > availableStock) || availableStock === 0}
              className="w-full rounded bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Processing Dispatch...' : 'Commit Dispatch Order'}
            </button>
          </form>
        </div>

        {/* Transfer History Column */}
        <div className="lg:col-span-2 rounded-lg border border-slate-800 bg-slate-950/40 p-6 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-amber-500" />
              <h3 className="font-display text-base font-bold text-slate-200">
                Transfer Logs Ledger
              </h3>
            </div>
            <button
              onClick={fetchData}
              className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Reload
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading transfer logs...
              </div>
            ) : transfers.length > 0 ? (
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 font-medium">Log ID</th>
                    <th className="pb-3 font-medium">Date & Time</th>
                    <th className="pb-3 font-medium">Source</th>
                    <th className="pb-3 font-medium">Destination</th>
                    <th className="pb-3 font-medium">Asset</th>
                    <th className="pb-3 font-medium text-right">Qty</th>
                    <th className="pb-3 font-medium text-right">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
                  {transfers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-900/30">
                      <td className="py-3 font-mono text-amber-500 font-semibold">#TRF-{t.id}</td>
                      <td className="py-3 text-slate-450">{new Date(t.createdAt).toLocaleString()}</td>
                      <td className="py-3 text-red-400 font-semibold">{t.sourceBase.name}</td>
                      <td className="py-3 text-emerald-400 font-semibold">{t.destinationBase.name}</td>
                      <td className="py-3 text-slate-200 font-semibold">{t.equipmentType.name}</td>
                      <td className="py-3 text-right font-mono font-bold text-slate-100">{t.quantity}</td>
                      <td className="py-3 text-right text-slate-500 font-mono">@{t.initiatedBy.username}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No base-to-base transfers logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
