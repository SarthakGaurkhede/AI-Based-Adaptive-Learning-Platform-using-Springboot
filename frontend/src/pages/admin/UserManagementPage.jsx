import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.client';
const UserManagementPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['admin-users', search, roleFilter, statusFilter, page],
    queryFn: () => api.get('/admin/users', {
      params: {
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 20
      }
    }).then(r => r.data),
    staleTime: 15_000
  });
  const suspendMut = useMutation({
    mutationFn: ({
      id,
      action
    }) => api.patch(`/admin/users/${id}/suspend`, {
      action
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['admin-users']
    })
  });
  const users = data?.data || [];
  const meta = data?.meta || {};
  return <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-2xl font-bold text-on-surface">User Management</h1>
        <p className="text-on-surface-variant text-sm mt-1">{meta.total || 0} total users</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none">
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container">
              <tr>
                {['User', 'Role', 'Status', 'XP / Level', 'Joined', 'Actions'].map(h => <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading ? [...Array(8)].map((_, i) => <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-surface-container rounded w-20" /></td>)}
                  </tr>) : users.map(u => <tr key={u._id} className="hover:bg-surface-container transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-on-surface text-sm">{u.name}</p>
                        <p className="text-xs text-on-surface-variant">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize
                      ${u.role === 'admin' ? 'bg-primary/10 text-primary' : u.role === 'teacher' ? 'bg-secondary/10 text-secondary' : 'bg-surface-container text-on-surface-variant'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-medium
                      ${u.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-error'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-error'}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-on-surface">{u.xp?.toLocaleString()} XP</p>
                    <p className="text-xs text-on-surface-variant">Level {u.level}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-on-surface-variant whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => suspendMut.mutate({
                  id: u._id,
                  action: u.status === 'active' ? 'suspend' : 'activate'
                })} disabled={suspendMut.isPending} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
                        ${u.status === 'active' ? 'text-error hover:bg-error/10' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-400/10'}`}>
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.pages > 1 && <div className="px-5 py-4 border-t border-black/5 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, meta.total)} of {meta.total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface disabled:opacity-40 hover:bg-surface-container transition-colors">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(meta.pages, p + 1))} disabled={page === meta.pages} className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface disabled:opacity-40 hover:bg-surface-container transition-colors">
                Next
              </button>
            </div>
          </div>}
      </motion.div>
    </div>;
};
export default UserManagementPage;