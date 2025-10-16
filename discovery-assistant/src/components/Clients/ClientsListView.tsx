import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Grid,
  List,
  Search,
  X,
  Filter,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { ClientCard } from './ClientCard';
import { MeetingPhase, MeetingStatus } from '../../types';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'created' | 'progress';

export const ClientsListView: React.FC = () => {
  const navigate = useNavigate();
  const {
    zohoClientsList,
    isLoadingClients,
    clientsLoadError,
    fetchZohoClients,
    loadClientFromZoho,
    refreshClientsList,
  } = useMeetingStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<MeetingPhase | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | 'all'>(
    'all'
  );
  const [sortBy, setSortBy] = useState<SortBy>('created');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    await fetchZohoClients({ force: false });
  };

  const handleSelectClient = async (recordId: string) => {
    setSelectedClient(recordId);
    try {
      await loadClientFromZoho(recordId);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to load client:', error);
      alert('שגיאה בטעינת הלקוח. אנא נסה שוב.');
    }
  };

  const handleRefresh = async () => {
    await refreshClientsList();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setPhaseFilter('all');
    setStatusFilter('all');
    setSortBy('created');
  };

  // Filter and sort logic
  const filteredClients = useMemo(() => {
    let filtered = [...zohoClientsList];

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.clientName.toLowerCase().includes(search) ||
          c.companyName?.toLowerCase().includes(search) ||
          c.email?.toLowerCase().includes(search)
      );
    }

    // Phase filter
    if (phaseFilter !== 'all') {
      filtered = filtered.filter((c) => c.phase === phaseFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.clientName.localeCompare(b.clientName, 'he');
      } else if (sortBy === 'created') {
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      } else {
        // progress
        return b.overallProgress - a.overallProgress;
      }
    });

    return filtered;
  }, [zohoClientsList, searchTerm, phaseFilter, statusFilter, sortBy]);

  const hasActiveFilters =
    searchTerm.trim() !== '' || phaseFilter !== 'all' || statusFilter !== 'all';

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const totalClients = zohoClientsList.length;
    const activeClients = zohoClientsList.filter((c) =>
      ['discovery', 'implementation_spec', 'development'].includes(c.phase)
    ).length;
    const completedClients = zohoClientsList.filter(
      (c) => c.phase === 'completed'
    ).length;
    const avgProgress =
      totalClients > 0
        ? Math.round(
            zohoClientsList.reduce((sum, c) => sum + c.overallProgress, 0) /
              totalClients
          )
        : 0;

    return {
      totalClients,
      activeClients,
      completedClients,
      avgProgress,
    };
  }, [zohoClientsList]);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-md border-b sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="חזור לדשבורד"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">כל הלקוחות</h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {filteredClients.length}
                {hasActiveFilters && ` מתוך ${zohoClientsList.length}`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white shadow'
                      : 'hover:bg-gray-200'
                  }`}
                  title="תצוגת רשת"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-white shadow'
                      : 'hover:bg-gray-200'
                  }`}
                  title="תצוגת רשימה"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isLoadingClients}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoadingClients ? 'animate-spin' : ''}`}
                />
                <span>רענן</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 opacity-80" />
              <div className="text-2xl font-bold">
                {dashboardMetrics.totalClients}
              </div>
              <div className="text-sm opacity-80">סה"כ לקוחות</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 opacity-80" />
              <div className="text-2xl font-bold">
                {dashboardMetrics.activeClients}
              </div>
              <div className="text-sm opacity-80">בפיתוח</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 opacity-80" />
              <div className="text-2xl font-bold">
                {dashboardMetrics.completedClients}
              </div>
              <div className="text-sm opacity-80">הושלמו</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 opacity-80" />
              <div className="text-2xl font-bold">
                {dashboardMetrics.avgProgress}%
              </div>
              <div className="text-sm opacity-80">התקדמות ממוצעת</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search Section */}
            <div className="flex-1 min-w-[280px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                חיפוש לקוחות
              </label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="חיפוש לפי שם, חברה או אימייל..."
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Phase Filter */}
              <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שלב פרויקט
                </label>
                <div className="relative">
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={phaseFilter}
                    onChange={(e) => setPhaseFilter(e.target.value as any)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">כל השלבים</option>
                    <option value="discovery">🔍 Discovery</option>
                    <option value="implementation_spec">
                      📋 Implementation Spec
                    </option>
                    <option value="development">⚙️ Development</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </div>
              </div>

              {/* Sort */}
              <div className="min-w-[160px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מיין לפי
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="created">📅 תאריך יצירה</option>
                  <option value="name">👤 שם לקוח</option>
                  <option value="progress">📈 התקדמות</option>
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                  >
                    🗑️ נקה פילטרים
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {isLoadingClients ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
              <div className="relative mb-6">
                <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                <div className="absolute inset-0 w-12 h-12 mx-auto border-4 border-blue-200 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                טוען לקוחות
              </h3>
              <p className="text-gray-600 text-sm">
                אנא המתן בזמן שאנחנו טוענים את נתוני הלקוחות מ-Zoho CRM...
              </p>
            </div>
          </div>
        ) : clientsLoadError ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 text-center shadow-lg">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                שגיאה בטעינת הלקוחות
              </h3>
              <p className="text-red-700 text-sm mb-6 leading-relaxed">
                {clientsLoadError}
              </p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                נסה שוב
              </button>
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-12 text-center shadow-lg">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {hasActiveFilters
                  ? 'לא נמצאו לקוחות התואמים לחיפוש'
                  : 'אין לקוחות עדיין'}
              </h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {hasActiveFilters
                  ? 'נסה לשנות את הפילטרים או להרחיב את חיפושך כדי למצוא לקוחות'
                  : 'התחל ביצירת לקוח ראשון או ייבא נתונים מ-Zoho CRM'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  <X className="w-4 h-4" />
                  נקה פילטרים
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'
                : 'space-y-6 max-w-4xl mx-auto'
            }
          >
            {filteredClients.map((client) => (
              <ClientCard
                key={client.recordId}
                client={client}
                onClick={() => handleSelectClient(client.recordId)}
                selected={selectedClient === client.recordId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
