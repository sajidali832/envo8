
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Shield, KeyRound, User, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteAllUserData } from "./_actions";

export default function AdminSettingsPage() {
    const [isResetting, setIsResetting] = useState(false);
    const { toast } = useToast();

    const handleReset = async () => {
        setIsResetting(true);
        const { success, error } = await deleteAllUserData();
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to reset data: ${error}`});
        } else {
            toast({ title: 'Success', description: 'All user data has been cleared.'});
        }
        setIsResetting(false);
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Admin Settings</h1>
                <p className="text-muted-foreground">Manage your admin account and platform settings.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User /> Account</CardTitle>
                    <CardDescription>Admin account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-semibold">admin@envo-pro.app</span>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield /> Security</CardTitle>
                    <CardDescription>Change your admin password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                   <Button><KeyRound className="mr-2 h-4 w-4" />Change Password</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell /> Notifications</CardTitle>
                    <CardDescription>Manage how you receive admin notifications.</CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground">Admin notification settings will be available soon.</p>
                </CardContent>
            </Card>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2"><Trash2 /> Danger Zone</CardTitle>
                    <CardDescription>These actions are irreversible and will permanently delete data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive">Reset Platform</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete all users, investments, withdrawals, and referral data from the platform.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleReset} disabled={isResetting} className="bg-destructive hover:bg-destructive/90">
                                {isResetting ? 'Resetting...' : 'Yes, delete all data'}
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>

        </div>
    )
}
