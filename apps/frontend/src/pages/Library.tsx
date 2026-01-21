import { useState, useEffect } from "react";
import { ResearchDomain, ReadingStage, ImpactScore } from "@shared";
import { get, patch, ApiError } from "../services/api";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";

/**
 * Library Page
 * 
 * Displays research papers in a table with filtering, pagination,
 * editing, and archiving capabilities.
 */

interface Paper {
  id: string;
  title: string;
  firstAuthor: string;
  researchDomain: ResearchDomain;
  readingStage: ReadingStage;
  citationCount: number;
  impactScore: ImpactScore;
  dateAdded: string;
  isArchived: boolean;
}

interface PapersResponse {
  items: Paper[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface Filters {
  readingStages: ReadingStage[];
  domains: ResearchDomain[];
  impactScores: ImpactScore[];
  dateRange: "THIS_WEEK" | "THIS_MONTH" | "LAST_3_MONTHS" | "ALL_TIME" | "";
}

interface EditFormData {
  researchDomain: ResearchDomain;
  readingStage: ReadingStage;
  citationCount: number;
}

export function Library() {
  // State
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    readingStages: [],
    domains: [],
    impactScores: [],
    dateRange: ""
  });
  
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [archivingPaperId, setArchivingPaperId] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Fetch papers when filters or page changes
  useEffect(() => {
    fetchPapers();
  }, [filters, page]);

  const fetchPapers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("pageSize", pageSize.toString());
      
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

