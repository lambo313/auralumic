'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReaderAttributes } from '@/components/readers/reader-attributes';
import { ReaderConnect } from '@/components/readers/reader-connect';

export default function ClientExplorePage() {
  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Explore Readers</h1>
        <p className="text-sm text-muted-foreground">
          Discover psychic readers by their abilities, tools, and style
        </p>
      </div>

      <Tabs defaultValue="connect">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="connect">Connect</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
        </TabsList>
        <TabsContent value="connect" className="mt-6">
          <ReaderConnect />
        </TabsContent>
        <TabsContent value="attributes" className="mt-6">
          <ReaderAttributes />
        </TabsContent>
      </Tabs>
    </main>
  );
}