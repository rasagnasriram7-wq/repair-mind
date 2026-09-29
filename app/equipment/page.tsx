'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Wrench,
  Search,
  Plus,
  Filter,
  AlertTriangle,
  ArrowRight,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  History,
  HardHat,
} from 'lucide-react';
import { Equipment, EquipmentStatus } from '@/types';

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Add Equipment Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Centrifugal Pump');
  const [formManufacturer, setFormManufacturer] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formStatus, setFormStatus] = useState<EquipmentStatus>('Operational');
  const [formDescription, setFormDescription] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/equipment');
      const data = await res.json();
      if (data.equipment) {
        setEquipment(data.equipment);
      }
    } catch (err) {
      console.error('Failed to load equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedEqId(null);
    setFormCode('');
    setFormName('');
    setFormType('Centrifugal Pump');
    setFormManufacturer('FlowServe Industries');
    setFormModel('Mark 3 ISO');
    setFormLocation('Sector 3 - Processing Plant');
    setFormStatus('Operational');
    setFormDescription('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (eq: Equipment) => {
    setIsEditing(true);
    setSelectedEqId(eq.id);
    setFormCode(eq.equipment_code);
    setFormName(eq.name);
    setFormType(eq.equipment_type);
    setFormManufacturer(eq.manufacturer);
    setFormModel(eq.model);
    setFormLocation(eq.location);
    setFormStatus(eq.status);
    setFormDescription(eq.description || '');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim() || !formType.trim()) {
      setErrorMsg('Equipment Code, Name, and Type are required.');
      return;
    }

    setFormSaving(true);
    setErrorMsg('');

    try {
      const url = isEditing && selectedEqId ? `/api/equipment/${selectedEqId}` : '/api/equipment';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_code: formCode.trim().toUpperCase(),
          name: formName.trim(),
          equipment_type: formType.trim(),
          manufacturer: formManufacturer.trim(),
          model: formModel.trim(),
          location: formLocation.trim(),
          status: formStatus,
          description: formDescription.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        await loadEquipment();
      } else {
        setErrorMsg(data.error || 'Failed to save equipment.');
      }
    } catch {
      setErrorMsg('Network error while saving equipment.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteEquipment = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete equipment ${code}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/equipment/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadEquipment();
      } else {
        alert('Failed to delete equipment.');
      }
    } catch {
      alert('Network error deleting equipment.');
    }
  };

  // Filtered equipment list
  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch =
      eq.equipment_code.toLowerCase().includes(search.toLowerCase()) ||
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.location.toLowerCase().includes(search.toLowerCase()) ||
      (eq.description && eq.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || eq.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || eq.equipment_type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const uniqueTypes = Array.from(new Set(equipment.map((e) => e.equipment_type)));

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Equipment Fleet & Machine Memory Registry
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Industrial machinery tracked with persistent maintenance memory & recurring failure history
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Equipment</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code (e.g. P-204), name, manufacturer, location..."
              className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Operational">Operational</option>
              <option value="Fault Reported">Fault Reported</option>
              <option value="Needs Inspection">Needs Inspection</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Critical">Critical</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Equipment Types</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Equipment Cards Grid */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading equipment fleet...</p>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
            <Wrench className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No equipment has been added yet.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your plant's critical pumps, motors, and compressors to start building organizational memory.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Equipment</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map((eq) => (
              <div
                key={eq.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {eq.equipment_code}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1.5">{eq.name}</h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        eq.status === 'Operational'
                          ? 'bg-emerald-100 text-emerald-800'
                          : eq.status === 'Fault Reported'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {eq.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {eq.description || `${eq.equipment_type} manufactured by ${eq.manufacturer}.`}
                  </p>

                  <div className="space-y-1 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <p>
                      <span className="font-semibold text-slate-700">Type:</span> {eq.equipment_type}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Model:</span> {eq.manufacturer} {eq.model}
                    </p>
                    <p className="truncate">
                      <span className="font-semibold text-slate-700">Location:</span> {eq.location}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-3 font-mono">
                    <span className="text-blue-700 font-semibold flex items-center gap-1">
                      <History className="w-3.5 h-3.5" />
                      {eq.memory_count} Memory Cases
                    </span>
                    {eq.recurring_fault && (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px] font-bold">
                        Recurring Fault Flagged
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/equipment/${eq.id}`}
                      className="flex-1 text-center py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>View History</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => openEditModal(eq)}
                      className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600"
                      title="Edit Equipment"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteEquipment(eq.id, eq.equipment_code)}
                      className="p-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400"
                      title="Delete Equipment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Equipment Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-sm">
                    {isEditing ? 'Edit Machine Specifications' : 'Register New Equipment'}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEquipment} className="p-5 space-y-3.5 text-xs">
                {errorMsg && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Equipment Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="e.g. P-204"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as EquipmentStatus)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Needs Inspection">Needs Inspection</option>
                      <option value="Fault Reported">Fault Reported</option>
                      <option value="Under Repair">Under Repair</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Equipment Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Centrifugal Slurry Pump"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Equipment Type <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      placeholder="e.g. Centrifugal Pump, Induction Motor"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
                    <input
                      type="text"
                      value={formManufacturer}
                      onChange={(e) => setFormManufacturer(e.target.value)}
                      placeholder="e.g. FlowServe, Siemens"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Model Spec</label>
                    <input
                      type="text"
                      value={formModel}
                      onChange={(e) => setFormModel(e.target.value)}
                      placeholder="e.g. Mark 3 ISO"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="e.g. Sector 3 Chemical Loop"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description & Notes</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Operating duties, critical service notes, thermal environment..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSaving}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm"
                  >
                    {formSaving ? 'Saving...' : isEditing ? 'Update Machine' : 'Create Equipment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
