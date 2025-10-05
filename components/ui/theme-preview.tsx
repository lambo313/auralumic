import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function ThemePreview() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">UI Theme Preview</h1>
        <Button 
          variant="default"
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-6 py-2 shadow-aura-lg"
        >
          Get Started
        </Button>
      </header>

      {/* Card Example */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-card border-primary/40 rounded-2xl shadow-aura-md">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-secondary">Featured Section</h2>
            <p className="text-muted-foreground">
              This card demonstrates the balance of the dark base, soft white text,
              periwinkle accents, and vibrant silver highlights.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="default" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-2"
              >
                Action
              </Button>
              <Button
                variant="secondary"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl px-4 py-2"
              >
                Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Form Example */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <form className="bg-card p-6 rounded-2xl shadow-aura-md border border-secondary/30 space-y-4 max-w-md">
          <h3 className="text-lg font-semibold text-secondary">Sign Up</h3>
          <Input
            placeholder="Username"
            className="bg-background border-primary/40 text-foreground placeholder:text-foreground/40 rounded-xl"
          />
          <Input
            placeholder="Email"
            className="bg-background border-primary/40 text-foreground placeholder:text-foreground/40 rounded-xl"
          />
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-2"
          >
            Create Account
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
