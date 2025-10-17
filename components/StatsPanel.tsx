import React, { useState, useEffect, useMemo, FC } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Bar, Line, CartesianGrid } from 'recharts';
import type { Patient } from '../types.ts';
import { PatientStatus } from '../types.ts';
import { ChartBarIcon, XMarkIcon, SpinnerIcon } from './Icons.tsx';
import { getPatientsByDateRange } from '../services/firebase.ts';

interface StatsPanelProps {
  patients: Patient[];
}

type DateRange = 'today' | 'week' | 'month';

const getDateRangeBoundaries = (range: DateRange): { startDate: Date, endDate: Date } => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    if (range === 'week') {
        start.setDate(start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1)); // Assuming Monday is start of week
    } else if (range === 'month') {
        start.setDate(1);
    }
    
    return { startDate: start, endDate: end };
};


const StatsPanel: React.FC<StatsPanelProps> = ({ patients: todayPatients }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [statsData, setStatsData] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      if (dateRange === 'today') {
        setStatsData(todayPatients);
        return;
      }
      
      setIsLoading(true);
      try {
        const { startDate, endDate } = getDateRangeBoundaries(dateRange);
        const data = await getPatientsByDateRange(startDate, endDate);
        setStatsData(data);
      } catch (error) {
        console.error("Failed to fetch historical data:", error);
        setStatsData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dateRange, todayPatients, isOpen]);
  
  const summary = useMemo(() => {
    return {
      waitingCount: statsData.filter(p => p.status === PatientStatus.Waiting).length,
      inProgressCount: statsData.filter(p => p.status === PatientStatus.InProgress).length,
      doneCount: statsData.filter(p => p.status === PatientStatus.Done || p.status === PatientStatus.Skipped).length,
      totalCount: statsData.length,
      totalRevenue: statsData.reduce((acc, p) => acc + (p.amountPaid || 0), 0),
    }
  }, [statsData]);

  const chartData = useMemo(() => {
    if (statsData.length === 0) return [];
    
    const aggregation: { [key: string]: { dateStr: string; formattedDate: string; patients: number; revenue: number } } = {};
    
    statsData.forEach(p => {
        const visitDate = p.visitDate.toDate();
        const dateStr = visitDate.toISOString().split('T')[0];
        if (!aggregation[dateStr]) {
            aggregation[dateStr] = {
                dateStr,
                formattedDate: visitDate.toLocaleDateString('ar-SA', { month: 'numeric', day: 'numeric' }),
                patients: 0,
                revenue: 0
            };
        }
        aggregation[dateStr].patients += 1;
        aggregation[dateStr].revenue += p.amountPaid || 0;
    });

    const { startDate } = getDateRangeBoundaries(dateRange);
    const endDate = new Date();
    const allDaysData = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (aggregation[dateStr]) {
            allDaysData.push(aggregation[dateStr]);
        } else if (dateRange !== 'today') {
             allDaysData.push({
                dateStr,
                formattedDate: currentDate.toLocaleDateString('ar-SA', { month: 'numeric', day: 'numeric' }),
                patients: 0,
                revenue: 0
             });
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if(dateRange === 'today' && allDaysData.length === 0 && statsData.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        allDaysData.push(aggregation[todayStr]);
    }

    return allDaysData;
  }, [statsData, dateRange]);


  if (!isOpen) {
    return (
        <button 
            onClick={() => setIsOpen(true)} 
            className="bg-purple-600 text-white w-16 h-16 rounded-full shadow-lg hover:bg-purple-700 flex items-center justify-center transition"
            title="عرض الإحصائيات"
        >
            <ChartBarIcon className="w-8 h-8"/>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                {summary.totalCount}
            </span>
        </button>
    );
  }
  
  const CustomTooltip: FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-gray-800">{`تاريخ: ${label}`}</p>
          <p className="text-sm text-blue-600">{`المراجعون: ${payload[0].value}`}</p>
          <p className="text-sm text-purple-600">{`الإيرادات: ${payload[1].value.toLocaleString()} د.ع`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-200 w-[90vw] max-w-2xl animate-fade-in flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">إحصائيات الأداء</h2>
        <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-gray-200">
            <XMarkIcon className="w-5 h-5 text-gray-600"/>
        </button>
      </div>
      
       <div className="flex justify-center bg-gray-100 p-1 rounded-lg">
          <DateButton label="اليوم" range="today" activeRange={dateRange} setRange={setDateRange} />
          <DateButton label="هذا الأسبوع" range="week" activeRange={dateRange} setRange={setDateRange} />
          <DateButton label="هذا الشهر" range="month" activeRange={dateRange} setRange={setDateRange} />
      </div>

      <div className="relative">
        {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <SpinnerIcon className="w-10 h-10 text-blue-600" />
            </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <StatCard value={summary.totalCount} label="الإجمالي" color="blue" />
            <StatCard value={summary.waitingCount} label="انتظار" color="yellow" />
            <StatCard value={summary.doneCount} label="مكتمل" color="green" />
            <StatCard value={summary.totalRevenue.toLocaleString()} label="الإيرادات (د.ع)" color="purple" />
        </div>
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="formattedDate" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" tick={{ fill: '#3b82f6', fontSize: 12 }} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} tick={{ fill: '#8b5cf6', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="patients" fill="#3b82f6" name="المراجعون" barSize={20} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="الإيرادات" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const DateButton: FC<{label: string, range: DateRange, activeRange: DateRange, setRange: (r: DateRange) => void}> = ({label, range, activeRange, setRange}) => (
    <button 
        onClick={() => setRange(range)}
        className={`w-full px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeRange === range ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
    >
        {label}
    </button>
);

const StatCard: FC<{value: number | string; label: string; color: 'blue' | 'yellow' | 'green' | 'purple';}> = ({ value, label, color }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        green: 'bg-green-100 text-green-800',
        purple: 'bg-purple-100 text-purple-800',
    };
    return (
        <div className={`${colors[color]} p-3 rounded-lg`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm font-medium">{label}</p>
        </div>
    )
}

export default StatsPanel;