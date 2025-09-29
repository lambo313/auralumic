import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountSettings } from "@/components/profile/account-settings"
import { NotificationSettings } from "@/components/profile/notification-settings"
import { SecuritySettings } from "@/components/profile/security-settings"

export default async function ClientSettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <AccountSettings />
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <NotificationSettings />
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <SecuritySettings />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}