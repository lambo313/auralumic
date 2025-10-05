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
import { Plus, Edit, Trash2 } from "lucide-react";
import badgesData from "@/data/badges.json";
import attributesData from "@/data/attributes.json";

interface BadgeData {
  id: string;
  name: string;
  attribute: string;
  tier: "Bronze" | "Silver" | "Gold";
  requirements: {
    readingsCompleted: number;
    averageRating?: number;
    timeframe?: number;
  };
  icon: string;
  description: string;
}

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

export function BadgesManagement() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [attributesByType, setAttributesByType] = useState<AttributesData>({
    Abilities: [],
    Tools: [],
    Styles: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterAttribute, setFilterAttribute] = useState<string>("all");

  useEffect(() => {
    loadBadges();
    loadAttributes();
  }, []);

  const loadBadges = async () => {
    try {
      const response = await fetch('/api/admin/badges');
      if (response.ok) {
        const data = await response.json();
        setBadges(data.badges);
      } else {
        // Fallback to local data if API fails
        const transformedBadges: BadgeData[] = badgesData.badges.map(badge => ({
          ...badge,
          tier: badge.tier as "Bronze" | "Silver" | "Gold"
        }));
        setBadges(transformedBadges);
      }
    } catch (error) {
      console.error('Error loading badges:', error);
      const transformedBadges: BadgeData[] = badgesData.badges.map(badge => ({
        ...badge,
        tier: badge.tier as "Bronze" | "Silver" | "Gold"
      }));
      setBadges(transformedBadges);
    }
  };

  const loadAttributes = () => {
    setAttributesByType(attributesData as AttributesData);
  };

  const handleBadgeSubmit = async (data: Omit<BadgeData, 'id'>, badgeId?: string) => {
    setIsLoading(true);
    try {
      if (badgeId) {
        // Update existing badge
        const response = await fetch(`/api/admin/badges/${badgeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (response.ok) {
          const { badge } = await response.json();
          setBadges(prev => prev.map(b => b.id === badgeId ? badge : b));
        } else {
          throw new Error('Failed to update badge');
        }
      } else {
        // Add new badge
        const response = await fetch('/api/admin/badges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (response.ok) {
          const { badge } = await response.json();
          setBadges(prev => [...prev, badge]);
        } else {
          throw new Error('Failed to create badge');
        }
      }
    } catch (error) {
      console.error("Error saving badge:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBadge = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/badges/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setBadges(prev => prev.filter(badge => badge.id !== id));
      } else {
        throw new Error('Failed to delete badge');
      }
    } catch (error) {
      console.error('Error deleting badge:', error);
    }
  };

  const filteredBadges = badges.filter(badge => {
    const tierMatch = filterTier === "all" || badge.tier === filterTier;
    const attributeMatch = filterAttribute === "all" || badge.attribute === filterAttribute;
    
    // Check if badge's attribute belongs to the selected type
    let typeMatch = filterType === "all";
    if (!typeMatch && filterType !== "all") {
      const typeAttrs = attributesByType[filterType as AttributeType];
      typeMatch = typeAttrs.some((attr: Attribute) => attr.name === badge.attribute);
    }
    
    return tierMatch && attributeMatch && typeMatch;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze": return "bg-orange-600";
      case "Silver": return "bg-gray-400";
      case "Gold": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reader Badges</CardTitle>
            <CardDescription>
              Manage achievement badges based on reader attributes
            </CardDescription>
          </div>
          <BadgeDialog
            badge={null}
            attributesByType={attributesByType}
            onSubmit={handleBadgeSubmit}
            isLoading={isLoading}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Badge
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="w-48">
            <Label htmlFor="filter-type">Filter by Type</Label>
            <Select value={filterType} onValueChange={(value) => {
              setFilterType(value);
              setFilterAttribute("all"); // Reset attribute filter when type changes
            }}>
              <SelectTrigger id="filter-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Abilities">Abilities</SelectItem>
                <SelectItem value="Tools">Tools</SelectItem>
                <SelectItem value="Styles">Styles</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Label htmlFor="filter-tier">Filter by Tier</Label>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger id="filter-tier">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Bronze">Bronze</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Label htmlFor="filter-attribute">Filter by Attribute</Label>
            <Select value={filterAttribute} onValueChange={setFilterAttribute}>
              <SelectTrigger id="filter-attribute">
                <SelectValue placeholder={filterType === "all" ? "All Attributes" : `All ${filterType}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{filterType === "all" ? "All Attributes" : `All ${filterType}`}</SelectItem>
                {filterType === "all" 
                  ? Object.values(attributesByType).flat().map((attr: Attribute) => (
                      <SelectItem key={attr.name} value={attr.name}>{attr.name}</SelectItem>
                    ))
                  : attributesByType[filterType as AttributeType].map((attr: Attribute) => (
                      <SelectItem key={attr.name} value={attr.name}>{attr.name}</SelectItem>
                    ))
                }
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Attribute</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Requirements</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBadges.map((badge) => (
              <TableRow key={badge.id}>
                <TableCell className="font-medium">{badge.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{badge.attribute}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getTierColor(badge.tier)}>
                    {badge.tier}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {badge.requirements.readingsCompleted} readings
                    {badge.requirements.averageRating && ` • ${badge.requirements.averageRating}+ rating`}
                    {badge.requirements.timeframe && ` • ${badge.requirements.timeframe} days`}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {badge.description}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <BadgeDialog
                      badge={badge}
                      attributesByType={attributesByType}
                      onSubmit={handleBadgeSubmit}
                      isLoading={isLoading}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DeleteBadgeDialog
                      badgeName={badge.name}
                      onConfirm={() => deleteBadge(badge.id)}
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
}

// BadgeDialog Component
function BadgeDialog({
  badge,
  attributesByType,
  onSubmit,
  isLoading,
  trigger,
}: {
  badge: BadgeData | null;
  attributesByType: AttributesData;
  onSubmit: (data: Omit<BadgeData, 'id'>, badgeId?: string) => void;
  isLoading: boolean;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [attributeType, setAttributeType] = useState<AttributeType>("Abilities");
  const [formData, setFormData] = useState<{
    name: string;
    attribute: string;
    tier: "Bronze" | "Silver" | "Gold";
    requirements: {
      readingsCompleted: number;
      averageRating?: number;
      timeframe?: number;
    };
    icon: string;
    description: string;
  }>({
    name: badge?.name || "",
    attribute: badge?.attribute || "",
    tier: badge?.tier || "Bronze",
    requirements: {
      readingsCompleted: badge?.requirements.readingsCompleted || 25,
      averageRating: badge?.requirements.averageRating || 4.0,
      timeframe: badge?.requirements.timeframe || 30,
    },
    icon: badge?.icon || "",
    description: badge?.description || "",
  });

  useEffect(() => {
    if (badge) {
      setFormData({
        name: badge.name,
        attribute: badge.attribute,
        tier: badge.tier,
        requirements: {
          readingsCompleted: badge.requirements.readingsCompleted,
          averageRating: badge.requirements.averageRating || 4.0,
          timeframe: badge.requirements.timeframe || 30,
        },
        icon: badge.icon,
        description: badge.description,
      });
      // Detect attributeType from badge's attribute
      for (const [type, attrs] of Object.entries(attributesByType)) {
        if (attrs.some((attr: Attribute) => attr.name === badge.attribute)) {
          setAttributeType(type as AttributeType);
          break;
        }
      }
    }
  }, [badge, attributesByType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, badge?.id);
    setOpen(false);
    if (!badge) {
      setFormData({
        name: "",
        attribute: "",
        tier: "Bronze",
        requirements: {
          readingsCompleted: 25,
          averageRating: 4.0,
          timeframe: 30,
        },
        icon: "",
        description: "",
      });
      setAttributeType("Abilities");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{badge ? "Edit Badge" : "Add Badge"}</DialogTitle>
          <DialogDescription>
            {badge ? "Update the badge details" : "Create a new achievement badge"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Badge Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="attributeType">Attribute Type</Label>
              <Select 
                value={attributeType} 
                onValueChange={(value: AttributeType) => {
                  setAttributeType(value);
                  setFormData({ ...formData, attribute: "" }); // Reset attribute when type changes
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Abilities">Abilities</SelectItem>
                  <SelectItem value="Tools">Tools</SelectItem>
                  <SelectItem value="Styles">Styles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="attribute">Attribute</Label>
              <Select 
                value={formData.attribute} 
                onValueChange={(value) => setFormData({ ...formData, attribute: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select attribute" />
                </SelectTrigger>
                <SelectContent>
                  {attributesByType[attributeType].map((attr: Attribute) => (
                    <SelectItem key={attr.name} value={attr.name}>{attr.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="icon">Icon Filename</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g., tarot-bronze.svg"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tier">Tier</Label>
            <Select 
              value={formData.tier} 
              onValueChange={(value: "Bronze" | "Silver" | "Gold") => setFormData({ ...formData, tier: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bronze">Bronze</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Requirements</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="readingsCompleted" className="text-xs">Readings Completed</Label>
                <Input
                  id="readingsCompleted"
                  type="number"
                  value={formData.requirements.readingsCompleted}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    requirements: { ...formData.requirements, readingsCompleted: parseInt(e.target.value) }
                  })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="averageRating" className="text-xs">Average Rating</Label>
                <Input
                  id="averageRating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.requirements.averageRating}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    requirements: { ...formData.requirements, averageRating: parseFloat(e.target.value) }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="timeframe" className="text-xs">Timeframe (days)</Label>
                <Input
                  id="timeframe"
                  type="number"
                  value={formData.requirements.timeframe !== undefined ? formData.requirements.timeframe : ""}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    setFormData({ 
                      ...formData, 
                      requirements: { ...formData.requirements, timeframe: value }
                    });
                  }}
                  placeholder="e.g., 30"
                />
              </div>
            </div>
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
              {badge ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// DeleteBadgeDialog Component
function DeleteBadgeDialog({
  badgeName,
  onConfirm,
  trigger,
}: {
  badgeName: string;
  onConfirm: () => void;
  trigger: React.ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the badge &quot;{badgeName}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
