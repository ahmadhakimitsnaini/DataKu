import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Brain, ArrowRight, TableProperties, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock dataset metadata
  const metadata = {
    filename: "customer_churn.csv",
    rows: 7043,
    columns: 19,
    missingValues: 11,
    size: "1.2 MB"
  };

  // Mock data untuk Bar Chart Kolom Kosong (Missing Values)
  const missingDataData = [
    { column: 'TotalCharges', missing: 11, percentage: 0.15 },
    { column: 'MultipleLines', missing: 0, percentage: 0 },
    { column: 'InternetService', missing: 0, percentage: 0 },
    { column: 'OnlineSecurity', missing: 0, percentage: 0 },
    { column: 'DeviceProtection', missing: 0, percentage: 0 },
    { column: 'TechSupport', missing: 0, percentage: 0 },
    { column: 'StreamingTV', missing: 0, percentage: 0 },
  ].sort((a, b) => b.missing - a.missing); // Urutkan dari yang terbanyak putus

  // Mock data tipe data fitur
  const featureTypes = [
    { type: 'Numerical', count: 4, fill: '#8884d8' },
    { type: 'Categorical', count: 14, fill: '#82ca9d' },
    { type: 'Boolean', count: 1, fill: '#ffc658' },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border max-w-[1600px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-bold tracking-tight">AutoML</span>
        </Link>
        <Link to="/dashboard">
          <Button variant="ghost">Back to Dashboard</Button>
        </Link>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dataset Profiling</h1>
            <p className="text-muted-foreground">
              Project ID: {id}
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => navigate(`/project/${id}/train`)}>
            Configure Job <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Metadata Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">Rows</p>
            <p className="text-2xl font-bold font-mono text-primary">{metadata.rows.toLocaleString()}</p>
          </div>
          <div className="glass p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">Columns</p>
            <p className="text-2xl font-bold font-mono text-primary">{metadata.columns}</p>
          </div>
          <div className="glass p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">Missing Values</p>
            <p className="text-2xl font-bold font-mono text-warning text-yellow-500">{metadata.missingValues}</p>
          </div>
          <div className="glass p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">File Size</p>
            <p className="text-2xl font-bold font-mono text-primary">{metadata.size}</p>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Missing Values Chart (Takes up 2 columns) */}
          <div className="glass rounded-xl p-6 lg:col-span-2 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning" /> 
                  Missing Values Analysis
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Columns with the highest number of null/empty rows.
                </p>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={missingDataData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="column" 
                    angle={-45} 
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: 12, fill: '#888' }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="missing" radius={[4, 4, 0, 0]}>
                    {missingDataData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.missing > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} 
                        fillOpacity={entry.missing > 0 ? 0.8 : 0.3}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feature Types Summary */}
          <div className="glass rounded-xl p-6 shadow-sm border border-border flex flex-col">
            <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-4 mb-4">
              <TableProperties className="w-5 h-5 text-primary" /> Feature Summary
            </h3>
            
            <div className="flex-1 flex flex-col justify-center space-y-6">
              {featureTypes.map((ft, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end text-sm">
                    <span className="text-muted-foreground font-medium">{ft.type}</span>
                    <span className="text-xl font-bold font-mono">{ft.count}</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${(ft.count / metadata.columns) * 100}%`,
                        backgroundColor: ft.fill 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm text-primary">
              <p>The system will automatically convert strings to categorical variables and normalize numeric data during training.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
