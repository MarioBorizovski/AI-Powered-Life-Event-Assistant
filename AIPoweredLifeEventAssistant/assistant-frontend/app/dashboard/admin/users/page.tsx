"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiAdmin, type ApiUser, type ApiRequest } from "@/lib/api-client";
import { LIFE_EVENTS } from "@/lib/mock-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Users,
  Shield,
  User,
  Trash2,
  MoreHorizontal,
  Eye,
  UserCog,
  FileText,
  CheckCircle,
  IdCard,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  XCircle,
  Search,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

interface UserData extends ApiUser {
  requestsCount?: number;
  completedRequestsCount?: number;
}

const statusConfig = {
  pending: {
    label: "Во тек",
    icon: Clock,
    className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  },
  completed: {
    label: "Завршено",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  cancelled: {
    label: "Откажано",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
};

export default function AdminUsersPage() {
  const { isAdmin, user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<UserData | null>(null);
  const [userRequests, setUserRequests] = useState<ApiRequest[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }

    const loadUsers = async () => {
      try {
        const data = await apiAdmin.listUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, [isAdmin, router]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.id.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleDelete = async () => {
    if (!deleteId) return;

    if (deleteId === user?.id) {
      toast.error("Не можете да ја избришете вашата сопствена сметка");
      setDeleteId(null);
      return;
    }

    try {
      await apiAdmin.deleteUser(deleteId);
      setUsers((prev) => prev.filter((u) => u.id !== deleteId));
      setDeleteId(null);
      toast.success("Корисникот е успешно избришан");
    } catch (error) {
      toast.error("Грешка при бришење на корисникот");
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "user" | "admin",
  ) => {
    if (userId === user?.id) {
      toast.error("Не можете да ја промените вашата сопствена улога");
      return;
    }

    try {
      await apiAdmin.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      toast.success(
        `Улогата е променета на "${newRole === "admin" ? "Администратор" : "Корисник"}"`,
      );
    } catch (error) {
      toast.error("Грешка при промена на улогата");
    }
  };

  const handleViewUser = async (userId: string) => {
    setIsLoadingDetails(true);
    try {
      const userObj = users.find((u) => u.id === userId);
      const allRequests = await apiAdmin.listRequests();
      const requests = allRequests.filter((r) => r.user_id === userId);
      
      if (userObj) {
        setViewUser({
          ...userObj,
          requestsCount: requests.length,
          completedRequestsCount: requests.filter(r => r.status === 'completed').length
        });
        setUserRequests(requests);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const getLifeEventLabel = (value: string) => {
    return LIFE_EVENTS.find((e) => e.value === value)?.label || value;
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Управување со корисници
        </h1>
        <p className="text-muted-foreground mt-1">
          Преглед на корисници, нивните податоци и барања
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Вкупно корисници
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {users.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <User className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Граѓани</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => u.role === "user").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Shield className="size-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Администратори</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Пребарај по име, е-пошта или ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
            <Users className="size-5" />
            Сите корисници
            {filteredUsers.length !== users.length && (
              <Badge variant="secondary">
                {filteredUsers.length} од {users.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Кликнете на корисник за да ги видите деталите и неговите барања
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Корисник</TableHead>
                  <TableHead>Е-пошта</TableHead>
                  <TableHead>Улога</TableHead>
                  {/* <TableHead>Лична карта</TableHead> */}
                  <TableHead className="text-right">Акции</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((userData) => (
                  <TableRow
                    key={userData.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      <div
                        className="flex items-center gap-3"
                        onClick={() => handleViewUser(userData.id)}
                      >
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {userData.role === "admin" ? (
                            <Shield className="size-4 text-primary" />
                          ) : (
                            <User className="size-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {userData.name}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {userData.id.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {userData.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          userData.role === "admin"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {userData.role === "admin"
                          ? "Администратор"
                          : "Корисник"}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          userData.personalInfo
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {userData.personalInfo ? 'Пополнета' : 'Непополнета'}
                      </Badge>
                    </TableCell> */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewUser(userData.id)}
                          >
                            <Eye className="size-4" />
                            <span>Преглед детали</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleRoleChange(
                                userData.id,
                                userData.role === "admin" ? "user" : "admin",
                              )
                            }
                            disabled={userData.id === user?.id}
                          >
                            <UserCog className="size-4" />
                            <span>
                              {userData.role === "admin"
                                ? "Направи корисник"
                                : "Направи администратор"}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(userData.id)}
                            disabled={userData.id === user?.id}
                          >
                            <Trash2 className="size-4" />
                            <span>Избриши</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Дали сте сигурни?</AlertDialogTitle>
            <AlertDialogDescription>
              Оваа акција не може да се поништи. Корисникот и сите негови
              податоци ќе бидат трајно избришани.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Откажи</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Избриши
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View User Dialog */}
      <Dialog
        open={!!viewUser}
        onOpenChange={() => {
          setViewUser(null);
          setUserRequests([]);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Детали за корисник</DialogTitle>
            <DialogDescription>
              Преглед на сите информации и барања на корисникот
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            viewUser && (
              <Tabs defaultValue="info" className="py-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Информации</TabsTrigger>
                  <TabsTrigger value="requests">
                    Барања ({userRequests.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-6 mt-4">
                  {/* Basic Info */}
                  <div className="flex items-start gap-4">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {viewUser.role === "admin" ? (
                        <Shield className="size-8 text-primary" />
                      ) : (
                        <User className="size-8 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground">
                        {viewUser.name}
                      </h3>
                      <p className="text-muted-foreground">{viewUser.email}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        ID: {viewUser.id}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="secondary"
                          className={
                            viewUser.role === "admin"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {viewUser.role === "admin"
                            ? "Администратор"
                            : "Корисник"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <FileText className="size-4" />
                        <span className="text-sm">Вкупно барања</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {viewUser.requestsCount || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <CheckCircle className="size-4" />
                        <span className="text-sm">Завршени барања</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {viewUser.completedRequestsCount || 0}
                      </p>
                    </div>
                  </div>

                  {/* Personal Info */}
                  {viewUser.embg ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <IdCard className="size-4" />
                        Лични податоци
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">ЕМБГ</p>
                          <p className="font-mono text-foreground">
                            {viewUser.embg}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Телефон
                          </p>
                          <p className="text-foreground flex items-center gap-1">
                            <Phone className="size-3" />
                            {viewUser.phone_number || "Нема"}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs text-muted-foreground">
                            Адреса
                          </p>
                          <p className="text-foreground flex items-center gap-1">
                            <MapPin className="size-3" />
                            {viewUser.address ? `${viewUser.address}, ${viewUser.city}` : "Нема"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                      <IdCard className="size-8 mx-auto text-yellow-600 dark:text-yellow-400 mb-2" />
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Корисникот сеуште нема пополнета лична карта
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="requests" className="mt-4">
                  {userRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <ClipboardList className="size-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Корисникот нема барања
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userRequests.map((request) => {
                        const status = statusConfig[request.status];
                        return (
                          <Link
                            key={request.id}
                            href={`/dashboard/admin/requests/${request.id}`}
                            className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                            onClick={() => {
                              setViewUser(null);
                              setUserRequests([]);
                            }}
                          >
                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="size-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {getLifeEventLabel(request.life_event)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(request.created_at).toLocaleDateString(
                                  "mk-MK",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className={status.className}
                            >
                              <status.icon className="size-3 mr-1" />
                              {status.label}
                            </Badge>
                            <ArrowRight className="size-4 text-muted-foreground" />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
