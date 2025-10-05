"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2 } from "lucide-react";
import attributesData from "@/data/attributes.json";

interface Attribute {
  id: string;
  name: string;
  description: string;
}

type AttributeType = "Abilities" | "Tools" | "Styles";

interface AttributesData {
  Abilities: Attribute[];
  Tools: Attribute[];
  Styles: Attribute[];
}

export function AttributesManagement() {
  const [attributes, setAttributes] = useState<AttributesData>({
    Abilities: [],
    Tools: [],
    Styles: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    try {
      const response = await fetch('/api/admin/attributes');
      if (response.ok) {
        const data = await response.json();
        setAttributes(data.attributes);
      } else {
        // Fallback to local data if API fails
        setAttributes(attributesData as AttributesData);
      }
    } catch (error) {
      console.error('Error loading attributes:', error);
      // Fallback to local data
      setAttributes(attributesData as AttributesData);
    }
  };

  const handleAttributeSubmit = async (
    data: Omit<Attribute, 'id'>,
    type: AttributeType,
    attributeId?: string
  ) => {
    setIsLoading(true);
    try {
      if (attributeId) {
        // Update existing attribute
        const response = await fetch(`/api/admin/attributes/${attributeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, type }),
        });
        
        if (response.ok) {
          const { attribute } = await response.json();
          setAttributes(prev => ({
            ...prev,
            [type]: prev[type].map(attr => attr.id === attributeId ? attribute : attr)
          }));
        } else {
          const errorText = await response.text();
          console.error('Update failed:', response.status, errorText);
          throw new Error(`Failed to update attribute: ${errorText}`);
        }
      } else {
        // Add new attribute
        const response = await fetch('/api/admin/attributes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, type }),
        });
        
        if (response.ok) {
          const { attribute } = await response.json();
          setAttributes(prev => ({
            ...prev,
            [type]: [...prev[type], attribute]
          }));
        } else {
          const errorText = await response.text();
          console.error('Create failed:', response.status, errorText);
          throw new Error(`Failed to create attribute: ${errorText}`);
        }
      }
    } catch (error) {
      console.error("Error saving attribute:", error);
      alert(error instanceof Error ? error.message : 'Failed to save attribute');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAttribute = async (id: string, type: AttributeType, attributeName: string) => {
    try {
      // First delete the attribute
      const response = await fetch(`/api/admin/attributes/${id}?type=${type}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setAttributes(prev => ({
          ...prev,
          [type]: prev[type].filter(attr => attr.id !== id)
        }));

        // Then delete all associated badges
        try {
          const badgesResponse = await fetch('/api/admin/badges');
          if (badgesResponse.ok) {
            const { badges } = await badgesResponse.json();
            const associatedBadges = badges.filter((badge: { id: string; attribute: string }) => badge.attribute === attributeName);
            
            // Delete each associated badge
            for (const badge of associatedBadges) {
              await fetch(`/api/admin/badges/${badge.id}`, {
                method: 'DELETE',
              });
            }
          }
        } catch (badgeError) {
          console.error('Error deleting associated badges:', badgeError);
        }
      } else {
        const errorText = await response.text();
        console.error('Delete failed:', response.status, errorText);
        throw new Error(`Failed to delete attribute: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting attribute:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete attribute');
    }
  };

  const renderAttributeTable = (type: AttributeType, title: string, description: string) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <AttributeDialog
            attribute={null}
            type={type}
            onSubmit={handleAttributeSubmit}
            isLoading={isLoading}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add {title.slice(0, -1)}
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes[type].map((attribute) => (
              <TableRow key={attribute.id}>
                <TableCell className="font-medium">{attribute.name}</TableCell>
                <TableCell>{attribute.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <AttributeDialog
                      attribute={attribute}
                      type={type}
                      onSubmit={handleAttributeSubmit}
                      isLoading={isLoading}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DeleteAttributeDialog
                      attributeName={attribute.name}
                      attributeType={type}
                      attributes={attributes}
                      onConfirm={() => deleteAttribute(attribute.id, type, attribute.name)}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="abilities" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="abilities">Abilities</TabsTrigger>
        <TabsTrigger value="tools">Tools</TabsTrigger>
        <TabsTrigger value="styles">Styles</TabsTrigger>
      </TabsList>

      <TabsContent value="abilities">
        {renderAttributeTable(
          "Abilities",
          "Abilities",
          "Psychic and spiritual abilities that readers possess"
        )}
      </TabsContent>

      <TabsContent value="tools">
        {renderAttributeTable(
          "Tools",
          "Tools",
          "Divination tools and methods used in readings"
        )}
      </TabsContent>

      <TabsContent value="styles">
        {renderAttributeTable(
          "Styles",
          "Styles",
          "Reading styles and approaches"
        )}
      </TabsContent>
    </Tabs>
  );
}

// AttributeDialog Component
function AttributeDialog({
  attribute,
  type,
  onSubmit,
  isLoading,
  trigger,
}: {
  attribute: Attribute | null;
  type: AttributeType;
  onSubmit: (data: Omit<Attribute, 'id'>, type: AttributeType, attributeId?: string) => void;
  isLoading: boolean;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: attribute?.name || "",
    description: attribute?.description || "",
  });

  useEffect(() => {
    if (attribute) {
      setFormData({
        name: attribute.name,
        description: attribute.description,
      });
    }
  }, [attribute]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, type, attribute?.id);
    setOpen(false);
    if (!attribute) {
      setFormData({ name: "", description: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{attribute ? "Edit" : "Add"} {type.slice(0, -1)}</DialogTitle>
          <DialogDescription>
            {attribute ? "Update the attribute details" : `Create a new ${type.toLowerCase().slice(0, -1)}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {attribute ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// DeleteAttributeDialog Component
function DeleteAttributeDialog({
  attributeName,
  attributeType,
  attributes,
  onConfirm,
  trigger,
}: {
  attributeName: string;
  attributeType: AttributeType;
  attributes: AttributesData;
  onConfirm: () => void;
  trigger: React.ReactNode;
}) {
  const [badgeCount, setBadgeCount] = useState<number>(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      // Fetch badge count when dialog opens
      fetch('/api/admin/badges')
        .then(res => res.json())
        .then(data => {
          const count = data.badges.filter((badge: { attribute: string }) => badge.attribute === attributeName).length;
          setBadgeCount(count);
        })
        .catch(err => console.error('Error fetching badges:', err));
    }
  }, [open, attributeName]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <div>
                Are you sure you want to delete the attribute &quot;{attributeName}&quot;?
              </div>
              {badgeCount > 0 && (
                <div className="font-semibold text-destructive">
                  ⚠️ This will also delete {badgeCount} associated badge{badgeCount !== 1 ? 's' : ''} that uses this attribute.
                </div>
              )}
              <div className="text-sm">
                This action cannot be undone.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => {
              onConfirm();
              setOpen(false);
            }} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete {badgeCount > 0 && `(${badgeCount + 1} item${badgeCount > 0 ? 's' : ''})`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
