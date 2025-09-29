"use client";
import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  phoneCall: z.object({
    enabled: z.boolean(),
    price: z.number().min(0),
    duration: z.number().min(15),
  }),
  videoMessage: z.object({
    enabled: z.boolean(),
    price: z.number().min(0),
    duration: z.number().min(15),
  }),
  liveVideo: z.object({
    enabled: z.boolean(),
    price: z.number().min(0),
    duration: z.number().min(15),
  }),
})

type FormValues = z.infer<typeof formSchema>

export function ServiceSettings() {
  const { toast } = useToast()
   "use client";
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneCall: {
        enabled: true,
        price: 50,
        duration: 30,
      },
      videoMessage: {
        enabled: true,
        price: 75,
        duration: 30,
      },
      liveVideo: {
        enabled: true,
        price: 100,
        duration: 45,
      },
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true)
      await fetch("/api/reader/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      toast({
        title: "Services updated",
        description: "Your service settings have been saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update services. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const ServiceTab = ({ service }: { service: "phoneCall" | "videoMessage" | "liveVideo" }) => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={`${service}.enabled`}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between">
            <FormLabel>Enable {service.replace(/([A-Z])/g, " $1").toLowerCase()}</FormLabel>
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
        name={`${service}.price`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price (credits)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                {...field}
                onChange={e => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`${service}.duration`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duration (minutes)</FormLabel>
            <Select
              value={field.value.toString()}
              onValueChange={value => field.onChange(parseInt(value))}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
        <Tabs defaultValue="phoneCall" className="space-y-6">
          <TabsList>
            <TabsTrigger value="phoneCall">Phone Call</TabsTrigger>
            <TabsTrigger value="videoMessage">Video Message</TabsTrigger>
            <TabsTrigger value="liveVideo">Live Video</TabsTrigger>
          </TabsList>

          <TabsContent value="phoneCall">
            <ServiceTab service="phoneCall" />
          </TabsContent>

          <TabsContent value="videoMessage">
            <ServiceTab service="videoMessage" />
          </TabsContent>

          <TabsContent value="liveVideo">
            <ServiceTab service="liveVideo" />
          </TabsContent>
        </Tabs>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}
