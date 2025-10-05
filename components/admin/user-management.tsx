"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import { api } from "@/services/api";
import Reader from "@/models/Reader";
import { ReaderApproval } from "./reader-approval";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "client" | "reader" | "admin";
  isActive: boolean;
  credits: number;
  totalReadings: number;
  timezone?: string;
  joinDate: Date | string;
  lastActive: Date | string;
}

interface Reader extends User {
  role: "reader";
  isApproved: boolean;
  isOnline: boolean;
  rating: number;
  reviewCount: number;
  totalEarnings: number;
  specialties: string[];
  verificationStatus: "pending" | "verified" | "rejected";
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole, filterStatus, searchTerm]);

  useEffect(() => {
    loadReaders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, searchTerm]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterRole !== 'all') params.append('role', filterRole);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to load users:', response.statusText);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReaders = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/readers?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReaders(data.readers || []);
      } else {
        console.error('Failed to load readers:', response.statusText);
      }
    } catch (error) {
      console.error("Error loading readers:", error);
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isActive } : user
        ));
        
        if (readers.find(r => r.id === userId)) {
          setReaders(prev => prev.map(reader => 
            reader.id === userId ? { ...reader, isActive } : reader
          ));
        }
      } else {
        console.error('Failed to update user status:', response.statusText);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const updateUserRole = async (userId: string, role: "client" | "reader" | "admin") => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role } : user
        ));
        // Reload users to reflect changes
        loadUsers();
      } else {
        console.error('Failed to update user role:', response.statusText);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const approveReader = async (readerId: string, approved: boolean) => {
    try {
      // API call to approve/reject reader
      setReaders(prev => prev.map(reader => 
        reader.id === readerId 
          ? { 
              ...reader, 
              isApproved: approved,
              verificationStatus: approved ? "verified" : "rejected"
            } 
          : reader
      ));
    } catch (error) {
      console.error("Error updating reader approval:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredReaders = readers.filter(reader => {
    const matchesSearch = 
      reader.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reader.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reader.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "approved" && reader.isApproved) ||
      (filterStatus === "pending" && !reader.isApproved && reader.verificationStatus === "pending") ||
      (filterStatus === "rejected" && reader.verificationStatus === "rejected");
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="client">Clients</SelectItem>
              <SelectItem value="reader">Readers</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="readers" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Readers ({readers.length})
          </TabsTrigger>
        </TabsList>

        {/* All Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card className="">
            <CardHeader>
              <CardTitle>Platform Users</CardTitle>
              <CardDescription>
                Manage all registered users on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Readings</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "default"
                              : user.role === "reader"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "destructive"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.credits}</TableCell>
                      <TableCell>{user.totalReadings}</TableCell>
                      <TableCell>
                        {formatDate(user.joinDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <UserActionsDialog
                          user={user}
                          onUpdateStatus={updateUserStatus}
                          onUpdateRole={updateUserRole}
                          trigger={
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Readers Tab */}
        <TabsContent value="readers" className="space-y-4">
          <Card className="">
            <CardHeader>
              <CardTitle>Reader Management</CardTitle>
              <CardDescription>
                Approve reader applications and manage reader accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reader</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Specialties</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReaders.map((reader) => (
                    <TableRow key={reader.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {reader.firstName} {reader.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {reader.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              reader.verificationStatus === "verified"
                                ? "default"
                                : reader.verificationStatus === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {reader.verificationStatus}
                          </Badge>
                          {reader.isOnline && (
                            <Badge variant="outline" className="text-green-600">
                              Online
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {reader.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{reader.rating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">
                              ({reader.reviewCount} reviews)
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No ratings</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {reader.specialties.slice(0, 2).map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {reader.specialties.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{reader.specialties.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>${reader.totalEarnings}</TableCell>
                      <TableCell>
                        {formatDate(reader.joinDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!reader.isApproved && reader.verificationStatus === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => approveReader(reader.id, true)}
                                className="h-8"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approveReader(reader.id, false)}
                                className="h-8"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <ReaderApproval />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// User Actions Dialog Component
function UserActionsDialog({
  user,
  onUpdateStatus,
  onUpdateRole,
  trigger,
}: {
  user: User;
  onUpdateStatus: (userId: string, isActive: boolean) => void;
  onUpdateRole: (userId: string, role: "client" | "reader" | "admin") => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage User: {user.firstName} {user.lastName}</DialogTitle>
          <DialogDescription>
            Update user status, role, or perform other administrative actions
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Current Role:</span> {user.role}
            </div>
            <div>
              <span className="font-medium">Status:</span> {user.isActive ? "Active" : "Inactive"}
            </div>
            <div>
              <span className="font-medium">Credits:</span> {user.credits}
            </div>
            <div>
              <span className="font-medium">Readings:</span> {user.totalReadings}
            </div>
            <div>
              <span className="font-medium">Joined:</span> {formatDate(user.joinDate)}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium w-20">Status:</span>
              <Button
                variant={user.isActive ? "destructive" : "default"}
                size="sm"
                onClick={() => {
                  onUpdateStatus(user.id, !user.isActive);
                  setOpen(false);
                }}
              >
                {user.isActive ? (
                  <>
                    <Ban className="h-4 w-4 mr-1" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Activate
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium w-20">Role:</span>
              <Select
                value={user.role}
                onValueChange={(role) => {
                  onUpdateRole(user.id, role as "client" | "reader" | "admin");
                  setOpen(false);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="reader">Reader</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
