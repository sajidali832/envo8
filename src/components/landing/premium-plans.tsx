'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles, TrendingUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 0,
    name: 'Free',
    tagline: 'Start your journey',
    price: 0,
    duration: '365 days validity',
    dailyReturn: 20,
    features: [
      'PKR 20 daily earnings',
      '365 days validity period',
      'Basic dashboard access',
      'Standard support'
    ],
    color: 'from-slate-500 to-slate-600',
    popular: false
  },
  {
    id: 1,
    name: 'Starter',
    tagline: 'Accelerate growth',
    price: 5000,
    duration: '30 days validity',
    dailyReturn: 120,
    features: [
      'PKR 120 daily earnings',
      '30 days validity period',
      'Priority support',
      'Advanced analytics',
      'Referral bonuses'
    ],
    color: 'from-blue-500 to-cyan-500',
    popular: false
  },
  {
    id: 2,
    name: 'Advanced',
    tagline: 'Maximum returns',
    price: 10000,
    duration: '60 days validity',
    dailyReturn: 260,
    features: [
      'PKR 260 daily earnings',
      '60 days validity period',
      'VIP support access',
      'Premium analytics',
      'Enhanced referral rates',
      'Monthly bonus rewards'
    ],
    color: 'from-primary to-purple-500',
    popular: true
  },
  {
    id: 3,
    name: 'Pro',
    tagline: 'Elite investor',
    price: 20000,
    duration: '90 days validity',
    dailyReturn: 560,
    features: [
      'PKR 560 daily earnings',
      '90 days validity period',
      'Dedicated account manager',
      'Real-time insights',
      'Maximum referral rewards',
      'Exclusive VIP events',
      'Quarterly bonus package'
    ],
    color: 'from-amber-500 to-orange-500',
    popular: false
  }
];

export function PremiumPlansSection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      
      <div className="container relative z-10 px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Investment Plans</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Choose Your Investment Path
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground">
            Select a plan that matches your financial goals. All plans include guaranteed daily returns and our premium features.
          </p>
        </div>
        
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.id}
              className={cn(
                "relative overflow-hidden border-2 transition-all duration-500 hover:scale-105",
                plan.popular 
                  ? "border-primary shadow-xl shadow-primary/20" 
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              <div className="p-6 space-y-6">
                {/* Plan header */}
                <div>
                  <div className={cn(
                    "inline-flex p-3 rounded-xl bg-gradient-to-br mb-4",
                    plan.color
                  )}>
                    {plan.id === 0 && <Star className="w-6 h-6 text-white" />}
                    {plan.id === 1 && <TrendingUp className="w-6 h-6 text-white" />}
                    {plan.id === 2 && <Sparkles className="w-6 h-6 text-white" />}
                    {plan.id === 3 && <Star className="w-6 h-6 text-white fill-white" />}
                  </div>
                  
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                </div>
                
                {/* Pricing */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">PKR</span>
                    <span className="text-4xl font-bold">{plan.price.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{plan.duration}</p>
                </div>
                
                {/* Daily return highlight */}
                <div className={cn(
                  "p-4 rounded-lg bg-gradient-to-br",
                  plan.color,
                  "bg-opacity-10"
                )}>
                  <p className="text-sm font-medium mb-1">Daily Returns</p>
                  <p className="text-2xl font-bold">PKR {plan.dailyReturn}</p>
                </div>
                
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  asChild
                >
                  <Link href="/sign-up">
                    Get Started
                  </Link>
                </Button>
              </div>
              
              {/* Decorative gradient */}
              <div className={cn(
                "absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r",
                plan.color
              )} />
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include instant activation, secure transactions, and 24/7 support
          </p>
        </div>
      </div>
    </section>
  );
}
