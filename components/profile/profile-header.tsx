import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation";



interface ProfileHeaderProps {
  user: {
    avatarUrl?: string;
    profileImage?: string;
    name?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    location?: string;
    website?: string;
    joinDate?: Date | string;
    createdAt?: Date | string;
  };
  isOwnProfile?: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const router = useRouter();
  const avatarUrl = user.avatarUrl || user.profileImage || "/images/default-avatar.png";
  const displayName = user.name || user.username || `${user.firstName || ""} ${user.lastName || ""}`;
  const bio = user.bio;
  const location = user.location;
  const website = user.website;
  // Accept joinDate or fallback to createdAt if present
  let joinDate: Date | undefined = undefined;
  if (user.joinDate) {
    joinDate = typeof user.joinDate === "string" ? new Date(user.joinDate) : user.joinDate;
  } else if (user.createdAt) {
    joinDate = typeof user.createdAt === "string" ? new Date(user.createdAt) : user.createdAt;
  }
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Only show edit button if own profile
  const showEdit = isOwnProfile === true;
  const onEditClick = () => {
    // Get role-based edit URL
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.includes('/client/')) {
        router.push('/client/profile/edit');
      } else if (pathname.includes('/reader/')) {
        router.push('/reader/profile/edit');
      } else {
        router.push('/dashboard/profile/edit'); // fallback
      }
    } else {
      router.push('/dashboard/profile/edit'); // fallback
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl} alt={displayName || "Avatar"} />
            <AvatarFallback>{(displayName?.[0] || "U").toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            {joinDate && (
              <p className="text-xs text-muted-foreground mt-1">Member since {formatDate(joinDate)}</p>
            )}
            {bio && (
              <p className="mt-2 text-muted-foreground">{bio}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-x-4 text-sm text-muted-foreground">
              {location && (
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {location}
                </span>
              )}
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
        {showEdit && (
          <Button variant="outline" onClick={onEditClick}>
            Edit Profile
          </Button>
        )}
      </div>
    </Card>
  );
}
