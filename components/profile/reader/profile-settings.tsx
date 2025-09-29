import { useUser } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { MultiSelect } from "@/components/ui/multi-select"

const formSchema = z.object({
  tagline: z.string().min(10).max(160),
  bio: z.string().min(50).max(500),
  location: z.string().min(1),
  tools: z.array(z.string()).min(1).max(3),
  style: z.string(),
  languages: z.array(z.string()).min(1),
  experience: z.number().min(0),
  specialties: z.array(z.string()).min(1).max(5),
  profileImage: z.string().optional(),
  backgroundImage: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function ProfileSettings() {
  const { user } = useUser()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tagline: "",
      bio: "",
      location: "",
      tools: [],
      style: "",
      languages: ["English"],
      experience: 0,
      specialties: [],
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const response = await fetch("/api/reader/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
        <FormField
          control={form.control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagline</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your professional headline" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Tell potential clients about yourself and your experience..."
                  className="min-h-[150px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} placeholder="City, Country" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="tools"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tools (max 3)</FormLabel>
                <FormControl>
                  <MultiSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "tarot", label: "Tarot" },
                      { value: "runes", label: "Runes" },
                      { value: "crystals", label: "Crystals" },
                      { value: "astrology", label: "Astrology" },
                      { value: "numerology", label: "Numerology" },
                    ]}
                    maxSelections={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="style"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reading Style</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your reading style" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="compassionate">Compassionate</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="analytical">Analytical</SelectItem>
                    <SelectItem value="intuitive">Intuitive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="languages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Languages</FormLabel>
                <FormControl>
                  <MultiSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "en", label: "English" },
                      { value: "es", label: "Spanish" },
                      { value: "fr", label: "French" },
                      { value: "de", label: "German" },
                      { value: "it", label: "Italian" },
                    ]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name="specialties"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialties (max 5)</FormLabel>
              <FormControl>
                <MultiSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "relationships", label: "Relationships" },
                    { value: "career", label: "Career" },
                    { value: "spirituality", label: "Spirituality" },
                    { value: "life_purpose", label: "Life Purpose" },
                    { value: "past_lives", label: "Past Lives" },
                    { value: "chakra_healing", label: "Chakra Healing" },
                    { value: "manifestation", label: "Manifestation" },
                  ]}
                  maxSelections={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  )
}