      const response = await get<PapersResponse>(`/papers?${queryParams.toString()}`);
      setPapers(response.items);
      setTotal(response.pagination.total);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch papers");
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
    setPage(1); // Reset to first page when filters change
  };

  const setDateFilter = (value: Filters["dateRange"]) => {
    setFilters(prev => ({ ...prev, dateRange: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      readingStages: [],
      domains: [],
      impactScores: [],
      dateRange: ""
    });
    setPage(1);
  };

  // Edit handlers
  const handleEdit = (paper: Paper) => {
    setEditingPaper(paper);
    setEditFormData({
      researchDomain: paper.researchDomain,
      readingStage: paper.readingStage,
      citationCount: paper.citationCount
    });
  };

  const handleCancelEdit = () => {
    setEditingPaper(null);
    setEditFormData(null);
  };

  const handleSaveEdit = async () => {
    if (!editingPaper || !editFormData) return;
    
    setIsSaving(true);
    try {
      await patch(`/papers/${editingPaper.id}`, editFormData);
      setEditingPaper(null);
      setEditFormData(null);
      fetchPapers(); // Refresh table
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Error: ${err.message}`);
      } else {
        alert("Failed to update paper");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Archive handlers
  const handleArchiveClick = (paperId: string) => {
    setArchivingPaperId(paperId);
  };

  const handleCancelArchive = () => {
    setArchivingPaperId(null);
  };

  const handleConfirmArchive = async () => {
    if (!archivingPaperId) return;
    
    setIsArchiving(true);
    try {
      await patch(`/papers/${archivingPaperId}/archive`, {});
      setArchivingPaperId(null);
      fetchPapers(); // Refresh table
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Error: ${err.message}`);
      } else {
        alert("Failed to archive paper");
      }
    } finally {
      setIsArchiving(false);
    }
  };

  // Pagination handlers
  const totalPages = Math.ceil(total / pageSize);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Determine empty state message
  const hasActiveFilters = 
    filters.readingStages.length > 0 ||
    filters.domains.length > 0 ||
    filters.impactScores.length > 0 ||
    filters.dateRange !== "";

  const emptyMessage = hasActiveFilters
    ? "No papers match the selected filters."
    : "No papers added yet. Start by adding your first paper.";

  return (
    <div style={{ padding: "2rem 1rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.5rem", color: "#1a202c" }}>
          Paper Library
        </h1>
        <p style={{ fontSize: "1rem", color: "#718096" }}>
          Manage your research papers, track reading progress, and filter by domain or impact score.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "280px 1fr", 
        gap: "1.5rem",
        alignItems: "start"
      }}>
        {/* Filters Card (Left Column) */}
        <div style={{ 
          padding: "1.5rem", 
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
          position: "sticky",
          top: "1rem"
        }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginTop: 0, marginBottom: "1.5rem", color: "#2d3748", paddingBottom: "0.75rem", borderBottom: "2px solid #e2e8f0" }}>
            Filters
          </h3>
          
          {/* Reading Stage Filter */}
          <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #e2e8f0" }}>
            <strong style={{ display: "block", marginBottom: "0.875rem", fontSize: "0.8125rem", color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.025em", fontWeight: "600" }}>
              Reading Stage
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {Object.entries(ReadingStage).map(([key, value]) => (
                <label 
                  key={key} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.625rem", 
                    fontSize: "0.875rem", 
                    cursor: "pointer",
                    padding: "0.25rem 0",
                    transition: "color 0.15s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#1a202c"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "inherit"}
                >
                  <input
                    type="checkbox"
                    checked={filters.readingStages.includes(key as ReadingStage)}
                    onChange={() => toggleFilter("readingStages", key as ReadingStage)}
                    style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#007bff" }}
                  />
                  <span style={{ lineHeight: "1.5" }}>{value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Research Domain Filter */}
          <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #e2e8f0" }}>
            <strong style={{ display: "block", marginBottom: "0.875rem", fontSize: "0.8125rem", color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.025em", fontWeight: "600" }}>
              Research Domain
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {Object.entries(ResearchDomain).map(([key, value]) => (
                <label 
                  key={key} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.625rem", 
                    fontSize: "0.875rem", 
                    cursor: "pointer",
                    padding: "0.25rem 0",
                    transition: "color 0.15s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#1a202c"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "inherit"}
                >
                  <input
                    type="checkbox"
                    checked={filters.domains.includes(key as ResearchDomain)}
                    onChange={() => toggleFilter("domains", key as ResearchDomain)}
                    style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#007bff" }}
                  />
                  <span style={{ lineHeight: "1.5" }}>{value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Impact Score Filter */}
          <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #e2e8f0" }}>
            <strong style={{ display: "block", marginBottom: "0.875rem", fontSize: "0.8125rem", color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.025em", fontWeight: "600" }}>
              Impact Score
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {Object.entries(ImpactScore).map(([key, value]) => (
                <label 
                  key={key} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.625rem", 
                    fontSize: "0.875rem", 
                    cursor: "pointer",
                    padding: "0.25rem 0",
                    transition: "color 0.15s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#1a202c"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "inherit"}
                >
                  <input
                    type="checkbox"
                    checked={filters.impactScores.includes(key as ImpactScore)}
                    onChange={() => toggleFilter("impactScores", key as ImpactScore)}
                    style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#007bff" }}
                  />
                  <span style={{ lineHeight: "1.5" }}>{value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div style={{ marginBottom: "1.5rem" }}>
            <strong style={{ display: "block", marginBottom: "0.875rem", fontSize: "0.8125rem", color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.025em", fontWeight: "600" }}>
              Date Added
            </strong>
            <select 
              value={filters.dateRange} 
              onChange={(e) => setDateFilter(e.target.value as Filters["dateRange"])}
              style={{ 
                width: "100%", 
                padding: "0.625rem 0.75rem", 
                borderRadius: "6px", 
                border: "1px solid #cbd5e0", 
                fontSize: "0.875rem",
                backgroundColor: "white",
                cursor: "pointer",
                transition: "border-color 0.15s ease"
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#007bff"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#cbd5e0"}
            >
              <option value="">All Time</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_3_MONTHS">Last 3 Months</option>
              <option value="ALL_TIME">All Time</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button 
              onClick={clearFilters} 
              style={{ 
                width: "100%",
                padding: "0.625rem 1rem", 
                cursor: "pointer",
                backgroundColor: "#fff",
                border: "1px solid #cbd5e0",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#4a5568",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f7fafc";
                e.currentTarget.style.borderColor = "#a0aec0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fff";
                e.currentTarget.style.borderColor = "#cbd5e0";
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Table Card (Right Column) */}
        <div>
          {/* Error Message */}
          {error && (
            <div style={{ 
              padding: "0.75rem", 
              marginBottom: "1rem", 
              backgroundColor: "#f8d7da", 
              color: "#721c24", 
              border: "1px solid #f5c6cb", 
              borderRadius: "6px" 
            }}>
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
              padding: "4rem 2rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <LoadingSpinner size="large" text="Loading papers..." />
            </div>
          )}

          {/* Empty State */}
          {!loading && papers.length === 0 && (
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
              padding: "4rem 2rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <EmptyState 
                message={emptyMessage} 
                icon={hasActiveFilters ? "🔍" : "📄"}
              />
            </div>
          )}

          {/* Table Card */}
          {!loading && papers.length > 0 && (
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
              overflow: "hidden"
            }}>
              <div style={{ 
                overflowX: "auto",
                WebkitOverflowScrolling: "touch"
              }}>
                <table style={{ 
                  width: "100%", 
                  minWidth: "800px",
                  borderCollapse: "collapse"
                }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f7fafc", borderBottom: "2px solid #e2e8f0" }}>
                      <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", color: "#4a5568" }}>Paper Title</th>
                      <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", color: "#4a5568" }}>First Author</th>
                      <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", color: "#4a5568" }}>Research Domain</th>
                      <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", color: "#4a5568" }}>Reading Stage</th>
                      <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", color: "#4a5568" }}>Impact Score</th>
                      <th style={{ padding: "1rem", textAlign: "right", fontWeight: "600", fontSize: "0.875rem", color: "#4a5568" }}>Citation Count</th>
                      <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", color: "#4a5568" }}>Date Added</th>
                      <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", color: "#4a5568" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {papers.map(paper => (
                      <tr 
                        key={paper.id} 
                        style={{ 
                          borderBottom: "1px solid #e2e8f0",
                          transition: "background-color 0.15s ease"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f7fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td style={{ padding: "1.125rem 1rem", fontSize: "0.875rem", color: "#1a202c" }}>{paper.title}</td>
                        <td style={{ padding: "1.125rem 1rem", fontSize: "0.875rem", color: "#4a5568" }}>{paper.firstAuthor}</td>
                        <td style={{ padding: "1.125rem 1rem" }}>
                          <span style={{ 
                            padding: "0.3125rem 0.625rem", 
                            backgroundColor: "#e3f2fd", 
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            color: "#0d47a1",
                            whiteSpace: "nowrap"
                          }}>
                            {paper.researchDomain}
                          </span>
                        </td>
                        <td style={{ padding: "1.125rem 1rem" }}>
                          <span style={{ 
                            padding: "0.3125rem 0.625rem", 
                            backgroundColor: "#fff3e0", 
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            color: "#e65100",
                            whiteSpace: "nowrap"
                          }}>
                            {paper.readingStage}
                          </span>
                        </td>
                        <td style={{ padding: "1.125rem 1rem" }}>
                          <span style={{ 
                            padding: "0.3125rem 0.625rem", 
                            backgroundColor: "#f3e5f5", 
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            color: "#6a1b9a",
                            whiteSpace: "nowrap"
                          }}>
                            {paper.impactScore}
                          </span>
                        </td>
                        <td style={{ padding: "1.125rem 1rem", textAlign: "right", fontSize: "0.875rem", color: "#1a202c", fontWeight: "500" }}>
                          {paper.citationCount}
                        </td>
                        <td style={{ padding: "1.125rem 1rem", fontSize: "0.875rem", color: "#4a5568" }}>
                          {new Date(paper.dateAdded).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "1.125rem 1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                            <button 
                              onClick={() => handleEdit(paper)}
                              style={{ 
                                padding: "0.5rem 0.875rem",
                                cursor: "pointer",
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                fontSize: "0.8125rem",
                                fontWeight: "500",
                                transition: "background-color 0.15s ease",
                                whiteSpace: "nowrap"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0056b3"}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#007bff"}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleArchiveClick(paper.id)}
                              style={{ 
                                padding: "0.5rem 0.875rem",
                                cursor: "pointer",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                fontSize: "0.8125rem",
                                fontWeight: "500",
                                transition: "background-color 0.15s ease",
                                whiteSpace: "nowrap"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#bd2130"}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#dc3545"}
                            >
                              Archive
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ 
                padding: "1.25rem 1.5rem",
                backgroundColor: "#f7fafc",
                borderTop: "2px solid #e2e8f0",
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center"
              }}>
                <div style={{ fontSize: "0.875rem", color: "#718096", fontWeight: "500" }}>
                  Showing <strong style={{ color: "#4a5568" }}>{((page - 1) * pageSize) + 1}</strong> to <strong style={{ color: "#4a5568" }}>{Math.min(page * pageSize, total)}</strong> of <strong style={{ color: "#4a5568" }}>{total}</strong> papers
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <button 
                    onClick={handlePrevPage} 
                    disabled={page === 1}
                    style={{ 
                      padding: "0.625rem 1.125rem",
                      cursor: page === 1 ? "not-allowed" : "pointer",
                      backgroundColor: page === 1 ? "#e2e8f0" : "#007bff",
                      color: page === 1 ? "#a0aec0" : "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (page !== 1) e.currentTarget.style.backgroundColor = "#0056b3";
                    }}
                    onMouseLeave={(e) => {
                      if (page !== 1) e.currentTarget.style.backgroundColor = "#007bff";
                    }}
                  >
                    ← Previous
                  </button>
                  <span style={{ fontSize: "0.875rem", color: "#4a5568", fontWeight: "500", minWidth: "100px", textAlign: "center" }}>
                    Page {page} of {totalPages}
                  </span>
                  <button 
                    onClick={handleNextPage} 
                    disabled={page === totalPages}
                    style={{ 
                      padding: "0.625rem 1.125rem",
                      cursor: page === totalPages ? "not-allowed" : "pointer",
                      backgroundColor: page === totalPages ? "#e2e8f0" : "#007bff",
                      color: page === totalPages ? "#a0aec0" : "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (page !== totalPages) e.currentTarget.style.backgroundColor = "#0056b3";
                    }}
                    onMouseLeave={(e) => {
                      if (page !== totalPages) e.currentTarget.style.backgroundColor = "#007bff";
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingPaper && editFormData && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            width: "500px",
            maxWidth: "90%"
          }}>
            <h2>Edit Paper</h2>
            <p style={{ marginBottom: "1rem", color: "#666" }}>
              Editing: <strong>{editingPaper.title}</strong>
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500" }}>
                Research Domain
              </label>
              <select
                value={editFormData.researchDomain}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  researchDomain: e.target.value as ResearchDomain 
                })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                {Object.entries(ResearchDomain).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500" }}>
                Reading Stage
              </label>
              <select
                value={editFormData.readingStage}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  readingStage: e.target.value as ReadingStage 
                })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                {Object.entries(ReadingStage).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500" }}>
                Citation Count
              </label>
              <input
                type="number"
                min="0"
                value={editFormData.citationCount}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  citationCount: parseInt(e.target.value) || 0 
                })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isSaving ? "not-allowed" : "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: isSaving ? "#ccc" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isSaving ? "not-allowed" : "pointer"
                }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {archivingPaperId && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            width: "400px",
            maxWidth: "90%"
          }}>
            <h2>Archive Paper</h2>
            <p>Are you sure you want to archive this paper? It will no longer appear in your library.</p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
              <button
                onClick={handleCancelArchive}
                disabled={isArchiving}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isArchiving ? "not-allowed" : "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmArchive}
                disabled={isArchiving}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: isArchiving ? "#ccc" : "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isArchiving ? "not-allowed" : "pointer"
                }}
              >
                {isArchiving ? "Archiving..." : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
