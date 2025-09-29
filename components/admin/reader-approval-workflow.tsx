import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { PendingReaderCard } from "./pending-reader-card"
import { ReaderDetailsDialog } from "./reader-details-dialog"
import { usePendingReaders } from "@/hooks/use-pending-readers"

export function ReaderApprovalWorkflow() {
  const [selectedReader, setSelectedReader] = useState<string | null>(null)
  const { toast } = useToast()
  const {
    pendingReaders,
    incompleteReaders,
    approveReader,
    rejectReader,
    isLoading,
  } = usePendingReaders()

  const handleApprove = async (readerId: string) => {
    try {
      await approveReader(readerId)
      toast({
        title: "Reader approved",
        description: "The reader has been approved and notified.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve reader. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (readerId: string) => {
    try {
      await rejectReader(readerId)
      toast({
        title: "Reader rejected",
        description: "The reader has been rejected and notified.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject reader. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingReaders.length})
          </TabsTrigger>
          <TabsTrigger value="incomplete">
            Incomplete ({incompleteReaders.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : pendingReaders.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No pending applications</p>
                </div>
              ) : (
                pendingReaders.map((reader) => (
                  <PendingReaderCard
                    key={reader.id}
                    reader={reader}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewDetails={() => setSelectedReader(reader.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="incomplete">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : incompleteReaders.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No incomplete applications</p>
                </div>
              ) : (
                incompleteReaders.map((reader) => (
                  <PendingReaderCard
                    key={reader.id}
                    reader={reader}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewDetails={() => setSelectedReader(reader.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {selectedReader && (
        <ReaderDetailsDialog
          readerId={selectedReader}
          onClose={() => setSelectedReader(null)}
        />
      )}
    </div>
  )
}
