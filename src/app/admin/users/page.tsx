
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, PlusCircle, Eye, Edit, Ban } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getUsers, updateUserProfile, blockUser } from "./_actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type UserProfile = {
    id: string;
    username: string;
    email: string;
    balance: number;
    status: string;
    total_investment: number;
    daily_earnings: number;
    referral_earnings: number;
    location?: { lat: number; long: number; } | null;
}

export default function AllUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { toast } = useToast();

    // State for the edit form
    const [editBalance, setEditBalance] = useState(0);
    const [editDailyEarnings, setEditDailyEarnings] = useState(0);
    const [editReferralEarnings, setEditReferralEarnings] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);


    const fetchUsers = async () => {
        setIsLoading(true);
        const { data, error } = await getUsers();
        
        if (error) {
            console.error('Error fetching users:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch users.' });
        } else if (data) {
            setUsers(data as UserProfile[]);
        }
        setIsLoading(false);
    }
    
    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBlockUser = async (userId: string, currentStatus: string) => {
        const action = currentStatus === 'blocked' ? 'unblock' : 'block';
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        const { success, error } = await blockUser(userId, action);

        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to ${action} user: ${error}` });
        } else {
            toast({ title: 'Success', description: `User has been ${action}ed.` });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: action === 'block' ? 'blocked' : 'active' } : u));
        }
    }

    const openViewModal = (user: UserProfile) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    }

    const openEditModal = (user: UserProfile) => {
        setSelectedUser(user);
        setEditBalance(user.balance);
        setEditDailyEarnings(user.daily_earnings);
        setEditReferralEarnings(user.referral_earnings);
        setIsEditModalOpen(true);
    }

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        
        setIsUpdating(true);
        const updatedData = {
            balance: editBalance,
            daily_earnings: editDailyEarnings,
            referral_earnings: editReferralEarnings,
        };

        const { success, error } = await updateUserProfile(selectedUser.id, updatedData);
        
        if (error) {
             toast({ variant: 'destructive', title: 'Update Failed', description: error });
        } else {
            toast({ title: 'Success', description: 'User profile has been updated.' });
            // Refresh local data
            setUsers(users.map(u => u.id === selectedUser.id ? {...u, ...updatedData} : u));
            setIsEditModalOpen(false);
        }
        setIsUpdating(false);
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'pending_investment':
            case 'pending_approval': return 'secondary';
            case 'blocked':
            case 'rejected': return 'destructive';
            default: return 'outline';
        }
    }
    
    const getStatusBadgeClass = (status: string) => {
         if(status === 'active') return 'bg-green-500';
         return '';
    }


    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">All Users</h1>
                    <p className="text-muted-foreground">Manage all registered users on the platform.</p>
                </div>
                 <Button className="glow-accent" disabled>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User List</CardTitle>
                    <CardDescription>A complete list of all users.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? <p>Loading users...</p> : (
                        <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead className="hidden md:table-cell">Email</TableHead>
                                    <TableHead>Balance</TableHead>
                                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.username}</TableCell>
                                        <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                                        <TableCell>{user.balance.toLocaleString()} PKR</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge variant={getStatusBadgeVariant(user.status)} className={getStatusBadgeClass(user.status)}>
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => openViewModal(user)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditModal(user)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className={user.status === 'blocked' ? '' : 'text-destructive'} onClick={() => handleBlockUser(user.id, user.status)}>
                                                        <Ban className="mr-2 h-4 w-4" /> {user.status === 'blocked' ? 'Unblock' : 'Block'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View User Details Dialog */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>{selectedUser?.username} ({selectedUser?.email})</DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4 py-4 text-sm">
                           <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-muted-foreground">Status</span>
                                <Badge variant={getStatusBadgeVariant(selectedUser.status)} className={getStatusBadgeClass(selectedUser.status)}>{selectedUser.status}</Badge>
                           </div>
                           <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Investment</span>
                                <span className="font-semibold">{selectedUser.total_investment.toLocaleString()} PKR</span>
                           </div>
                           <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Daily Earnings</span>
                                <span className="font-semibold">{selectedUser.daily_earnings.toLocaleString()} PKR</span>
                           </div>
                           <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Referral Earnings</span>
                                <span className="font-semibold">{selectedUser.referral_earnings.toLocaleString()} PKR</span>
                           </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Location</span>
                                <span className="font-semibold">
                                     {selectedUser.location ? `${selectedUser.location.lat.toFixed(4)}, ${selectedUser.location.long.toFixed(4)}` : 'Not Available'}
                                </span>
                           </div>
                           <div className="flex justify-between items-center border-t pt-2 mt-2">
                                <span className="text-muted-foreground font-bold text-primary">Withdrawable Balance</span>
                                <span className="font-bold text-primary">{selectedUser.balance.toLocaleString()} PKR</span>
                           </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
                        <DialogDescription>Adjust the financial details for this user. This is for corrections only.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateUser}>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="balance">Total Earnings (Withdrawable Balance)</Label>
                                <Input id="balance" type="number" step="any" value={editBalance} onChange={(e) => setEditBalance(parseFloat(e.target.value) || 0)} required />
                            </div>
                            <div>
                                <Label htmlFor="dailyEarnings">Total Daily Earnings (Cumulative)</Label>
                                <Input id="dailyEarnings" type="number" step="any" value={editDailyEarnings} onChange={(e) => setEditDailyEarnings(parseFloat(e.target.value) || 0)} required />
                            </div>
                            <div>
                                <Label htmlFor="referralEarnings">Total Referral Earnings (Cumulative)</Label>
                                <Input id="referralEarnings" type="number" step="any" value={editReferralEarnings} onChange={(e) => setEditReferralEarnings(parseFloat(e.target.value) || 0)} required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                            <Button type="submit" isLoading={isUpdating}>Save Changes</Button>
                        </DialogFooter>
                    </form>
                 </DialogContent>
            </Dialog>

        </div>
    )
}
