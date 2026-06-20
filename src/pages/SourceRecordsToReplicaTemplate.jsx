import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import PageInfo from "@/components/PageInfo";

export default function SourceRecordsToReplicaTemplate() {
  const navigate = useNavigate();

  return (
    <>
      <PageMeta title="Source Records to Replica Template" />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="icon" onClick={() => navigate("/menu")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Source Records to Replica Template</h1>
          </div>

          <PageInfo
            title="Source Records to Replica Template"
            description="Template page for source records to replica synchronization."
          />

          {/* Content to be added */}
        </div>
      </div>
    </>
  );
}