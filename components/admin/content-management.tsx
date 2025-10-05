"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Settings, Users } from "lucide-react";
import { CategoriesManagement } from "./categories-management";
import { AttributesManagement } from "./attributes-management";
import { BadgesManagement } from "./badges-management";

export function ContentManagement() {
  return (
    <div className="space-y-6">
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

        <TabsContent value="categories">
          <CategoriesManagement />
        </TabsContent>

        <TabsContent value="attributes">
          <AttributesManagement />
        </TabsContent>

        <TabsContent value="badges">
          <BadgesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}