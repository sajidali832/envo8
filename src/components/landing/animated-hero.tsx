'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';

export function AnimatedHeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Animation variables
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      angle: number;
      distance: number;
      speed: number;
      opacity: number;
      fadeDirection: number;
    }> = [];
    
    // Create orbital particles
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: 0,
        y: 0,
        radius: 2 + Math.random() * 3,
        angle: Math.random() * Math.PI * 2,
        distance: 150 + i * 80,
        speed: 0.001 + Math.random() * 0.002,
        opacity: 0.3,
        fadeDirection: 1
      });
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Draw planetary rings
      for (let i = 0; i < 3; i++) {
        const radius = 200 + i * 120;
        const opacity = 0.05 - i * 0.015;
        
        ctx.strokeStyle = `rgba(236, 72, 153, ${opacity})`; // primary color
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Secondary ring with accent color
        ctx.strokeStyle = `rgba(168, 85, 247, ${opacity * 0.7})`; // accent color
        ctx.beginPath();
        ctx.ellipse(centerX + 20, centerY - 10, radius * 0.9, radius * 0.25, Math.PI / 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Update and draw particles
      particles.forEach((particle, index) => {
        // Update position
        particle.angle += particle.speed;
        particle.x = centerX + Math.cos(particle.angle) * particle.distance;
        particle.y = centerY + Math.sin(particle.angle) * particle.distance * 0.3;
        
        // Fade in and out
        particle.opacity += particle.fadeDirection * 0.005;
        if (particle.opacity >= 0.6) {
          particle.fadeDirection = -1;
        } else if (particle.opacity <= 0.1) {
          particle.fadeDirection = 1;
        }
        
        // Draw particle with glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 3
        );
        gradient.addColorStop(0, `rgba(236, 72, 153, ${particle.opacity})`);
        gradient.addColorStop(0.5, `rgba(168, 85, 247, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw core
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <section className="relative min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-40"
      />
      
      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-[160px] animate-rotate-slow" />
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />
      
      {/* Content */}
      <div className="relative z-10 container px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Premium Investment Platform</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-fade-in-up animation-delay-200">
            <span className="bg-gradient-to-br from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              Welcome to
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x">
              Envo-Pro
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-muted-foreground/80 leading-relaxed animate-fade-in-up animation-delay-400">
            Your premium gateway to smart investments and rewarding referrals. 
            Experience a VIP journey to financial growth.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 animate-fade-in-up animation-delay-600">
            <Button 
              size="lg" 
              className="relative overflow-hidden group min-w-[200px] h-14 text-lg font-medium"
              asChild
            >
              <Link href="/plans">
                <span className="relative z-10">View Our Plans</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
              </Link>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 backdrop-blur-sm bg-background/50 hover:bg-background/80 min-w-[200px] h-14 text-lg font-medium"
              asChild
            >
              <Link href="/sign-in">
                Sign In
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-12 animate-fade-in-up animation-delay-800">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Secure Platform</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Daily Returns</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Referral Rewards</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
