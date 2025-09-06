
'use client';

import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GlowingCard } from "@/components/glowing-card"
import { DollarSign, Landmark, Users, History } from "lucide-react"
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardStats = {
    total_earnings: number; // This is the user's balance
    total_investment: number;
    total_referral_earnings: number;
    plan_id: string;
}

type EarningsHistory = {
    id: number;
    amount: number;
    type: string;
    description: string;
    created_at: string;
}

export default function DashboardPage() {
    const { user, profile } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [earningsHistory, setEarningsHistory] = useState<EarningsHistory[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user) {
                setIsLoading(true);
                setIsLoadingHistory(true);
                
                // Fetch profile data
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('balance, total_investment, referral_earnings, selected_plan')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile for dashboard:', profileError);
                } else {
                    setStats({
                        total_investment: profileData?.total_investment || 0,
                        total_earnings: profileData?.balance || 0,
                        total_referral_earnings: profileData?.referral_earnings || 0,
                        plan_id: profileData?.selected_plan || '0',
                    });
                }
                
                // Fetch earnings history
                const { data: historyData, error: historyError } = await supabase
                    .from('earnings_history')
                    .select('id, amount, type, description, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(10);
                
                if (historyError) {
                    console.error('Error fetching earnings history:', historyError);
                } else {
                    setEarningsHistory(historyData || []);
                }
                
                setIsLoading(false);
                setIsLoadingHistory(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const statCards = [
        { title: "Total Earnings", value: `${stats?.total_earnings.toLocaleString() || '0'} PKR`, icon: <DollarSign />, glow: "primary" },
        { title: "Total Investment", value: stats?.plan_id === '0' ? 'Free Tier' : `${stats?.total_investment.toLocaleString() || '0'} PKR`, icon: <Landmark />, glow: "accent" },
        { title: "Total Referral Earnings", value: `${stats?.total_referral_earnings.toLocaleString() || '0'} PKR`, icon: <Users />, glow: "primary" },
    ];

  return (
    <div className="p-4 md:p-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? Array.from({length: 3}).map((_, i) => (
                <GlowingCard key={i} glowColor="primary" className="h-[108px]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/2" />
                    </CardContent>
                </GlowingCard>
            )) : stats && statCards.map((stat) => (
                <GlowingCard key={stat.title} glowColor={stat.glow as any}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <div className="text-muted-foreground">{stat.icon}</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </GlowingCard>
            ))}
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History /> Earnings History</CardTitle>
                <CardDescription>A log of your daily earnings and bonuses.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isLoadingHistory ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : earningsHistory.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {earningsHistory.map((earning: EarningsHistory) => (
                                <div key={earning.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{earning.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(earning.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-green-600">+{earning.amount} PKR</p>
                                        <p className="text-xs text-muted-foreground capitalize">{earning.type.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No earnings history yet.</p>
                            <p className="text-sm">Your daily earnings will appear here once they start.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
