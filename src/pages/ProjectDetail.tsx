import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Brain, ArrowRight, TableProperties, AlertCircle, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { authHeaders } from "@/lib/auth";

interface DatasetInfo {
  id: number;
  project_id: string;
  original_filename: string;
  row_count: number;
  column_count: number;
  size_bytes: number;
}

interface MissingValue {
  column: string;
  missing: number;
  percentage: number;
}

interface FeatureType {
  type: string;
  count: number;
  fill: string;
}

interface ProfilingData {
  dataset: DatasetInfo;
  missing_values: MissingValue[];
  feature_types: FeatureType[];
}

interface PreviewData {
  headers: string[];
  rows: Record<string, string>[];
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profiling, setProfiling] = useState<ProfilingData | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch profiling data from backend
        const res = await fetch(api.datasets.profiling(id!), { headers: authHeaders() });
        if (!res.ok) throw new Error("Failed to fetch dataset profiling");
        const data: ProfilingData = await res.json();
        setProfiling(data);

        // Fetch preview data (first 5 rows)
        const previewRes = await fetch(api.datasets.preview(id!), { headers: authHeaders() });
        if (previewRes.ok) {
          const previewData = await previewRes.json();
          setPreview(previewData);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dataset profiling. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border max-w-[1600px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-bold tracking-tight">DataKu</span>
        </Link>
        <Link to="/dashboard"><Button variant="ghost">Back to Dashboard</Button></Link>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading dataset profile...</p>
          </div>
        ) : !profiling ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <p className="text-muted-foreground">Failed to load profiling data. Is the backend running?</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dataset Profiling</h1>
                <p className="text-muted-foreground font-mono text-sm">📄 {profiling.dataset.original_filename}</p>
              </div>
              <Button size="lg" className="gap-2" onClick={() => navigate(`/project/${id}/train`)}>
                Configure Job <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Metadata Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Rows", value: profiling.dataset.row_count.toLocaleString() },
                { label: "Columns", value: profiling.dataset.column_count },
                { label: "Missing Values", value: profiling.missing_values.reduce((s, m) => s + m.missing, 0), warn: true },
                { label: "File Size", value: formatFileSize(profiling.dataset.size_bytes) },
              ].map(({ label, value, warn }) => (
                <div key={label} className="glass p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className={`text-2xl font-bold font-mono ${warn ? "text-yellow-500" : "text-primary"}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="glass rounded-xl p-6 lg:col-span-2 border border-border">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-4 mb-6">
                  <AlertCircle className="w-5 h-5 text-yellow-500" /> Missing Values Analysis
                </h3>
                <div className="h-[300px] w-full">
                  {profiling.missing_values.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 text-green-500" />
                      <p className="font-medium text-green-500">No missing values found!</p>
                      <p className="text-sm">Your dataset is clean.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={profiling.missing_values} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="column" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 12, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px' }} />
                        <Bar dataKey="missing" radius={[4, 4, 0, 0]}>
                          {profiling.missing_values.map((_, index) => (
                            <Cell key={`cell-${index}`} fill='hsl(var(--destructive))' fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="glass rounded-xl p-6 border border-border flex flex-col">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-4 mb-4">
                  <TableProperties className="w-5 h-5 text-primary" /> Feature Summary
                </h3>
                <div className="flex-1 flex flex-col justify-center space-y-6">
                  {profiling.feature_types.map((ft, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-end text-sm mb-2">
                        <span className="text-muted-foreground">{ft.type}</span>
                        <span className="text-xl font-bold font-mono">{ft.count}</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(ft.count / profiling.dataset.column_count) * 100}%`, backgroundColor: ft.fill }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dataset Preview */}
            <div className="mt-6 glass rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" /> Dataset Preview
                </h3>
                <span className="text-sm text-muted-foreground">Showing top 5 rows</span>
              </div>
              <div className="rounded-md border border-border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-secondary/50">
                    <TableRow>
                      {preview?.headers.map((h) => <TableHead key={h} className="font-mono text-xs whitespace-nowrap">{h}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview?.rows.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((cell, ci) => <TableCell key={ci} className="text-sm whitespace-nowrap">{String(cell)}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
