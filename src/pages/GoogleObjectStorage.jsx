import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Image, Music, Video, Upload, Trash2, ExternalLink, RefreshCw, Search, Download, X } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import GoogleObjectStorageInstructions from "@/components/GoogleObjectStorageInstructions";
import { base44 } from "@/api/base44Client";

const TABS = [
  { id: "images", label: "Images", icon: Image, mimePrefix: "image/" },
  { id: "audio",  label: "Audio",  icon: Music, mimePrefix: "audio/" },
  { id: "video",  label: "Video",  icon: Video,  mimePrefix: "video/" },
];

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}



export default function GoogleObjectStorage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("images");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [folderId, setFolderId] = useState(localStorage.getItem("gs_driveFolderId") || "1yfCUKNYgcbhIkT8pFlEMkFr1hT7ZeJNu");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredImageUrl, setHoveredImageUrl] = useState(null);
  const [clickedImageUrl, setClickedImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [downloadingSample, setDownloadingSample] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRef = useRef(null);

  const currentTab = TABS.find(t => t.id === activeTab);

  const loadFiles = async () => {
    setLoading(true);
    setError("");
    const res = await base44.functions.invoke("driveListFiles", { mimeTypePrefix: currentTab.mimePrefix });
    if (res.data?.error) setError(res.data.error);
    else setFiles(res.data?.files || []);
    setLoading(false);
  };

  useEffect(() => {
    loadFiles();
  }, [activeTab]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      // Upload file to Base44 storage first
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadRes.file_url;
      
      // Then upload to Google Drive using the backend function
      const folderId = localStorage.getItem("gs_driveFolderId") || "";
      const res = await base44.functions.invoke("driveUploadFile", { fileUrl, fileName: file.name, fileType: file.type, folderId });
      if (res.data?.error) setError(res.data.error);
      else await loadFiles();
    } catch (err) {
      setError(err.message || "Upload failed");
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (fileId) => {
    setError("");
    const res = await base44.functions.invoke("driveDeleteFile", { fileId });
    if (res.data?.error) setError(res.data.error);
    else setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDownloadSample = async (type) => {
    setDownloadingSample(true);
    setError("");
    try {
      const functionName = type === "audio" ? "downloadSampleAudio" : "downloadSampleVideo";
      const res = await base44.functions.invoke(functionName);
      
      // Create blob and download
      const blob = new Blob([res.data], { type: type === "audio" ? "audio/mpeg" : "video/mp4" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "audio" ? "sample-audio.mp3" : "sample-video.mp4";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message || "Download failed");
    }
    setDownloadingSample(false);
  };

  const handleMediaClick = async (file) => {
    setError("");
    setSelectedFile(file);
    console.log("Clicking media file:", file.name, file.id, "Tab:", activeTab);
    try {
      const res = await base44.functions.invoke("driveGetAudioStream", { fileId: file.id });
      
      if (res.status >= 400 || res.data?.error) {
        const errorMsg = typeof res.data === 'string' ? res.data : (res.data?.error || 'Failed to load media');
        setError(errorMsg);
        console.error("Media load error:", errorMsg);
        return;
      }
      
      // Get MIME type from response or fallback
      let mimeType = res.data?.mimeType || file.mimeType;
      if (!mimeType) {
        mimeType = activeTab === "audio" ? 'audio/mpeg' : 'video/mp4';
      }
      
      console.log("Creating blob with MIME type:", mimeType);
      
      // Convert base64 to blob
      const base64 = res.data?.data;
      if (!base64) {
        setError('No data received from server');
        return;
      }
      
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      console.log("Media URL created:", url, "Blob size:", blob.size, "MIME:", mimeType);
      
      setMediaUrl(url);
      setMediaDialogOpen(true);
      
      // Log when media is loaded
      setTimeout(() => {
        if (mediaRef.current) {
          console.log("Media element loaded:", mediaRef.current.readyState, mediaRef.current.error);
        }
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to load media");
      console.error("Media load error:", err);
    }
  };

  const filteredFiles = files.filter((f) =>
    !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="absolute top-0 left-0 right-0 h-[15px] bg-black">
        <div className="h-full w-full bg-purple-500"></div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 px-6 py-12 overflow-y-auto">
          <div className="max-w-3xl mx-auto pt-12">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-light tracking-tight text-foreground mb-8 text-center"
            >
              Object Storage
            </motion.h1>

            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                      isActive
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
            )}

            {/* File List */}
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="font-medium text-sm">{currentTab.label} <span className="text-muted-foreground">({filteredFiles.length})</span></h2>
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 h-7 text-xs"
                  />
                  <Select
                    value={folderId}
                    onValueChange={(value) => {
                      setFolderId(value);
                      localStorage.setItem("gs_driveFolderId", value);
                    }}
                  >
                    <SelectTrigger className="w-56 h-7 text-xs">
                      <SelectValue placeholder="Select Drive folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1yfCUKNYgcbhIkT8pFlEMkFr1hT7ZeJNu">Base44 Uploads Folder</SelectItem>
                      <SelectItem value={null}>Root (My Drive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={loadFiles} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={activeTab === "images" ? "image/*" : activeTab === "audio" ? "audio/*,.mp3,.wav,.ogg,.m4a,.flac" : "video/*,.mp4,.avi,.mov,.wmv,.flv,.webm"}
                    className="hidden"
                    onChange={handleUpload}
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {searchQuery ? `No files matching "${searchQuery}"` : `No ${activeTab} found. Click Upload to add files.`}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="text-left px-5 py-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-5 py-3 font-medium text-muted-foreground">Size</th>
                      <th className="text-left px-5 py-3 font-medium text-muted-foreground">Created Time</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((f) => (
                      <tr 
                        key={f.id} 
                        className="border-b last:border-0 hover:bg-muted/10 cursor-pointer"
                        onMouseEnter={() => activeTab === "images" && f.thumbnailLink && setHoveredImageUrl(f.thumbnailLink)}
                        onMouseLeave={() => setHoveredImageUrl(null)}
                        onClick={(e) => {
                          // Prevent triggering when clicking buttons
                          if (e.target.closest('button') || e.target.closest('a')) return;
                          console.log("Row clicked:", f.name, f.id, "Tab:", activeTab);
                          if (activeTab === "images" && f.thumbnailLink) {
                            setClickedImageUrl(f.thumbnailLink);
                          }
                          if ((activeTab === "audio" || activeTab === "video") && f.id) {
                            handleMediaClick(f);
                          }
                        }}
                      >
                        <td className="px-5 py-3 font-medium truncate max-w-[200px]">{f.name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{formatSize(parseInt(f.size))}</td>
                        <td className="px-5 py-3 text-muted-foreground">{f.createdTime ? new Date(f.createdTime).toLocaleString() : "—"}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            {f.webViewLink && (
                              <a href={f.webViewLink} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(f.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Media Playback Dialog */}
              <Dialog open={mediaDialogOpen} onOpenChange={(open) => {
                setMediaDialogOpen(open);
                if (!open) {
                  setMediaUrl(null);
                  setSelectedFile(null);
                }
              }}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {activeTab === "audio" ? <Music className="h-5 w-5 text-purple-600" /> : <Video className="h-5 w-5 text-purple-600" />}
                      {selectedFile?.name || "Media Player"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    {activeTab === "audio" && mediaUrl && (
                      <audio ref={mediaRef} controls src={mediaUrl} className="w-full" autoPlay />
                    )}
                    {activeTab === "video" && mediaUrl && (
                      <video 
                        ref={mediaRef} 
                        controls 
                        src={mediaUrl} 
                        className="w-full rounded-lg bg-black" 
                        autoPlay
                        onError={(e) => {
                          console.error("Video playback error:", e);
                          setError("This video format may not be supported in browsers. Try MP4 format.");
                        }}
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="w-56 border-l border-border bg-muted/20 p-4 flex flex-col gap-2 overflow-y-auto">
          <Button variant="outline" size="sm" onClick={() => navigate("/googlemenu")} className="flex items-center gap-2 text-xs h-8 justify-start">
            <ArrowLeft className="h-3 w-3" />
            Google Menu
          </Button>
          <GoogleObjectStorageInstructions />
          <PageMeta
            page="GoogleObjectStorage.jsx"
            functions={["driveListFiles", "driveUploadFile", "driveDeleteFile", "driveGetAudioStream", "downloadSampleAudio", "downloadSampleVideo"]}
            automations={[]}
            entities={[
              { name: "Google Drive Files", type: "external", db: "Google Drive", id: "1yfCUKNYgcbhIkT8pFlEMkFr1hT7ZeJNu" }
            ]}
          />
          {activeTab === "images" && (hoveredImageUrl || clickedImageUrl) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Preview</p>
              <div className="aspect-square bg-card rounded-lg overflow-hidden flex items-center justify-center">
                <img src={hoveredImageUrl || clickedImageUrl} alt="Preview" className="max-w-full max-h-full object-contain" key={hoveredImageUrl || clickedImageUrl} />
              </div>
            </div>
          )}




        </div>
      </div>
    </div>
  );
}