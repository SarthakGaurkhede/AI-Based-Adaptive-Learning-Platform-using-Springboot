import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.client';
const AuditLogsPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['audit-logs', search, page],
    queryFn: () => api.get('/admin/audit-logs', {
      params: {
        action: search,
        page,
        limit: 30
      }
    }).then(r => r.data)
  });
  const logs = data?.data || [];
  const meta = data?.meta || {};
  const actionColor = action => {
    if (action.includes('suspend')) return 'text-error bg-error/10';
    if (action.includes('publish') || action.includes('activate')) return 'text-green-600 bg-green-50 dark:bg-green-400/10 dark:text-green-300';
    if (action.includes('delete')) return 'text-orange-500 bg-orange-50 dark:bg-orange-400/10';
    return 'text-primary bg-primary/10';
  };
  return <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Audit Logs</h1>
          <p className="text-on-surface-variant text-sm mt-1">Immutable record of all sensitive platform actions</p>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by action…" className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
      </div>

      {/* Logs table */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container">
              <tr>
                {['Actor', 'Action', 'Target', 'IP Address', 'Timestamp'].map(h => <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading ? [...Array(8)].map((_, i) => <tr key={i} className="animate-pulse">
                    {[...Array(5)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-surface-container rounded w-24" /></td>)}
                  </tr>) : logs.length === 0 ? <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-on-surface-variant">No audit logs found</td>
                </tr> : logs.map(log => <tr key={log._id} className="hover:bg-surface-container transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full primary-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {log.actorId?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{log.actorId?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-on-surface-variant capitalize">{log.actorRole}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${actionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-on-surface-variant">{log.targetType}</p>
                    <p className="text-[10px] text-outline font-mono">{log.targetId?.toString().slice(-8)}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-on-surface-variant font-mono">{log.ipAddress || '—'}</td>
                  <td className="px-5 py-4 text-xs text-on-surface-variant whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>

        {meta.pages > 1 && <div className="px-5 py-4 border-t border-black/5 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">Page {page} of {meta.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs disabled:opacity-40 hover:bg-surface-container transition-colors text-on-surface">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(meta.pages, p + 1))} disabled={page === meta.pages} className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs disabled:opacity-40 hover:bg-surface-container transition-colors text-on-surface">
                Next
              </button>
            </div>
          </div>}
      </motion.div>
    </div>;
};
export default AuditLogsPage;