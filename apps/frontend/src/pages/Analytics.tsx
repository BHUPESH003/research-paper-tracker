import { useState, useEffect } from "react";
import { ResearchDomain, ReadingStage, ImpactScore } from "@shared";
import { get, ApiError } from "../services/api";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ResponsiveContainer
} from "recharts";

/**
 * Analytics Page
 * 
 * Displays analytics dashboard with summary metrics and charts.
 * All analytics computed server-side and consumed from GET /analytics.
 */

interface SummaryMetrics {
  totalPapers: number;
  fullyRead: number;
  completionRate: number;
  avgCitationsByDomain: Record<string, number>;
}

interface FunnelDataItem {
  stage: string;
  count: number;
}

interface ScatterDataItem {
  citationCount: number;
  impactScore: string;
}

interface StackedBarDataItem {
  domain: string;
  [key: string]: string | number; // Dynamic keys for reading stages
}

interface AnalyticsResponse {
  funnel: FunnelDataItem[];
  scatter: ScatterDataItem[];
  stackedBar: StackedBarDataItem[];
  summary: SummaryMetrics;
}

interface Filters {
  readingStages: ReadingStage[];
  domains: ResearchDomain[];
  impactScores: ImpactScore[];
  dateRange: "THIS_WEEK" | "THIS_MONTH" | "LAST_3_MONTHS" | "ALL_TIME" | "";
}

// Color mapping for Impact Scores in scatter plot
const IMPACT_COLORS: Record<string, string> = {
  "High Impact": "#d32f2f",
  "Medium Impact": "#f57c00",
  "Low Impact": "#fbc02d",
  "Unknown": "#757575"
};

