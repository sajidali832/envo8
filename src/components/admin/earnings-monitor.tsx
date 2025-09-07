'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface EarningsSummary {
  earnings_date: string;
  users_processed: number;
  total_distributed: number;
  first_processed_at: string;
  last_processed_at: string;
}

export function EarningsMonitor() {
  const [summaries, setSummaries] = useState<EarningsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [triggering, setTriggering] = useState(false);
  
  const fetchSummaries = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_earnings_summary')
        .select('*')
        .order('earnings_date', { ascending: false })
        .limit(7);
        
      if (error) throw error;
      
      setSummaries(data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching summaries:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSummaries();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchSummaries, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const triggerDailyEarnings = async () => {
    setTriggering(true);
    try {
      const response = await fetch('/api/daily-earnings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Success! Processed: ${data.processed}, Expired: ${data.expired}`);
        fetchSummaries(); // Refresh the data
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to trigger daily earnings');
    } finally {
      setTriggering(false);
    }
  };
  
  const todaysSummary = summaries[0];
  const todaysDate = format(new Date(), 'yyyy-MM-dd');
  const hasRunToday = todaysSummary?.earnings_date === todaysDate;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Earnings Monitor</h2>
          <p className="text-muted-foreground">
            Track and manage automated daily earnings distribution
          </p>
        </div>
        <Button
          onClick={fetchSummaries}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {hasRunToday ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Daily Earnings Processed Today
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Daily Earnings Pending
              </>
            )}
          </CardTitle>
          <CardDescription>
            {lastUpdate && `Last updated: ${format(lastUpdate, 'PPp')}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasRunToday ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Users Processed</p>
                <p className="text-2xl font-bold">{todaysSummary.users_processed}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Distributed</p>
                <p className="text-2xl font-bold">PKR {todaysSummary.total_distributed.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Processed At</p>
                <p className="text-sm">{format(new Date(todaysSummary.first_processed_at), 'pp')}</p>
              </div>
            </div>
          ) : (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Daily earnings have not been processed yet today. 
                The automated job runs at midnight UTC.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Manual Trigger (for testing) */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Trigger (Dev Only)</CardTitle>
            <CardDescription>
              Manually trigger daily earnings processing for testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={triggerDailyEarnings}
              disabled={triggering}
              variant="destructive"
            >
              {triggering ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Trigger Daily Earnings'
              )}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Recent History */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day History</CardTitle>
          <CardDescription>
            Recent daily earnings distribution history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summaries.map((summary) => (
              <div
                key={summary.earnings_date}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(summary.earnings_date + 'T00:00:00'), 'PPPP')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Processed at {format(new Date(summary.first_processed_at), 'pp')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-sm text-muted-foreground">Users</p>
                    <p className="font-medium">{summary.users_processed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">PKR {summary.total_distributed.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
