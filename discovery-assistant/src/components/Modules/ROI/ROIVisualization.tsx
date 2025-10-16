import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { ROIScenario } from '../../../types';
import { Card } from '../../Common/Card';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ROIVisualizationProps {
  scenarios: {
    conservative?: ROIScenario;
    realistic?: ROIScenario;
    optimistic?: ROIScenario;
  };
  implementationCosts?: {
    initialSetup?: number;
    toolsAndLicenses?: number;
    developerTime?: number;
    training?: number;
    total?: number;
  };
  ongoingCosts?: {
    monthlySubscriptions?: number;
    maintenanceHours?: number;
    supportCosts?: number;
    total?: number;
  };
  netSavings?: {
    month12?: number;
    month24?: number;
    month36?: number;
  };
}

export const ROIVisualization: React.FC<ROIVisualizationProps> = ({
  scenarios,
  implementationCosts,
  ongoingCosts,
  netSavings: _netSavings,
}) => {
  // Helper function to format currency
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '0 ₪';
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Helper function to format percentage
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return '0%';
    return `${value.toFixed(1)}%`;
  };

  // Generate cumulative savings data for payback period chart
  const generatePaybackData = () => {
    const months = Array.from({ length: 36 }, (_, i) => i + 1);
    const conservativeData: number[] = [];
    const realisticData: number[] = [];
    const optimisticData: number[] = [];

    months.forEach((month) => {
      if (scenarios.conservative) {
        const cumulative =
          scenarios.conservative.monthlySavings * month -
          scenarios.conservative.implementationCosts -
          scenarios.conservative.ongoingMonthlyCosts * month;
        conservativeData.push(cumulative);
      }

      if (scenarios.realistic) {
        const cumulative =
          scenarios.realistic.monthlySavings * month -
          scenarios.realistic.implementationCosts -
          scenarios.realistic.ongoingMonthlyCosts * month;
        realisticData.push(cumulative);
      }

      if (scenarios.optimistic) {
        const cumulative =
          scenarios.optimistic.monthlySavings * month -
          scenarios.optimistic.implementationCosts -
          scenarios.optimistic.ongoingMonthlyCosts * month;
        optimisticData.push(cumulative);
      }
    });

    return {
      labels: months.map((m) => `חודש ${m}`),
      datasets: [
        {
          label: 'שמרני',
          data: conservativeData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: (context: any) => {
            const month = context.dataIndex + 1;
            return scenarios.conservative &&
              Math.abs(month - scenarios.conservative.paybackPeriod) < 0.5
              ? 6
              : 0;
          },
          pointBackgroundColor: 'rgb(239, 68, 68)',
        },
        {
          label: 'ריאלי',
          data: realisticData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: (context: any) => {
            const month = context.dataIndex + 1;
            return scenarios.realistic &&
              Math.abs(month - scenarios.realistic.paybackPeriod) < 0.5
              ? 6
              : 0;
          },
          pointBackgroundColor: 'rgb(59, 130, 246)',
        },
        {
          label: 'אופטימי',
          data: optimisticData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: (context: any) => {
            const month = context.dataIndex + 1;
            return scenarios.optimistic &&
              Math.abs(month - scenarios.optimistic.paybackPeriod) < 0.5
              ? 6
              : 0;
          },
          pointBackgroundColor: 'rgb(34, 197, 94)',
        },
      ],
    };
  };

  // Cost breakdown data for doughnut chart
  const generateCostBreakdownData = () => {
    const costs = implementationCosts || {};
    const ongoing = ongoingCosts || {};

    const data = [
      costs.initialSetup || 0,
      costs.toolsAndLicenses || 0,
      costs.developerTime || 0,
      costs.training || 0,
      (ongoing.monthlySubscriptions || 0) * 12, // Annual ongoing costs
    ];

    return {
      labels: [
        'הקמה ראשונית',
        'רישיונות וכלים',
        'זמן פיתוח',
        'הדרכות',
        'עלויות שוטפות (שנתי)',
      ],
      datasets: [
        {
          data: data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(168, 85, 247, 0.8)',
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(34, 197, 94)',
            'rgb(251, 146, 60)',
            'rgb(239, 68, 68)',
            'rgb(168, 85, 247)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // ROI comparison data for bar chart
  const generateROIComparisonData = () => {
    return {
      labels: ['12 חודשים', '24 חודשים', '36 חודשים'],
      datasets: [
        {
          label: 'שמרני',
          data: [
            scenarios.conservative?.roi12Month || 0,
            scenarios.conservative?.roi24Month || 0,
            scenarios.conservative?.roi36Month || 0,
          ],
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
        },
        {
          label: 'ריאלי',
          data: [
            scenarios.realistic?.roi12Month || 0,
            scenarios.realistic?.roi24Month || 0,
            scenarios.realistic?.roi36Month || 0,
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
        },
        {
          label: 'אופטימי',
          data: [
            scenarios.optimistic?.roi12Month || 0,
            scenarios.optimistic?.roi24Month || 0,
            scenarios.optimistic?.roi36Month || 0,
          ],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2,
        },
      ],
    };
  };

  // Chart options
  const paybackChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: 'תקופת החזר השקעה - חיסכון מצטבר לאורך זמן',
        font: { size: 16, weight: 'bold' as const },
      },
      tooltip: {
        rtl: true,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value);
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const costBreakdownOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        rtl: true,
        labels: {
          font: { size: 11 },
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'פירוט עלויות השקעה',
        font: { size: 16, weight: 'bold' as const },
      },
      tooltip: {
        rtl: true,
        callbacks: {
          label: function (context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.parsed;
            label += formatCurrency(value);

            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            label += ` (${percentage}%)`;

            return label;
          },
        },
      },
    },
  };

  const roiComparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: 'השוואת ROI בין תרחישים',
        font: { size: 16, weight: 'bold' as const },
      },
      tooltip: {
        rtl: true,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatPercentage(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: any) {
            return value + '%';
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Check if we have data to display
  const hasData =
    scenarios.conservative || scenarios.realistic || scenarios.optimistic;

  if (!hasData) {
    return (
      <Card variant="glass">
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">אין נתוני תרחישים להצגה</p>
          <p className="text-sm mt-2">
            השלם את חישובי ה-ROI כדי לראות את הוויזואליזציות
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payback Period Chart */}
      <Card
        title="תקופת החזר השקעה"
        subtitle="חיסכון מצטבר לאורך 36 חודשים"
        variant="glass"
      >
        <div className="h-96">
          <Line data={generatePaybackData()} options={paybackChartOptions} />
        </div>
      </Card>

      {/* Cost Breakdown and ROI Comparison side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown Chart */}
        <Card
          title="פירוט עלויות"
          subtitle="התפלגות עלויות ההשקעה"
          variant="glass"
        >
          <div className="h-80">
            <Doughnut
              data={generateCostBreakdownData()}
              options={costBreakdownOptions}
            />
          </div>
        </Card>

        {/* ROI Comparison Chart */}
        <Card title="השוואת ROI" subtitle="החזר השקעה באחוזים" variant="glass">
          <div className="h-80">
            <Bar
              data={generateROIComparisonData()}
              options={roiComparisonOptions}
            />
          </div>
        </Card>
      </div>

      {/* Scenario Comparison Table */}
      <Card
        title="טבלת השוואה מפורטת"
        subtitle="השוואה מלאה בין שלושת התרחישים"
        variant="glass"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  מדד
                </th>
                <th className="text-center py-3 px-4 font-semibold text-red-700 bg-red-50">
                  תרחיש שמרני
                </th>
                <th className="text-center py-3 px-4 font-semibold text-blue-700 bg-blue-50">
                  תרחיש ריאלי
                </th>
                <th className="text-center py-3 px-4 font-semibold text-green-700 bg-green-50">
                  תרחיש אופטימי
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-700">
                  חיסכון חודשי
                </td>
                <td className="text-center py-3 px-4 text-red-700">
                  {formatCurrency(scenarios.conservative?.monthlySavings)}
                </td>
                <td className="text-center py-3 px-4 text-blue-700 bg-blue-50/30">
                  {formatCurrency(scenarios.realistic?.monthlySavings)}
                </td>
                <td className="text-center py-3 px-4 text-green-700">
                  {formatCurrency(scenarios.optimistic?.monthlySavings)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-700">
                  עלות הטמעה
                </td>
                <td className="text-center py-3 px-4 text-red-700">
                  {formatCurrency(scenarios.conservative?.implementationCosts)}
                </td>
                <td className="text-center py-3 px-4 text-blue-700 bg-blue-50/30">
                  {formatCurrency(scenarios.realistic?.implementationCosts)}
                </td>
                <td className="text-center py-3 px-4 text-green-700">
                  {formatCurrency(scenarios.optimistic?.implementationCosts)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-700">
                  עלויות חודשיות שוטפות
                </td>
                <td className="text-center py-3 px-4 text-red-700">
                  {formatCurrency(scenarios.conservative?.ongoingMonthlyCosts)}
                </td>
                <td className="text-center py-3 px-4 text-blue-700 bg-blue-50/30">
                  {formatCurrency(scenarios.realistic?.ongoingMonthlyCosts)}
                </td>
                <td className="text-center py-3 px-4 text-green-700">
                  {formatCurrency(scenarios.optimistic?.ongoingMonthlyCosts)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-700">
                  תקופת החזר (חודשים)
                </td>
                <td className="text-center py-3 px-4 text-red-700 font-semibold">
                  {scenarios.conservative?.paybackPeriod?.toFixed(1) || '-'}
                </td>
                <td className="text-center py-3 px-4 text-blue-700 bg-blue-50/30 font-semibold">
                  {scenarios.realistic?.paybackPeriod?.toFixed(1) || '-'}
                </td>
                <td className="text-center py-3 px-4 text-green-700 font-semibold">
                  {scenarios.optimistic?.paybackPeriod?.toFixed(1) || '-'}
                </td>
              </tr>

              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td className="py-3 px-4 font-bold text-gray-800" colSpan={4}>
                  תחזיות ROI
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-700">
                  ROI לאחר 12 חודשים
                </td>
                <td className="text-center py-3 px-4 text-red-700 font-semibold">
                  {formatPercentage(scenarios.conservative?.roi12Month)}
                </td>
                <td className="text-center py-3 px-4 text-blue-700 bg-blue-50/30 font-semibold">
                  {formatPercentage(scenarios.realistic?.roi12Month)}
                </td>
                <td className="text-center py-3 px-4 text-green-700 font-semibold">
                  {formatPercentage(scenarios.optimistic?.roi12Month)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-700">
                  ROI לאחר 24 חודשים
                </td>
                <td className="text-center py-3 px-4 text-red-700 font-semibold">
                  {formatPercentage(scenarios.conservative?.roi24Month)}
                </td>
                <td className="text-center py-3 px-4 text-blue-700 bg-blue-50/30 font-semibold">
                  {formatPercentage(scenarios.realistic?.roi24Month)}
                </td>
                <td className="text-center py-3 px-4 text-green-700 font-semibold">
                  {formatPercentage(scenarios.optimistic?.roi24Month)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-700">
                  ROI לאחר 36 חודשים
                </td>
                <td className="text-center py-3 px-4 text-red-700 font-semibold">
                  {formatPercentage(scenarios.conservative?.roi36Month)}
                </td>
                <td className="text-center py-3 px-4 text-blue-700 bg-blue-50/30 font-semibold">
                  {formatPercentage(scenarios.realistic?.roi36Month)}
                </td>
                <td className="text-center py-3 px-4 text-green-700 font-semibold">
                  {formatPercentage(scenarios.optimistic?.roi36Month)}
                </td>
              </tr>

              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td className="py-3 px-4 font-bold text-gray-800" colSpan={4}>
                  חיסכון נטו מצטבר
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-700">
                  לאחר 12 חודשים
                </td>
                <td className="text-center py-3 px-4 text-red-700 font-bold">
                  {formatCurrency(scenarios.conservative?.netSavings12Month)}
                </td>
                <td className="text-center py-3 px-4 text-blue-700 bg-blue-50/30 font-bold">
                  {formatCurrency(scenarios.realistic?.netSavings12Month)}
                </td>
                <td className="text-center py-3 px-4 text-green-700 font-bold">
                  {formatCurrency(scenarios.optimistic?.netSavings12Month)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-700">
                  לאחר 24 חודשים
                </td>
                <td className="text-center py-3 px-4 text-red-700 font-bold">
                  {formatCurrency(scenarios.conservative?.netSavings24Month)}
                </td>
                <td className="text-center py-3 px-4 text-blue-700 bg-blue-50/30 font-bold">
                  {formatCurrency(scenarios.realistic?.netSavings24Month)}
                </td>
                <td className="text-center py-3 px-4 text-green-700 font-bold">
                  {formatCurrency(scenarios.optimistic?.netSavings24Month)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-700">
                  לאחר 36 חודשים
                </td>
                <td className="text-center py-3 px-4 text-red-700 font-bold">
                  {formatCurrency(scenarios.conservative?.netSavings36Month)}
                </td>
                <td className="text-center py-3 px-4 text-blue-700 bg-blue-50/30 font-bold">
                  {formatCurrency(scenarios.realistic?.netSavings36Month)}
                </td>
                <td className="text-center py-3 px-4 text-green-700 font-bold">
                  {formatCurrency(scenarios.optimistic?.netSavings36Month)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend for highlighting */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            <span className="inline-block w-4 h-4 bg-blue-50 border border-blue-200 ml-2"></span>
            התרחיש הריאלי מודגש כתרחיש העבודה המומלץ לתכנון
          </p>
        </div>
      </Card>
    </div>
  );
};