// Color palette for stacked bars
const STAGE_COLORS = [
  "#1976d2",
  "#388e3c",
  "#f57c00",
  "#7b1fa2",
  "#c2185b",
  "#00796b"
];

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    readingStages: [],
    domains: [],
    impactScores: [],
    dateRange: ""
  });

  // Fetch analytics when filters change
  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();

      if (filters.readingStages.length > 0) {
        filters.readingStages.forEach(stage =>
          queryParams.append("readingStages", stage)
        );
      }

      if (filters.domains.length > 0) {
        filters.domains.forEach(domain =>
          queryParams.append("domains", domain)
        );
      }

      if (filters.impactScores.length > 0) {
        filters.impactScores.forEach(score =>
          queryParams.append("impactScores", score)
        );
      }

      if (filters.dateRange) {
        queryParams.append("dateRange", filters.dateRange);
      }

      const response = await get<AnalyticsResponse>(`/analytics?${queryParams.toString()}`);
      setAnalytics(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter handlers
  const toggleFilter = <K extends keyof Filters>(
    filterKey: K,
    value: Filters[K] extends Array<infer U> ? U : never
  ) => {
    setFilters(prev => {
      const currentArray = prev[filterKey] as unknown[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];
      return { ...prev, [filterKey]: newArray };
    });
  };

  const setDateFilter = (value: Filters["dateRange"]) => {
    setFilters(prev => ({ ...prev, dateRange: value }));
  };

  const clearFilters = () => {
    setFilters({
      readingStages: [],
      domains: [],
      impactScores: [],
      dateRange: ""
    });
  };

  const hasActiveFilters =
    filters.readingStages.length > 0 ||
    filters.domains.length > 0 ||
    filters.impactScores.length > 0 ||
    filters.dateRange !== "";

  // Group scatter data by impact score for color coding
  const scatterDataByImpact = analytics?.scatter?.reduce((acc, item) => {
    if (!acc[item.impactScore]) {
      acc[item.impactScore] = [];
    }
    acc[item.impactScore].push(item);
    return acc;
  }, {} as Record<string, ScatterDataItem[]>) || {};

  // Extract reading stage keys for stacked bar chart
  const readingStageKeys = analytics?.stackedBar && analytics.stackedBar.length > 0
    ? Object.keys(analytics.stackedBar[0]).filter(key => key !== "domain")
    : [];

  return (
    <div style={{ padding: "2rem 1rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.5rem", color: "#1a202c" }}>
          Reading Analytics
        </h1>
        <p style={{ fontSize: "1rem", color: "#718096" }}>
          Track your research progress with visualizations of reading stages, citation patterns, and domain distribution.
        </p>
      </div>

      {/* Filters Card */}
      <div style={{
        marginBottom: "2rem",
        padding: "1.5rem",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)"
      }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginTop: 0, marginBottom: "1.5rem", color: "#2d3748" }}>
          Filters
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          {/* Reading Stage Filter */}
          <div>
            <strong style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#4a5568" }}>Reading Stage</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {Object.entries(ReadingStage).map(([key, value]) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={filters.readingStages.includes(key as ReadingStage)}
                    onChange={() => toggleFilter("readingStages", key as ReadingStage)}
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Research Domain Filter */}
          <div>
            <strong style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#4a5568" }}>Research Domain</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {Object.entries(ResearchDomain).map(([key, value]) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={filters.domains.includes(key as ResearchDomain)}
                    onChange={() => toggleFilter("domains", key as ResearchDomain)}
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Impact Score Filter */}
          <div>
            <strong style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#4a5568" }}>Impact Score</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {Object.entries(ImpactScore).map(([key, value]) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={filters.impactScores.includes(key as ImpactScore)}
                    onChange={() => toggleFilter("impactScores", key as ImpactScore)}
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <strong style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#4a5568" }}>Date Added</strong>
            <select
              value={filters.dateRange}
              onChange={(e) => setDateFilter(e.target.value as Filters["dateRange"])}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e0", fontSize: "0.875rem" }}
            >
              <option value="">All Time</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_3_MONTHS">Last 3 Months</option>
              <option value="ALL_TIME">All Time</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #e2e8f0" }}>
            <button 
              onClick={clearFilters} 
              style={{ 
                padding: "0.5rem 1rem", 
                cursor: "pointer",
                backgroundColor: "#f7fafc",
                border: "1px solid #cbd5e0",
                borderRadius: "4px",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#4a5568"
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: "0.75rem",
          marginBottom: "1rem",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          border: "1px solid #f5c6cb",
          borderRadius: "4px"
        }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingSpinner size="large" text="Loading analytics..." />}

      {/* Empty State */}
      {!loading && analytics && analytics.summary.totalPapers === 0 && (
        <EmptyState 
          message="Add research papers to see analytics." 
          icon="📊"
        />
      )}

      {/* Analytics Content */}
      {!loading && analytics && analytics.summary.totalPapers > 0 && (
        <>
          {/* Summary Cards */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem", 
            marginBottom: "2rem"
          }}>
            {/* Total Papers Card */}
            <div style={{
              padding: "2rem",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
              borderLeft: "4px solid #1976d2"
            }}>
              <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "0.875rem", fontWeight: "600", color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Total Papers
              </h3>
              <p style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700", color: "#1976d2" }}>
                {analytics.summary.totalPapers}
              </p>
            </div>

            {/* Fully Read Card */}
            <div style={{
              padding: "2rem",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
              borderLeft: "4px solid #388e3c"
            }}>
              <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "0.875rem", fontWeight: "600", color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Fully Read Papers
              </h3>
              <p style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700", color: "#388e3c" }}>
                {analytics.summary.fullyRead}
              </p>
            </div>

            {/* Completion Rate Card */}
            <div style={{
              padding: "2rem",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
              borderLeft: "4px solid #f57c00"
            }}>
              <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "0.875rem", fontWeight: "600", color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Completion Rate
              </h3>
              <p style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700", color: "#f57c00" }}>
                {(analytics.summary.completionRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
            {/* Funnel Chart Card */}
            <div style={{
              padding: "2rem",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)"
            }}>
              <h2 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: "600", color: "#2d3748" }}>
                Reading Progress Funnel
              </h2>
              <div style={{ width: "100%", overflowX: "auto" }}>
                <ResponsiveContainer width="100%" height={320} minWidth={300}>
                  <BarChart data={analytics.funnel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip formatter={(value) => {
                      if (typeof value === 'number') return value;
                      if (typeof value === 'string') return value;
                      return String(value);
                    }} />
                    <Legend />
                    <Bar dataKey="count" fill="#1976d2" name="Paper Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scatter Plot Card */}
            <div style={{
              padding: "2rem",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)"
            }}>
              <h2 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: "600", color: "#2d3748" }}>
                Citation Count by Impact Score
              </h2>
              <div style={{ width: "100%", overflowX: "auto" }}>
                <ResponsiveContainer width="100%" height={320} minWidth={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="citationCount" name="Citation Count" />
                    <YAxis type="category" dataKey="impactScore" name="Impact Score" hide />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value) => {
                        if (typeof value === 'number') return value;
                        if (typeof value === 'string') return value;
                        return String(value);
                      }}
                    />
                    <Legend />
                    {Object.entries(scatterDataByImpact).map(([impactScore, data]) => (
                      <Scatter
                        key={impactScore}
                        name={impactScore}
                        data={data}
                        fill={IMPACT_COLORS[impactScore] || "#999"}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stacked Bar Chart Card */}
            <div style={{
              padding: "2rem",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)"
            }}>
              <h2 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: "600", color: "#2d3748" }}>
                Papers by Domain and Reading Stage
              </h2>
              <div style={{ width: "100%", overflowX: "auto" }}>
                <ResponsiveContainer width="100%" height={320} minWidth={300}>
                  <BarChart data={analytics.stackedBar}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="domain" />
                    <YAxis />
                    <Tooltip formatter={(value) => {
                      if (typeof value === 'number') return value;
                      if (typeof value === 'string') return value;
                      return String(value);
                    }} />
                    <Legend />
                    {readingStageKeys.map((stage, index) => (
                      <Bar
                        key={stage}
                        dataKey={stage}
                        stackId="a"
                        fill={STAGE_COLORS[index % STAGE_COLORS.length]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
