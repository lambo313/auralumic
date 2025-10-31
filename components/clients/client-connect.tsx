"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClientList } from "./client-list";
import { SuggestReadingModal } from "./suggest-reading-modal";
import { mockClientStatuses, filterClients } from "./mock-client-data";
import { ClientStatusSummary } from "@/types";
import { Search, Filter, Users, MessageCircle } from "lucide-react";

const categories = ["love", "career", "spiritual", "general"];
const moods = ["seeking guidance", "confused", "hopeful", "curious"];

export function ClientConnect() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'no-status'>('all');
  const [clients] = useState<ClientStatusSummary[]>(mockClientStatuses);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientStatusSummary | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<string>("");

  const filteredClients = filterClients(clients, searchQuery, selectedCategories, statusFilter);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSuggestReading = (clientId: string, statusId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setSelectedStatusId(statusId);
      setShowSuggestModal(true);
    }
  };

  const handleCloseSuggestModal = () => {
    setShowSuggestModal(false);
    setSelectedClient(null);
    setSelectedStatusId("");
  };

  // Stats for display
  const activeStatusCount = clients.filter(c => c.currentStatus?.isActive).length;
  const totalClientsCount = clients.length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="shadow-aura bg-aura-accent-1/5 dark:bg-aura-accent-1/10 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-bold">{totalClientsCount}</p>
            </div>
          </div>
        </div>
        <div className="shadow-aura bg-aura-accent-1/5 dark:bg-aura-accent-1/10 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Statuses</p>
              <p className="text-2xl font-bold">{activeStatusCount}</p>
            </div>
          </div>
        </div>
        <div className="shadow-aura bg-aura-accent-1/5 dark:bg-aura-accent-1/10 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Filtered Results</p>
              <p className="text-2xl font-bold">{filteredClients.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, status content, or mood..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: "all" | "active" | "no-status") => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="active">Active Status Only</SelectItem>
              <SelectItem value="no-status">No Current Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filters */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Filter by Category</h3>
            {selectedCategories.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategories([])}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          <ScrollArea className="w-full">
            <div className="flex flex-wrap gap-2 p-1">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform capitalize hover:bg-ring"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {statusFilter === 'active' && 'Clients with Active Status'}
            {statusFilter === 'no-status' && 'Clients without Current Status'} 
            {statusFilter === 'all' && 'All Clients'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredClients.length} result{filteredClients.length !== 1 ? 's' : ''}
          </p>
        </div>

        <ClientList
          clients={filteredClients}
          onSuggestReading={handleSuggestReading}
        />
      </div>

      {/* Suggest Reading Modal */}
      <SuggestReadingModal
        isOpen={showSuggestModal}
        onClose={handleCloseSuggestModal}
        client={selectedClient}
        statusId={selectedStatusId}
      />
    </div>
  );
}