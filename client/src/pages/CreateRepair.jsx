import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wrench, User, Laptop, Calendar, DollarSign, ArrowLeft, Loader2, Save } from 'lucide-react';

const CreateRepair = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [technicians, setTechnicians] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    customer: {
      name: '',
      phone: '',
      email: '',
    },
    device: {
      type: 'Laptop',
      brand: '',
      model: '',
      serialNumber: '',
      color: '',
    },
    reportedProblem: '',
    notes: '',
    assignedTechnician: '',
    priority: 'Medium',
    estimatedCost: 500,
    estimatedCompletionDate: '',
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/users?role=technician');
      if (res.data.success) {
        setTechnicians(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load technicians list:', err);
    }
  };

  const handleCustomerChange = (e) => {
    setFormData({
      ...formData,
      customer: { ...formData.customer, [e.target.name]: e.target.value },
    });
  };

  const handleDeviceChange = (e) => {
    setFormData({
      ...formData,
      device: { ...formData.device, [e.target.name]: e.target.value },
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer.name || !formData.customer.phone || !formData.customer.email) {
      return toast.error('Please fill in complete customer contact details.');
    }

    if (!formData.device.brand || !formData.device.model) {
      return toast.error('Please enter device brand and model.');
    }

    if (!formData.reportedProblem) {
      return toast.error('Please describe the customer reported problem.');
    }

    try {
      setSubmitting(true);
      const res = await api.post('/repairs', formData);

      if (res.data.success) {
        toast.success(`Repair Ticket #${res.data.repair.repairId} created!`);
        navigate(`/repairs/${res.data.repair._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create repair ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Repairs</span>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Create New Repair Ticket</h1>
          <p className="text-xs text-slate-400 mt-1">Receive device, record customer issues, and issue tracking code</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-800">
            <User className="w-4 h-4 text-blue-400" />
            1. Customer Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                required
                name="name"
                placeholder="e.g. Aarav Sharma"
                value={formData.customer.name}
                onChange={handleCustomerChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Phone Number *
              </label>
              <input
                type="text"
                required
                name="phone"
                placeholder="e.g. +91 98765 43210"
                value={formData.customer.phone}
                onChange={handleCustomerChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address * (For Notifications)
              </label>
              <input
                type="email"
                required
                name="email"
                placeholder="e.g. customer@example.com"
                value={formData.customer.email}
                onChange={handleCustomerChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Device Information Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-800">
            <Laptop className="w-4 h-4 text-purple-400" />
            2. Device Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Device Category *
              </label>
              <select
                name="type"
                value={formData.device.type}
                onChange={handleDeviceChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Laptop">Laptop</option>
                <option value="Mobile">Mobile Phone</option>
                <option value="Tablet">Tablet</option>
                <option value="Desktop">Desktop PC</option>
                <option value="Appliance">Appliance</option>
                <option value="Audio">Audio Hardware</option>
                <option value="Other">Other Electronics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Brand *
              </label>
              <input
                type="text"
                required
                name="brand"
                placeholder="e.g. Apple, Dell, Samsung, Lenovo"
                value={formData.device.brand}
                onChange={handleDeviceChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Model Name/Number *
              </label>
              <input
                type="text"
                required
                name="model"
                placeholder="e.g. MacBook Air M2 / Galaxy S22"
                value={formData.device.model}
                onChange={handleDeviceChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Serial Number / IMEI
              </label>
              <input
                type="text"
                name="serialNumber"
                placeholder="e.g. C02FX102N601"
                value={formData.device.serialNumber}
                onChange={handleDeviceChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Device Color
              </label>
              <input
                type="text"
                name="color"
                placeholder="e.g. Space Grey, Black, Blue"
                value={formData.device.color}
                onChange={handleDeviceChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Problem Description & Assignment */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-800">
            <Wrench className="w-4 h-4 text-amber-400" />
            3. Reported Problem & Repair Assignment
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Customer Reported Problem Description *
            </label>
            <textarea
              required
              rows="3"
              name="reportedProblem"
              placeholder="Describe symptoms: e.g., cracked screen, water spill, no power, battery draining fast..."
              value={formData.reportedProblem}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Internal Intake Notes
            </label>
            <textarea
              rows="2"
              name="notes"
              placeholder="Internal physical condition notes, missing accessories, charger included..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Assign Technician
              </label>
              <select
                name="assignedTechnician"
                value={formData.assignedTechnician}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="">Unassigned (Queue)</option>
                {technicians.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Job Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Initial Est. Cost (₹)
              </label>
              <input
                type="number"
                min="0"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Est. Completion Date
              </label>
              <input
                type="date"
                name="estimatedCompletionDate"
                value={formData.estimatedCompletionDate}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/repairs')}
            className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Create & Generate Tracking ID</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRepair;
