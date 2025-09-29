import Image from "next/image";
import { Stars, Sparkles, Shield } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { AuthButtons } from "@/components/auth/auth-buttons";
import LandingHeader from "@/components/layout/landing-header";

const features = [
  {
    icon: Stars,
    title: "Expert Readers",
    description: "Connect with verified psychic readers specializing in various spiritual practices"
  },
  {
    icon: Sparkles,
    title: "Diverse Reading Options",
    description: "Choose from phone calls, video messages, or live video sessions"
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    description: "Verified readers, secure payments, and satisfaction guarantee"
  }
];

const testimonials = [
  {
    name: "Sarah M.",
    image: "/assets/testimonial1.jpg",
    text: "The guidance I received was incredibly accurate and helped me make an important life decision.",
    rating: 5
  },
  {
    name: "Michael R.",
    image: "/assets/testimonial2.jpg",
    text: "Found an amazing spiritual advisor who I connect with regularly. Life-changing experience!",
    rating: 5
  },
  {
    name: "Lisa K.",
    image: "/assets/testimonial3.jpg",
    text: "The platform is so easy to use, and the readers are truly gifted. Highly recommend!",
    rating: 5
  }
];

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session?.userId;
  
  return (
    <div className="min-h-screen">
      <LandingHeader />
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-start justify-center overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 animate-pulse"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-aura-accent-1/10 rounded-full blur-xl animate-bounce-slow"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-aura-accent-1/15 rounded-full blur-lg animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-aura-accent-1/8 rounded-full blur-2xl animate-bounce-slow"></div>
          <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-aura-accent-1/12 rounded-full blur-lg animate-pulse"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 text-center py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            {/* Subtitle Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-aura-accent-1/10 border border-aura-accent-1/20 rounded-full text-aura-accent-1 text-sm font-medium mb-8 backdrop-blur-sm animate-fadeIn">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by 10,000+ spiritual seekers</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 animate-fadeIn">
              <span className="bg-gradient-to-r from-foreground via-aura-accent-1 to-foreground bg-clip-text text-transparent leading-tight">
                Discover Your Path with
              </span>
              <br />
              <span className="bg-gradient-to-r from-aura-accent-1 to-aura-accent-1/80 bg-clip-text text-transparent">
                Auralumic
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-xl md:text-2xl mb-12 text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fadeIn">
              Connect with verified psychic readers for personalized spiritual guidance and insight through our secure, modern platform
            </p>
            
            {/* CTA Buttons */}
            <div className="animate-fadeIn">
              <AuthButtons isAuthenticated={isAuthenticated} />
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-border animate-fadeIn">
              <div className="text-center group cursor-pointer">
                <div className="text-3xl font-bold text-aura-accent-1 mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
                <div className="text-muted-foreground">Verified Readers</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-3xl font-bold text-aura-accent-1 mb-2 group-hover:scale-110 transition-transform duration-300">50K+</div>
                <div className="text-muted-foreground">Readings Completed</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-3xl font-bold text-aura-accent-1 mb-2 group-hover:scale-110 transition-transform duration-300">4.9★</div>
                <div className="text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Why Choose Auralumic
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-glass p-6 rounded-lg hover-scale">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card-glass p-6 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                    <div className="flex text-primary">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Stars key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-secondary">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
