import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Save, Info, ShieldCheck, HelpCircle, RefreshCcw, LayoutPanelLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  useUpsertLegalDocument,
  useGetLegalDocumentByType,
  LegalDocumentType,
} from "@/api/hooks/admins/legal.hook";

const DOCUMENT_METADATA: Record<LegalDocumentType, { label: string; icon: any }> = {
  [LegalDocumentType.PRIVACY_POLICY]: { label: "Privacy Policy", icon: ShieldCheck },
  [LegalDocumentType.TERMS_AND_CONDITIONS]: { label: "Terms & Conditions", icon: FileText },
  [LegalDocumentType.BUSINESS_AND_PAYMENT]: { label: "Business & Payment", icon: LayoutPanelLeft },
  [LegalDocumentType.VENDOR_AND_PARTNER]: { label: "Vendor & Partner", icon: Info },
  [LegalDocumentType.CSR_POLICY]: { label: "CSR Policy", icon: HelpCircle },
  [LegalDocumentType.REFUND_POLICY]: { label: "Refund Policy", icon: RefreshCcw },
  [LegalDocumentType.ABOUT_US]: { label: "About Us", icon: Info },
};

export default function LegalPages() {
  const [selectedType, setSelectedType] = useState<LegalDocumentType>(LegalDocumentType.PRIVACY_POLICY);
  
  const { data: docData, isLoading, isFetching } = useGetLegalDocumentByType(selectedType);
  const { mutate: upsertDoc, isPending: isSaving } = useUpsertLegalDocument();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isPublished: true,
  });

  useEffect(() => {
    if (docData) {
      setFormData({
        title: docData.title,
        content: docData.content,
        isPublished: docData.isPublished,
      });
    } else if (!isLoading) {
      // Set default values if document doesn't exist yet
      setFormData({
        title: DOCUMENT_METADATA[selectedType].label,
        content: "",
        isPublished: true,
      });
    }
  }, [docData, selectedType, isLoading]);

  const handleSave = () => {
    upsertDoc({
      type: selectedType,
      title: formData.title,
      content: formData.content,
      isPublished: formData.isPublished,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Legal Pages</h1>
          <p className="text-muted-foreground">Manage application legal documents and policies dynamically</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Selector */}
        <div className="md:col-span-1 space-y-2">
          {Object.entries(DOCUMENT_METADATA).map(([type, meta]) => {
            const Icon = meta.icon;
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type as LegalDocumentType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "" : "text-muted-foreground/70"}`} />
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Editor Area */}
        <div className="md:col-span-3 h-full">
          <Card className="p-6 h-full flex flex-col min-h-[600px]">
            {isLoading || (isFetching && !docData) ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                Loading document...
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label htmlFor="title" className="mb-2 block">Document Title</Label>
                    <Input 
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Privacy Policy v1.1"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-6 md:pt-0">
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="isPublished"
                        checked={formData.isPublished}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                      />
                      <Label htmlFor="isPublished">Published</Label>
                    </div>
                    {docData && (
                      <Badge variant="outline" className="text-[10px]">
                        Updated: {new Date(docData.updatedAt).toLocaleDateString()} (v{docData.version})
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="content">Content (HTML Editor)</Label>
                    {isFetching && (
                        <span className="text-[10px] text-muted-foreground animate-pulse">
                            Refreshing data...
                        </span>
                    )}
                  </div>
                  <Textarea 
                    id="content"
                    className="flex-1 font-mono text-sm leading-relaxed p-4 bg-slate-50 dark:bg-slate-900 border-dashed"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter your HTML content here... e.g. <h2>1. Information We Collect</h2><p>Description...</p>"
                  />
                  <div className="flex items-start gap-1 p-2 bg-muted/50 rounded-md">
                    <Info className="h-3 w-3 text-primary mt-0.5" />
                    <p className="text-[10px] text-muted-foreground">
                      <strong>Industry Secret:</strong> You can draft your document in any standard HTML editor (like Google Docs export or ChatGPT) and paste the code here. The mobile app will use native rendering for maximum performance.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t mt-auto">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    size="lg"
                    className="w-full md:w-auto shadow-lg shadow-primary/20"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving Content..." : "Update Live App Screen"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
