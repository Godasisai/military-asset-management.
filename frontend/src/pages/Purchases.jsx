import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Plus, Calendar, MapPin, Package, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Purchases() {
  const { user } = useAuth();
  
  // State variables
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [purchases, setPurchases] = useState([]);
  
  const [selectedBase, setSelectedBase] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [quantity, setQuantity] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchDropdownsAndHistory = async () => {
    setLoading(true);
    try {
      const [basesRes, eqRes, purRes] = await Promise.all([
        api.get('/assets/bases'),
        api.get('/assets/equipment-types'),
        api.get('/purchases'),
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(eqRes.data);
      setPurchases(purRes.data);
    } catch (err) {
      console.error('Error fetching purchase dependencies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownsAndHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await api.post('/purchases', {
        baseId: parseInt(selectedBase),
        equipmentTypeId: parseInt(selectedEquipment),
        quantity: parseInt(quantity),
      });

      setSuccessMessage(response.data.message || 'Stock purchase logged successfully.');
      setQuantity('');
      setSelectedEquipment('');
      // Reload history
      const purRes = await api.get('/purchases');
      setPurchases(purRes.data);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to record purchase transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 overflow-y-auto">
      {/* Title Header */}
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-100 m-0">
          Stock Procurement
        </h1>
        <p className="text-sm text-slate-400">
          Register new incoming physical assets to base inventories.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Purchase Form Card */}
        <div className="glass-card rounded-xl p-6 h-fit">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
            <Plus className="h-5 w-5 text-amber-500" />
            <h3 className="font-display text-base font-bold text-slate-200">
              Log Procurement Invoice
            </h3>
          </div>

          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Receiving Base</label>
              <select
                required
                value={selectedBase}
                onChange={(e) => setSelectedBase(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
              >
                <option value="">Select Destination Base...</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.location})
                  </option>
                ))}
              </select>
            </div>

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
                    {et.name} [{et.category}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Procured Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
                placeholder="Enter stock amount..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Registering Assets...' : 'Commit Purchase Invoice'}
            </button>
          </form>
        </div>

        {/* Procurement History Column */}
        <div className="lg:col-span-2 rounded-lg border border-slate-800 bg-slate-950/40 p-6 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-amber-500" />
              <h3 className="font-display text-base font-bold text-slate-200">
                Procurement Audit Trail
              </h3>
            </div>
            <button
              onClick={fetchDropdownsAndHistory}
              className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Reload
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading transaction history...
              </div>
            ) : purchases.length > 0 ? (
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 font-medium">Transaction ID</th>
                    <th className="pb-3 font-medium">Date & Time</th>
                    <th className="pb-3 font-medium">Base</th>
                    <th className="pb-3 font-medium">Asset Name</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
                  {purchases.map((pur) => (
                    <tr key={pur.id} className="hover:bg-slate-900/30">
                      <td className="py-3 font-mono text-amber-500 font-semibold">#PUR-{pur.id}</td>
                      <td className="py-3 text-slate-450">{new Date(pur.createdAt).toLocaleString()}</td>
                      <td className="py-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          {pur.base.name}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-slate-200">{pur.equipmentType.name}</td>
                      <td className="py-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                          {pur.equipmentType.category}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-100">{pur.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No purchases registered yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
