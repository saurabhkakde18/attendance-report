import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Shield, UserCheck, X, Sparkles, MapPin, Users } from 'lucide-react';
import { Department, Employee, Office, Shift } from '@/types';
import { autoCalculateStatutoryDeductions } from '@/lib/store';

interface EmployeeManagementProps {
  employees: Employee[];
  departments: Department[];
  offices: Office[];
  shifts: Shift[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  employees,
  departments,
  offices,
  shifts,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State initialized with required company standards
  const [formData, setFormData] = useState<Partial<Employee>>({
    fullName: '',
    employeeCode: `EMP00${employees.length + 1}`,
    email: '',
    phone: '',
    designation: '',
    departmentId: departments[0]?.id || '',
    officeId: offices[0]?.id || '',
    shiftId: shifts[0]?.id || '',
    monthlySalary: 18000.0,
    pfDeduction: 1840.0,
    esicDeduction: 120.0,
    ptDeduction: 200.0,
    monthlyLeaveAllowance: 4,
    paidLeaveAllowance: 0,
    salaryDivisorType: 'CALENDAR_DAYS',
    employmentStatus: 'ACTIVE',
  });

  const handleSalaryChange = (newSalary: number) => {
    const deductions = autoCalculateStatutoryDeductions(newSalary);
    setFormData({
      ...formData,
      monthlySalary: newSalary,
      pfDeduction: deductions.pfDeduction,
      esicDeduction: deductions.esicDeduction,
      ptDeduction: deductions.ptDeduction,
    });
  };

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    const defaultSalary = 18000.0;
    const deductions = autoCalculateStatutoryDeductions(defaultSalary);
    setFormData({
      fullName: '',
      employeeCode: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      email: '',
      phone: '',
      designation: '',
      departmentId: departments[0]?.id || '',
      officeId: offices[0]?.id || '',
      shiftId: shifts[0]?.id || '',
      monthlySalary: defaultSalary,
      pfDeduction: deductions.pfDeduction,
      esicDeduction: deductions.esicDeduction,
      ptDeduction: deductions.ptDeduction,
      monthlyLeaveAllowance: 4,
      paidLeaveAllowance: 0,
      salaryDivisorType: 'CALENDAR_DAYS',
      employmentStatus: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ ...emp });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === formData.departmentId);
    const office = offices.find((o) => o.id === formData.officeId);
    const shift = shifts.find((s) => s.id === formData.shiftId);

    const empRecord: Employee = {
      id: editingEmployee ? editingEmployee.id : `emp-${Date.now()}`,
      fullName: formData.fullName || 'Employee Name',
      employeeCode: formData.employeeCode || 'EMP999',
      email: formData.email || '',
      phone: formData.phone || '',
      designation: formData.designation || 'Staff',
      departmentId: formData.departmentId || '',
      departmentName: dept?.name || 'General',
      officeId: formData.officeId || '',
      officeName: office?.officeName || 'OMSAIRAM',
      shiftId: formData.shiftId || '',
      shiftName: shift?.shiftName || 'General Shift',
      joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
      monthlySalary: Number(formData.monthlySalary) || 18000.0,
      pfDeduction: Number(formData.pfDeduction) || 1840.0,
      esicDeduction: Number(formData.esicDeduction) || 120.0,
      ptDeduction: Number(formData.ptDeduction) || 200.0,
      monthlyLeaveAllowance: Number(formData.monthlyLeaveAllowance) || 4,
      paidLeaveAllowance: 0,
      salaryDivisorType: (formData.salaryDivisorType as any) || 'CALENDAR_DAYS',
      employmentStatus: formData.employmentStatus || 'ACTIVE',
      password: editingEmployee?.password || 'emp123',
    };

