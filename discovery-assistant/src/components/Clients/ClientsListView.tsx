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
  Filter
} from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { ClientCard } from './ClientCard';
import { MeetingPhase, MeetingStatus } from '../../types';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'progress';

export const ClientsListView: React.FC = () => {
  const navigate = useNavigate();
  const {
    zohoClientsList,
    isLoadingClients,
    clientsLoadError,
    fetchZohoClients,
    loadClientFromZoho,
    refreshClientsList
  } = useMeetingStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<MeetingPhase | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
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
    setSortBy('date');
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
      } else if (sortBy === 'date') {
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      } else {
        // progress
        return b.overallProgress - a.overallProgress;
      }
    });

    return filtered;
  }, [zohoClientsList, searchTerm, phaseFilter, statusFilter, sortBy]);

  const hasActiveFilters =
    searchTerm.trim() !== '' || phaseFilter !== 'all' || statusFilter !== 'all';

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
                    viewMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'
                  }`}
                  title="תצוגת רשת"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-gray-200'
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

          {/* Filters Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חיפוש לקוח, חברה או אימייל..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Phase Filter */}
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value as any)}
                className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">כל השלבים</option>
                <option value="discovery">Discovery</option>
                <option value="implementation_spec">Implementation Spec</option>
                <option value="development">Development</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">תאריך עדכון</option>
              <option value="name">שם לקוח</option>
              <option value="progress">התקדמות</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                נקה פילטרים
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {isLoadingClients ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">טוען לקוחות מזוהו...</p>
            </div>
          </div>
        ) : clientsLoadError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <p className="text-red-700 font-semibold mb-2">שגיאה בטעינת הלקוחות</p>
            <p className="text-red-600 text-sm mb-4">{clientsLoadError}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              נסה שוב
            </button>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg mb-2">
              {hasActiveFilters ? 'לא נמצאו לקוחות התואמים לחיפוש' : 'לא נמצאו לקוחות'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                נקה פילטרים
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
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
