import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Database, Plus, Pencil, Trash2, RefreshCw, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageMeta from "@/components/PageMeta";

export default function GoogleSQL() {
  const navigate = useNavigate();
  const [tableName, setTableName] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [formData, setFormData] = useState({});

  const loadRows = async () => {
    if (!tableName) return;
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("sqlServerList", { tableName });
      if (res.data?.error) setError(res.data.error);
      else setRows(res.data?.rows || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    try {
      const res = await base44.functions.invoke("sqlServerCreate", { tableName, data: formData });
      if (res.data?.error) setError(res.data.error);
      else {
        setCreateDialogOpen(false);
        setFormData({});
        await loadRows();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await base44.functions.invoke("sqlServerUpdate", { 
        tableName, 
        id: currentRow.id, 
        data: formData 
      });
      if (res.data?.error) setError(res.data.error);
      else {
        setEditDialogOpen(false);
        setCurrentRow(null);
        setFormData({});
        await loadRows();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await base44.functions.invoke("sqlServerDelete", { tableName, id });
      if (res.data?.error) setError(res.data.error);
      else await loadRows();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditDialog = (row) => {
    setCurrentRow(row);
    setFormData(row);
    setEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    setFormData({});
    setCreateDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="absolute top-0 left-0 right-0 h-[15px] bg-black">
        <div className="h-full w-full bg-purple-500"></div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 px-6 py-12 overflow-y-auto">
          <div className="max-w-5xl mx-auto pt-12">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-light tracking-tight text-foreground mb-8 text-center"
            >
              Google Cloud SQL for SQL Server
            </motion.h1>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
            )}

            {/* Connection Settings */}
            <div className="bg-card border rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-purple-600" />
                <h2 className="font-semibold text-foreground">Table Configuration</h2>
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Table Name</label>
                  <Input
                    placeholder="e.g., Customers, Orders, Products"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button onClick={loadRows} disabled={loading || !tableName} className="flex items-center gap-2">
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Loading..." : "Load Data"}
                </Button>
                <Button onClick={openCreateDialog} disabled={!tableName} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Record
                </Button>
              </div>
            </div>

            {/* Data Table */}
            {rows.length > 0 && (
              <div className="bg-card border rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b bg-muted/30">
                  <h2 className="font-medium text-sm">{tableName} ({rows.length} records)</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/20">
                        {Object.keys(rows[0] || {}).map((key) => (
                          <th key={key} className="text-left px-5 py-3 font-medium text-muted-foreground">{key}</th>
                        ))}
                        <th className="px-5 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => (
                        <tr key={idx} className="border-b last:border-0 hover:bg-muted/10">
                          {Object.values(row).map((value, i) => (
                            <td key={i} className="px-5 py-3 text-foreground">{value}</td>
                          ))}
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditDialog(row)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(row.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input
                    placeholder="Column values will be auto-detected"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Button onClick={handleCreate} className="w-full">Create</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {Object.keys(formData).map((key) => (
                    <div key={key}>
                      <label className="text-xs text-muted-foreground mb-1 block capitalize">{key}</label>
                      <Input
                        value={formData[key] || ""}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                  <Button onClick={handleUpdate} className="w-full">Update</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="w-56 border-l border-border bg-muted/20 p-4 flex flex-col gap-2 overflow-y-auto">
          <Button variant="outline" size="sm" onClick={() => navigate("/googlemenu")} className="flex items-center gap-2 text-xs h-8 justify-start">
            <ArrowLeft className="h-3 w-3" />
            Google Menu
          </Button>
          <PageMeta
            page="GoogleSQL.jsx"
            functions={["sqlServerList", "sqlServerCreate", "sqlServerUpdate", "sqlServerDelete"]}
            automations={[]}
            entities={[
              { name: "Cloud SQL Server", type: "external", db: "Google Cloud SQL", server: "CLOUD_SQL_SERVER" }
            ]}
          />
        </div>
      </div>
    </div>
  );
}