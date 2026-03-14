import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Brain, ArrowRight, TableProperties, AlertCircle, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const metadata = { filename: "customer_churn.csv", rows: 7043, columns: 19, missingValues: 11, size: "1.2 MB" };

  const missingDataData = [
    { column: 'TotalCharges', missing: 11, percentage: 0.15 },
    { column: 'MultipleLines', missing: 0, percentage: 0 },
    { column: 'InternetService', missing: 0, percentage: 0 },
    { column: 'OnlineSecurity', missing: 0, percentage: 0 },
    { column: 'DeviceProtection', missing: 0, percentage: 0 },
  ].sort((a, b) => b.missing - a.missing);

  const featureTypes = [
    { type: 'Numerical', count: 4, fill: '#8884d8' },
    { type: 'Categorical', count: 14, fill: '#82ca9d' },
    { type: 'Boolean', count: 1, fill: '#ffc658' },
  ];

  const previewHeaders = ["customer_id", "gender", "tenure", "PhoneService", "TotalCharges", "Churn"];
  const previewData = [
    { id: "7590-VHVEG", gender: "Female", tenure: "1", phone: "No", total: "29.85", churn: "No" },
    { id: "5575-GNVDE", gender: "Male", tenure: "34", phone: "Yes", total: "1889.5", churn: "No" },
    { id: "3668-QPYBK", gender: "Male", tenure: "2", phone: "Yes", total: "108.15", churn: "Yes" },
    { id: "7795-CFOCW", gender: "Male", tenure: "45", phone: "No", total: "1840.75", churn: "No" },
    { id: "9237-HQITU", gender: "Female", tenure: "2", phone: "Yes", total: "151.65", churn: "Yes" },
  ];

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
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dataset Profiling</h1>
            <p className="text-muted-foreground">Project ID: {id}</p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => navigate(`/project/${id}/train`)}>
            Configure Job <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Metadata Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Rows", value: metadata.rows.toLocaleString() },
            { label: "Columns", value: metadata.columns },
            { label: "Missing Values", value: metadata.missingValues, warn: true },
            { label: "File Size", value: metadata.size },
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={missingDataData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="column" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px' }} />
                  <Bar dataKey="missing" radius={[4, 4, 0, 0]}>
                    {missingDataData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.missing > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} fillOpacity={entry.missing > 0 ? 0.8 : 0.3} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-xl p-6 border border-border flex flex-col">
            <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-4 mb-4">
              <TableProperties className="w-5 h-5 text-primary" /> Feature Summary
            </h3>
            <div className="flex-1 flex flex-col justify-center space-y-6">
              {featureTypes.map((ft, i) => (
                <div key={i}>
                  <div className="flex justify-between items-end text-sm mb-2">
                    <span className="text-muted-foreground">{ft.type}</span>
                    <span className="text-xl font-bold font-mono">{ft.count}</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(ft.count / metadata.columns) * 100}%`, backgroundColor: ft.fill }} />
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
                  {previewHeaders.map((h) => <TableHead key={h} className="font-mono text-xs whitespace-nowrap">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((cell, ci) => <TableCell key={ci} className="text-sm whitespace-nowrap">{cell}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
