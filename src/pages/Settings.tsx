import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetAllSettings, useManageSetting } from "@/api/hooks/others/settings.hooks";
import { Plus, Edit } from "lucide-react";
import { format } from "date-fns";

export default function Settings() {
  const { data: settingsData, isLoading } = useGetAllSettings();
  const { mutate: updateSetting, isPending } = useManageSetting();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string>("");
  const [editingValue, setEditingValue] = useState<string>("");
  const [isEditingExisting, setIsEditingExisting] = useState<boolean>(false);

  const rawSettings = settingsData?.rawSettings || [];

  const handleOpenDialog = (key: string = "", value: string = "") => {
    setEditingKey(key);
    setEditingValue(value);
    setIsEditingExisting(!!key);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingKey.trim() || !editingValue.trim()) return;
    updateSetting(
      { key: editingKey.trim(), value: editingValue.trim() },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditingKey("");
          setEditingValue("");
          setIsEditingExisting(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage platform configuration keys</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Setting
        </Button>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <h2 className="text-xl font-semibold mb-2">Global Settings</h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading settings...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rawSettings.map((setting: any) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-medium font-mono">{setting.key}</TableCell>
                    <TableCell className="truncate max-w-[300px]">{setting.value}</TableCell>
                    <TableCell>{format(new Date(setting.updatedAt), "MMM dd, yyyy HH:mm")}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(setting.key, setting.value)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rawSettings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No settings found. Add a new setting to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditingExisting ? "Edit Setting" : "Add Setting"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="setting-key">Key</Label>
              <Input
                id="setting-key"
                placeholder="e.g. platformFee"
                value={editingKey}
                onChange={(e) => setEditingKey(e.target.value)}
                disabled={isEditingExisting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setting-value">Value</Label>
              <Input
                id="setting-value"
                placeholder="Enter value"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
              />
            </div>
            <Button className="w-full" disabled={isPending || !editingKey || !editingValue} onClick={handleSave}>
              {isPending ? "Saving..." : "Save Setting"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