    if (editingEmployee) {
      onUpdateEmployee(empRecord);
    } else {
      onAddEmployee(empRecord);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Employee Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Employee Directory & Contract Management</h2>
          <p className="text-xs text-slate-400">
            Configure employee IDs, shifts, office assignments, and statutory deduction parameters
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center px-4 py-2 bg-brand-blue hover:bg-brand-accent text-white text-xs font-bold rounded-lg shadow-sm transition-all shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Employee
        </button>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Office & Geofence</th>
                <th className="py-3 px-4">Basic Salary</th>
                <th className="py-3 px-4">Statutory Deductions</th>
                <th className="py-3 px-4">Base Net</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <div className="text-sm font-bold text-slate-600">No employees registered yet</div>
                      <p className="text-xs text-slate-400">Click &quot;Add New Employee&quot; above to register your team members.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                const fixedDeductions = emp.pfDeduction + emp.esicDeduction + emp.ptDeduction;
                const baseNet = emp.monthlySalary - fixedDeductions;
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{emp.fullName}</div>
                      <div className="text-[11px] text-brand-blue font-mono font-semibold">{emp.employeeCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{emp.email}</div>
                      <div className="text-slate-400">{emp.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{emp.designation}</div>
                      <div className="text-slate-500">{emp.departmentName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{emp.officeName}</div>
                      <div className="text-[11px] text-emerald-600 font-semibold">50m Geofence Active</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      ₹{emp.monthlySalary.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      <div>PF: ₹{emp.pfDeduction}</div>
                      <div className="text-[10px]">ESIC: ₹{emp.esicDeduction} • PT: ₹{emp.ptDeduction}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                      ₹{baseNet.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEmployee(emp.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {editingEmployee ? 'Edit Employee Details' : 'Add New Employee Profile'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue outline-none font-mono"
                    placeholder="EMP001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                    placeholder="employee@company.com"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                    placeholder="+91 98000 00000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Office Location</label>
                  <select
                    value={formData.officeId}
                    onChange={(e) => setFormData({ ...formData, officeId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                  >
                    {offices.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.officeName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Shift</label>
                  <select
                    value={formData.shiftId}
                    onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shiftName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Statutory Deductions & Salary Configuration Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-slate-800 flex items-center text-xs">
                    <Shield className="w-4 h-4 text-brand-blue mr-1.5" />
                    Statutory Deductions & Salary Package (INR)
                  </div>
                  <span className="inline-flex items-center text-[10px] font-bold text-brand-blue bg-blue-100/70 px-2 py-0.5 rounded-full border border-blue-200">
                    <Sparkles className="w-3 h-3 mr-1 text-brand-blue" />
                    Auto-Calculated as per Labor Rules
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-700 mb-0.5 font-bold">
                      Basic Salary (Type to Auto-Calculate)
                    </label>
                    <input
                      type="number"
                      required
                      min="1000"
                      step="100"
                      value={formData.monthlySalary}
                      onChange={(e) => handleSalaryChange(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border-2 border-brand-blue/50 rounded-lg font-mono font-bold text-slate-900 bg-white focus:border-brand-blue outline-none"
                      placeholder="e.g. 18000"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5 font-medium">
                      PF Deduction (Auto 12%)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.pfDeduction}
                      onChange={(e) => setFormData({ ...formData, pfDeduction: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border rounded-lg font-mono text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5 font-medium">
                      ESIC Deduction (Auto)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.esicDeduction}
                      onChange={(e) => setFormData({ ...formData, esicDeduction: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border rounded-lg font-mono text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5 font-medium">
                      PT Deduction (Auto)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.ptDeduction}
                      onChange={(e) => setFormData({ ...formData, ptDeduction: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border rounded-lg font-mono text-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs font-semibold text-slate-700">
                  <span className="text-slate-500 text-[11px]">
                    Fixed Deductions: ₹{(Number(formData.pfDeduction) || 0) + (Number(formData.esicDeduction) || 0) + (Number(formData.ptDeduction) || 0)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span>Base Net Salary Before Extra Leaves:</span>
                    <span className="font-mono text-emerald-600 font-bold text-sm">
                      ₹
                      {Math.max(
                        0,
                        (Number(formData.monthlySalary) || 0) -
                          (Number(formData.pfDeduction) || 0) -
                          (Number(formData.esicDeduction) || 0) -
                          (Number(formData.ptDeduction) || 0)
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-blue hover:bg-brand-accent text-white font-bold rounded-lg shadow-sm"
                >
                  {editingEmployee ? 'Save Changes' : 'Create Employee Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
