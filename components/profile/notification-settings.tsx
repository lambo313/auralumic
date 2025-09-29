import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  readingReminders: z.boolean(),
  inAppNotifications: z.boolean(),
  readingUpdates: z.boolean(),
  mentionNotifications: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export function NotificationSettings() {
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailNotifications: true,
      marketingEmails: false,
      readingReminders: true,
      inAppNotifications: true,
      readingUpdates: true,
      mentionNotifications: true,
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      await fetch("/api/users/notifications/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="emailNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div>
                  <FormLabel>Email Notifications</FormLabel>
                  <FormDescription>
                    Receive notifications via email
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marketingEmails"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div>
                  <FormLabel>Marketing Emails</FormLabel>
                  <FormDescription>
                    Receive updates about new features and promotions
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="readingReminders"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div>
                  <FormLabel>Reading Reminders</FormLabel>
                  <FormDescription>
                    Get reminded about upcoming readings
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inAppNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div>
                  <FormLabel>In-App Notifications</FormLabel>
                  <FormDescription>
                    Receive notifications within the app
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="readingUpdates"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div>
                  <FormLabel>Reading Updates</FormLabel>
                  <FormDescription>
                    Get notified about changes to your readings
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mentionNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div>
                  <FormLabel>Mentions & Comments</FormLabel>
                  <FormDescription>
                    Get notified when someone mentions or comments on your posts
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  )
}
