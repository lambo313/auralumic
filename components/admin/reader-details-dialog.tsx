import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useReader } from "../../hooks/use-reader"

interface ReaderDetailsDialogProps {
  readerId: string
  onClose: () => void
}

export function ReaderDetailsDialog({ readerId, onClose }: ReaderDetailsDialogProps) {
  const { reader, isLoading } = useReader(readerId)

  if (isLoading || !reader) {
    return null
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Reader Application Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Personal Information</h4>
                <div className="space-y-2">
                  <p><span className="text-muted-foreground">Name:</span> {reader.name}</p>
                  <p><span className="text-muted-foreground">Email:</span> {reader.email}</p>
                  <p><span className="text-muted-foreground">Location:</span> {reader.location}</p>
                  <p><span className="text-muted-foreground">Languages:</span> {reader.languages.join(", ")}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Application Status</h4>
                <div className="space-y-2">
                  <p>
                    <span className="text-muted-foreground">Applied:</span>{" "}
                    {new Date(reader.applicationDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Profile Completeness:</span>{" "}
                    {reader.profileCompleteness}%
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Bio</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{reader.bio}</p>
            </div>
          </TabsContent>

          <TabsContent value="attributes">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {reader.attributes.tools.map((tool) => (
                    <Badge key={tool} variant="outline">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Abilities</h4>
                <div className="flex flex-wrap gap-2">
                  {reader.attributes.abilities.map((ability) => (
                    <Badge key={ability} variant="outline">
                      {ability}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Reading Style</h4>
                <Badge variant="outline">{reader.attributes.style}</Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <ScrollArea className="h-[400px]">
              {reader.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border-b"
                >
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" onClick={() => window.open(doc.url)}>
                    View
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
