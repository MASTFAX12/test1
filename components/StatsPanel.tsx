import React, { useMemo, FC } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { PatientStatus } from '../types';
import type { PatientVisit, ClinicSettings } from '../types';
import { 
  UserIcon, 
  CurrencyDollarIcon,
  ClockIcon,
} from './Icons.tsx';

interface StatsPanelProps {
  patients: PatientVisit[];
  settings: ClinicSettings; // Kept for future use, not directly used in current logic
}

// A more detailed summary card component
const SummaryCard: FC<{
  title: string;
  revenue: number;
  patientCount: number;
  pendingAmount: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, revenue, patientCount, pendingAmount, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4" style={{ borderColor: color }}>
        <div className="flex items-center gap-4 mb-4">
            {React.cloneElement(icon as React.ReactElement, { className: 'w-8 h-8 p-1.5 rounded-lg text-white', style: { backgroundColor: color }})}
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        <div className="space-y-3">
            <div className="flex justify-between items-baseline">
                <p className="text-sm text-gray-500">الإيرادات المحققة</p>
                <p className="text-xl font-bold text-green-600">{revenue.toLocaleString()} <span className="text-xs font-semibold">د.ع</span></p>
            </div>
            <div className="flex justify-between items-baseline">
                <p className="text-sm text-gray-500">المرضى المكتملون</p>
                <p className="text-xl font-bold text-gray-700">{patientCount}</p>
            </div>
            <div className="flex justify-between items-baseline">
                <p className="text-sm text-gray-500">دفعات معلقة</p>
                <p className="text-xl font-bold text-yellow-600">{pendingAmount.toLocaleString()} <span className="text-xs font-semibold">د.ع</span></p>
            </div>
        </div>
    </div>
);

const CustomTooltip: FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <p className="font-bold text-[var(--theme-color)]">{`الإيراد: ${payload[0].value.toLocaleString()} د.ع`}</p>
      </div>
    );
  }
  return null;
};

// Main StatsPanel component
const StatsPanel: React.FC<StatsPanelProps> = ({ patients }) => {

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Week starts on Saturday for ar-SA locale
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 1 + 7) % 7);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0,0,0,0);
    
    const todayStats = { revenue: 0, patientCount: 0, pendingAmount: 0 };
    const weekStats = { revenue: 0, patientCount: 0, pendingAmount: 0 };
    const monthStats = { revenue: 0, patientCount: 0, pendingAmount: 0 };
    
    const dailyRevenueMap = new Map<string, number>();

    for (const p of patients) {
        const visitDate = p.visitDate.toDate();

        // Aggregate stats for cards
        if (visitDate >= monthStart) {
            // This patient is in the current month
            if (p.status === PatientStatus.Done) {
                monthStats.revenue += p.amountPaid || 0;
                monthStats.patientCount++;
            } else if (p.status === PatientStatus.PendingPayment) {
                monthStats.pendingAmount += p.requiredAmount || 0;
            }

            if (visitDate >= weekStart) {
                // This patient is in the current week
                if (p.status === PatientStatus.Done) {
                    weekStats.revenue += p.amountPaid || 0;
                    weekStats.patientCount++;
                } else if (p.status === PatientStatus.PendingPayment) {
                    weekStats.pendingAmount += p.requiredAmount || 0;
                }

                if (visitDate >= todayStart) {
                    // This patient is from today
                    if (p.status === PatientStatus.Done) {
                        todayStats.revenue += p.amountPaid || 0;
                        todayStats.patientCount++;
                    } else if (p.status === PatientStatus.PendingPayment) {
                        todayStats.pendingAmount += p.requiredAmount || 0;
                    }
                }
            }
        }
        
        // Aggregate stats for chart (last 30 days)
        if (visitDate >= thirtyDaysAgo && p.status === PatientStatus.Done) {
            const dateKey = visitDate.toISOString().split('T')[0];
            const currentRevenue = dailyRevenueMap.get(dateKey) || 0;
            dailyRevenueMap.set(dateKey, currentRevenue + (p.amountPaid || 0));
        }
    }

    const chartData = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        return {
            name: d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
            revenue: dailyRevenueMap.get(dateKey) || 0,
        };
    }).reverse();

    return { today: todayStats, week: weekStats, month: monthStats, chartData };
  }, [patients]);

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">إحصائيات الأداء</h1>
        <p className="text-gray-500">نظرة على أداء العيادة خلال فترات مختلفة.</p>
      </header>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="ملخص اليوم" 
          {...stats.today}
          icon={<ClockIcon />}
          color="#3b82f6" // blue-500
        />
        <SummaryCard 
          title="ملخص الأسبوع" 
          {...stats.week}
          icon={<UserIcon />}
          color="#10b981" // emerald-500
        />
        <SummaryCard 
          title="ملخص الشهر" 
          {...stats.month}
          icon={<CurrencyDollarIcon />}
          color="#8b5cf6" // violet-500
        />
      </div>

      {/* Revenue Chart */}
      <div className="flex-grow bg-white p-6 rounded-2xl shadow-lg flex flex-col min-h-[300px]">
        <h3 className="text-lg font-bold text-gray-800 mb-4">الإيرادات اليومية (آخر 30 يوم)</h3>
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--theme-color)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--theme-color)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis 
                tickFormatter={(value) => new Intl.NumberFormat('ar-IQ', { notation: 'compact', compactDisplay: 'short' }).format(value)}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}/>
              <Area type="monotone" dataKey="revenue" stroke="var(--theme-color)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;