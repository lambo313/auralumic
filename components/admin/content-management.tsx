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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Award, Settings, Users } from "lucide-react";
import attributesData from "@/data/attributes.json";
import badgesData from "@/data/badges.json";

interface Attribute {
  id: string;
  name: string;
  description: string;
}

interface BadgeData {
  id: string;
  name: string;
  attribute: string;
  tier: "Bronze" | "Silver" | "Gold";
  requirements: {
    readingsCompleted: number;
    averageRating?: number;
    timeframe?: string;
  };
  icon: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export function ContentManagement() {
  const [attributes, setAttributes] = useState<{
    Abilities: Attribute[];
    Tools: Attribute[];
    Styles: Attribute[];
  }>({
    Abilities: [],
    Tools: [],
    Styles: []
  });
  
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<{
    type: "Abilities" | "Tools" | "Styles";
    attribute: Attribute | null;
  }>({ type: "Abilities", attribute: null });
  const [editingBadge, setEditingBadge] = useState<BadgeData | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  type AttributesData = {
    Abilities: Attribute[];
    Tools: Attribute[];
    Styles: Attribute[];
  };
  useEffect(() => {
    // Load initial data
    setAttributes(attributesData as AttributesData);
    
    // Transform badges data to ensure proper typing
    const transformedBadges: BadgeData[] = badgesData.badges.map(badge => ({
      ...badge,
      tier: badge.tier as "Bronze" | "Silver" | "Gold"
    }));
    setBadges(transformedBadges);
    
    // Load categories (you might want to fetch this from an API)
    setCategories([
      { id: "yearly", name: "Yearly", description: "Annual readings and predictions", isActive: true },
      { id: "monthly", name: "Monthly", description: "Monthly guidance and insights", isActive: true },
      { id: "weekly", name: "Weekly", description: "Weekly forecasts and advice", isActive: true },
      { id: "daily", name: "Daily", description: "Daily inspiration and guidance", isActive: true },
      { id: "shadow-work", name: "Shadow Work", description: "Deep psychological exploration", isActive: true },
      { id: "mirror-work", name: "Mirror Work", description: "Self-reflection practices", isActive: true },
      { id: "astrology", name: "Astrology", description: "Celestial insights and birth chart readings", isActive: true },
      { id: "chakras", name: "Chakras", description: "Energy center balancing and healing", isActive: true },
    ]);
  }, []);

  const handleAttributeSubmit = async (data: { name: string; description: string }) => {
    setIsLoading(true);
    try {
      if (editingAttribute.attribute) {
        // Update existing attribute
        const updatedAttribute = { ...editingAttribute.attribute, ...data };
        setAttributes(prev => ({
          ...prev,
          [editingAttribute.type]: prev[editingAttribute.type].map(attr =>
            attr.id === editingAttribute.attribute!.id ? updatedAttribute : attr
          )
        }));
      } else {
        // Add new attribute
        const newAttribute: Attribute = {
          id: data.name.toLowerCase().replace(/\s+/g, '-'),
          name: data.name,
          description: data.description,
        };
        setAttributes(prev => ({
          ...prev,
          [editingAttribute.type]: [...prev[editingAttribute.type], newAttribute]
        }));
      }
      setEditingAttribute({ type: "Abilities", attribute: null });
    } catch (error) {
      console.error("Error saving attribute:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBadgeSubmit = async (data: Omit<BadgeData, 'id'>) => {
    setIsLoading(true);
    try {
      if (editingBadge) {
        // Update existing badge
        const updatedBadge = { ...editingBadge, ...data };
        setBadges(prev => prev.map(badge => badge.id === editingBadge.id ? updatedBadge : badge));
      } else {
        // Add new badge
        const newBadge: BadgeData = {
          id: `${data.attribute.toLowerCase().replace(/\s+/g, '-')}-${data.tier.toLowerCase()}`,
          ...data,
        };
        setBadges(prev => [...prev, newBadge]);
      }
      setEditingBadge(null);
    } catch (error) {
      console.error("Error saving badge:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySubmit = async (data: Omit<Category, 'id'>) => {
    setIsLoading(true);
    try {
      if (editingCategory) {
        // Update existing category
        const updatedCategory = { ...editingCategory, ...data };
        setCategories(prev => prev.map(cat => cat.id === editingCategory.id ? updatedCategory : cat));
      } else {
        // Add new category
        const newCategory: Category = {
          id: data.name.toLowerCase().replace(/\s+/g, '-'),
          ...data,
        };
        setCategories(prev => [...prev, newCategory]);
      }
      setEditingCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAttribute = (type: "Abilities" | "Tools" | "Styles", id: string) => {
    setAttributes(prev => ({
      ...prev,
      [type]: prev[type].filter(attr => attr.id !== id)
    }));
  };

  const deleteBadge = (id: string) => {
    setBadges(prev => prev.filter(badge => badge.id !== id));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Content Management</h2>
        <p className="text-muted-foreground">Manage categories, attributes, and badges</p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="attributes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Attributes
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Badges
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card className="">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reading Categories</CardTitle>
                  <CardDescription>
                    Manage categories for public readings and posts
                  </CardDescription>
                </div>
                <CategoryDialog
                  category={null}
                  onSubmit={handleCategorySubmit}
                  isLoading={isLoading}
                  trigger={
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <CategoryDialog
                            category={category}
                            onSubmit={handleCategorySubmit}
                            isLoading={isLoading}
                            trigger={
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attributes Tab */}
        <TabsContent value="attributes" className="space-y-4">
          {(Object.keys(attributes) as Array<keyof typeof attributes>).map((type) => (
            <Card key={type} className="">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{type}</CardTitle>
                    <CardDescription>
                      Manage {type.toLowerCase()} available to readers
                    </CardDescription>
                  </div>
                  <AttributeDialog
                    type={type}
                    attribute={null}
                    onSubmit={handleAttributeSubmit}
                    isLoading={isLoading}
                    trigger={
                      <Button onClick={() => setEditingAttribute({ type, attribute: null })}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add {type.slice(0, -1)}
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
                              type={type}
                              attribute={attribute}
                              onSubmit={handleAttributeSubmit}
                              isLoading={isLoading}
                              trigger={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingAttribute({ type, attribute })}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteAttribute(type, attribute.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-4">
          <Card className="">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Achievement Badges</CardTitle>
                  <CardDescription>
                    Manage badges that readers can earn based on performance
                  </CardDescription>
                </div>
                <BadgeDialog
                  badge={null}
                  attributes={attributes}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Attribute</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Requirements</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {badges.map((badge) => (
                    <TableRow key={badge.id}>
                      <TableCell className="font-medium">{badge.name}</TableCell>
                      <TableCell>{badge.attribute}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            badge.tier === "Gold"
                              ? "default"
                              : badge.tier === "Silver"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {badge.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {badge.requirements.readingsCompleted} readings
                          {badge.requirements.averageRating && (
                            <>, {badge.requirements.averageRating}★ avg</>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <BadgeDialog
                            badge={badge}
                            attributes={attributes}
                            onSubmit={handleBadgeSubmit}
                            isLoading={isLoading}
                            trigger={
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteBadge(badge.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Dialog Components
function CategoryDialog({
  category,
  onSubmit,
  isLoading,
  trigger,
}: {
  category: Category | null;
  onSubmit: (data: Omit<Category, 'id'>) => void;
  isLoading: boolean;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    isActive: category?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setOpen(false);
    if (!category) {
      setFormData({ name: "", description: "", isActive: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            {category ? "Update the category details" : "Create a new reading category"}
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
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {category ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AttributeDialog({
  type,
  attribute,
  onSubmit,
  isLoading,
  trigger,
}: {
  type: "Abilities" | "Tools" | "Styles";
  attribute: Attribute | null;
  onSubmit: (data: { name: string; description: string }) => void;
  isLoading: boolean;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: attribute?.name || "",
    description: attribute?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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

function BadgeDialog({
  badge,
  attributes,
  onSubmit,
  isLoading,
  trigger,
}: {
  badge: BadgeData | null;
  attributes: { Abilities: Attribute[]; Tools: Attribute[]; Styles: Attribute[] };
  onSubmit: (data: Omit<BadgeData, 'id'>) => void;
  isLoading: boolean;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: badge?.name || "",
    attribute: badge?.attribute || "",
    tier: badge?.tier || "Bronze" as "Bronze" | "Silver" | "Gold",
    description: badge?.description || "",
    readingsCompleted: badge?.requirements.readingsCompleted || 25,
    averageRating: badge?.requirements.averageRating || 4.0,
    timeframe: badge?.requirements.timeframe || "30 days",
    icon: badge?.icon || "",
  });

  const allAttributes = [
    ...attributes.Abilities,
    ...attributes.Tools,
    ...attributes.Styles
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      attribute: formData.attribute,
      tier: formData.tier,
      description: formData.description,
      requirements: {
        readingsCompleted: formData.readingsCompleted,
        averageRating: formData.averageRating,
        timeframe: formData.timeframe,
      },
      icon: formData.icon,
    });
    setOpen(false);
    if (!badge) {
      setFormData({
        name: "",
        attribute: "",
        tier: "Bronze",
        description: "",
        readingsCompleted: 25,
        averageRating: 4.0,
        timeframe: "30 days",
        icon: "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{badge ? "Edit Badge" : "Add Badge"}</DialogTitle>
          <DialogDescription>
            {badge ? "Update the badge details" : "Create a new achievement badge"}
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
            <Label htmlFor="attribute">Attribute</Label>
            <Select
              value={formData.attribute}
              onValueChange={(value) => setFormData({ ...formData, attribute: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an attribute" />
              </SelectTrigger>
              <SelectContent>
                {allAttributes.map((attr) => (
                  <SelectItem key={attr.id} value={attr.name}>
                    {attr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tier">Tier</Label>
            <Select
              value={formData.tier}
              onValueChange={(value) => setFormData({ ...formData, tier: value as "Bronze" | "Silver" | "Gold" })}
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
          <div>
            <Label htmlFor="readingsCompleted">Readings Required</Label>
            <Input
              id="readingsCompleted"
              type="number"
              value={formData.readingsCompleted}
              onChange={(e) => setFormData({ ...formData, readingsCompleted: parseInt(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="averageRating">Minimum Average Rating</Label>
            <Input
              id="averageRating"
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={formData.averageRating}
              onChange={(e) => setFormData({ ...formData, averageRating: parseFloat(e.target.value) })}
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
              {badge ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
