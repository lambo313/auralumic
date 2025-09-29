import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { StarFilledIcon, CheckCircledIcon } from "@radix-ui/react-icons"

interface ReaderProfileProps {
  reader: {
    id: string;
    name: string;
    avatarUrl?: string;
    bio: string;
    specialties: string[];
    rating: number;
    reviewCount: number;
    status: "available" | "busy" | "offline";
    completedReadings: number;
    languages: string[];
    isVerified: boolean;
    joinDate: Date;
    testimonials: Array<{
      id: string;
      text: string;
      rating: number;
      clientName: string;
      date: Date;
    }>;
  };
  onRequestReading?: () => void;
}

export function ReaderProfile({
  reader,
  onRequestReading,
}: ReaderProfileProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date)
  }

  return (
    <Card className="w-full mx-auto shadow-lg rounded-xl ">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CardTitle className="text-xl font-bold">Reader Stats</CardTitle>
          {reader.isVerified && (
            <CheckCircledIcon className="h-5 w-5 text-blue-500" />
          )}
        </div>
        <CardDescription className="flex items-center space-x-1 mt-2">
          <StarFilledIcon className="h-4 w-4 text-yellow-400" />
          <span>
            {reader.rating.toFixed(1)} ({reader.reviewCount} reviews)
          </span>
          <span className="mx-2">•</span>
          <span>{reader.completedReadings} readings completed</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {reader.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {reader.languages.map((language) => (
                <Badge key={language} variant="outline">
                  {language}
                </Badge>
              ))}
            </div>
          </div>

          {reader.testimonials.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Testimonials</h3>
              <div className="space-y-4">
                {reader.testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="bg-zinc-50 dark:bg-zinc-800 border-none shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {testimonial.clientName}
                        </CardTitle>
                        <div className="flex items-center">
                          <StarFilledIcon className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm">
                            {testimonial.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <CardDescription>
                        {formatDate(testimonial.date)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.text}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex gap-2 justify-center">
          {reader.status === "available" && onRequestReading && (
            <Button onClick={onRequestReading}>Request Reading</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
