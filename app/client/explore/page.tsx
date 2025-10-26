'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReaderAttributes } from '@/components/readers/reader-attributes';
import { ReaderConnect } from '@/components/readers/reader-connect';

export default function ClientExplorePage() {
  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="page-title">Explore Readers</h1>
        <p className="page-description">
          Discover psychic readers by their abilities, tools, and style
        </p>
      </div>

      <Tabs defaultValue="connect">
        <TabsList className="justify-start border border-ring-200 bg-ring-50">
          <TabsTrigger value="connect" className='w-full'>Connect</TabsTrigger>
          <TabsTrigger value="attributes" className='w-full'>Attributes</TabsTrigger>
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