"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Status } from "@/types";
import { Plus, MessageCircle, Heart, Star } from "lucide-react";

interface StatusPostFormProps {
  onSubmit: (statusData: {
    content: string;
    mood: string;
    category: string;
  }) => void;
  isSubmitting: boolean;
}

const moods = [
  { value: "seeking guidance", label: "Seeking Guidance", icon: Star },
  { value: "confused", label: "Confused", icon: MessageCircle },
  { value: "hopeful", label: "Hopeful", icon: Heart },
  { value: "curious", label: "Curious", icon: MessageCircle }
];

const categories = [
  { value: "love", label: "Love & Relationships", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { value: "career", label: "Career & Work", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "spiritual", label: "Spiritual Growth", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "general", label: "General Life", color: "bg-gray-100 text-gray-800 border-gray-200" }
];

export function StatusPostForm({ onSubmit, isSubmitting }: StatusPostFormProps) {
  const [formData, setFormData] = useState({
    content: "",
    mood: "",
    category: ""
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.content.trim() && formData.mood && formData.category) {
      onSubmit(formData);
      setFormData({ content: "", mood: "", category: "" });
      setIsExpanded(false);
    }
  };

  const selectedMood = moods.find(m => m.value === formData.mood);
  const selectedCategory = categories.find(c => c.value === formData.category);

  if (!isExpanded) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsExpanded(true)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Plus className="h-5 w-5" />
            <p>Share your current situation or what&apos;s on your mind...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Share Your Current Status</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content */}
          <div className="space-y-2">
            <Label>What&apos;s on your mind?</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share what you&apos;re going through, what questions you have, or what guidance you&apos;re seeking..."
              className="min-h-24"
              required
            />
          </div>

          {/* Mood and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>How are you feeling?</Label>
              <Select value={formData.mood} onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your mood" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((mood) => (
                    <SelectItem key={mood.value} value={mood.value}>
                      <div className="flex items-center gap-2">
                        <mood.icon className="h-4 w-4" />
                        {mood.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          {formData.mood && formData.category && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {selectedMood && <selectedMood.icon className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm font-medium">{selectedMood?.label}</span>
                {selectedCategory && (
                  <Badge variant="outline" className={selectedCategory.color}>
                    {selectedCategory.label}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.content || "Your status content will appear here..."}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsExpanded(false);
                setFormData({ content: "", mood: "", category: "" });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.content.trim() || !formData.mood || !formData.category || isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post Status"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}