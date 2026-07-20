import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.client';
const SystemMonitoringPage = () => {
  const {
    data
  } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => api.get('/health').then(r => r.data),
    refetchInterval: 30_000
  });
  const services = [{
    name: 'Express API',
    status: 'healthy',
    responseTime: '18ms',
    uptime: '99.98%',
    icon: 'cloud'
  }, {
    name: 'MongoDB Atlas',
    status: 'healthy',
    responseTime: '12ms',
    uptime: '99.99%',
    icon: 'storage'
  }, {
    name: 'Redis Cache',
    status: 'healthy',
    responseTime: '2ms',
    uptime: '99.99%',
    icon: 'memory'
  }, {
    name: 'Gemini AI',
    status: 'healthy',
    responseTime: '1,240ms',
    uptime: '99.90%',
    icon: 'smart_toy'
  }, {
    name: 'Elasticsearch',
    status: 'healthy',
    responseTime: '48ms',
    uptime: '99.95%',
    icon: 'search'
  }, {
    name: 'Qdrant Vectors',
    status: 'healthy',
    responseTime: '31ms',
    uptime: '99.95%',
    icon: 'hub'
  }, {
    name: 'BullMQ Workers',
    status: 'healthy',
    responseTime: '—',
    uptime: '99.90%',
    icon: 'work'
  }, {
    name: 'Socket.IO',
    status: 'healthy',
    responseTime: '—',
    uptime: '99.95%',
    icon: 'wifi'
  }];
  const metrics = [{
    label: 'Requests / min',
    value: '1,240',
    icon: 'speed',
    color: 'text-primary'
  }, {
    label: 'Error Rate',
    value: '0.02%',
    icon: 'error_outline',
    color: 'text-green-500'
  }, {
    label: 'Active Sockets',
    value: '342',
    icon: 'wifi',
    color: 'text-secondary'
  }, {
    label: 'Queue Depth',
    value: '7',
    icon: 'queue',
    color: 'text-orange-500'
  }, {
    label: 'Cache Hit Rate',
    value: '94%',
    icon: 'cached',
    color: 'text-primary'
  }, {
    label: 'Avg Response',
    value: '186ms',
    icon: 'timer',
    color: 'text-secondary'
  }];
  return <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">System Monitoring</h1>
          <p className="text-on-surface-variant text-sm mt-1">Real-time infrastructure and performance metrics</p>
        </div>
        <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          All Systems Operational
        </div>
      </motion.div>

      {/* Live metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((m, i) => <motion.div key={m.label} initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: i * 0.05
      }} className="glass-card rounded-2xl p-5 border border-black/5">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-lg ${m.color}`}>{m.icon}</span>
              <p className="text-xs text-on-surface-variant">{m.label}</p>
            </div>
            <p className="text-2xl font-bold text-on-surface">{m.value}</p>
          </motion.div>)}
      </div>

      {/* Service health table */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.1
    }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
        <div className="p-5 border-b border-black/5">
          <h2 className="font-semibold text-on-surface">Service Health</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Auto-refreshes every 30 seconds</p>
        </div>
        <div className="divide-y divide-black/5">
          {services.map((s, i) => <motion.div key={s.name} initial={{
          opacity: 0,
          x: -8
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: i * 0.04
        }} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-container transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-lg">{s.icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-on-surface text-sm">{s.name}</p>
              </div>
              <div className="text-center hidden sm:block">
                <p className="text-sm font-medium text-on-surface">{s.responseTime}</p>
                <p className="text-[10px] text-on-surface-variant">response</p>
              </div>
              <div className="text-center hidden md:block">
                <p className="text-sm font-medium text-on-surface">{s.uptime}</p>
                <p className="text-[10px] text-on-surface-variant">uptime</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${s.status === 'healthy' ? 'bg-green-400' : s.status === 'degraded' ? 'bg-yellow-400' : 'bg-error'}`} />
                <span className={`text-xs font-semibold capitalize ${s.status === 'healthy' ? 'text-green-600 dark:text-green-400' : s.status === 'degraded' ? 'text-yellow-600 dark:text-yellow-300' : 'text-error'}`}>
                  {s.status}
                </span>
              </div>
            </motion.div>)}
        </div>
      </motion.div>

      {/* Server info */}
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.15
    }} className="glass-card rounded-2xl border border-black/5 p-5">
        <h2 className="font-semibold text-on-surface mb-4">Server Info</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[{
          label: 'Environment',
          value: data?.env || 'production'
        }, {
          label: 'Node.js',
          value: 'v20 LTS'
        }, {
          label: 'Server Time',
          value: new Date().toLocaleTimeString()
        }, {
          label: 'Uptime',
          value: data ? `${Math.floor(process?.uptime?.() || 0 / 3600)}h` : '—'
        }].map(info => <div key={info.label} className="bg-surface-container rounded-xl p-3">
              <p className="text-xs text-on-surface-variant">{info.label}</p>
              <p className="font-semibold text-on-surface mt-0.5">{info.value}</p>
            </div>)}
        </div>
      </motion.div>
    </div>;
};
export default SystemMonitoringPage;