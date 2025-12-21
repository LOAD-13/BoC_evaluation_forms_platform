"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Users, Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AssignmentManagerProps {
    formId: string;
}

interface User {
    id: string;
    fullName: string;
    email: string;
}

export default function AssignmentManager({ formId }: AssignmentManagerProps) {
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())

    // Fetch users and current assignments when dialog opens
    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen])

    const loadData = async () => {
        setIsLoading(true)
        try {
            // 1. Fetch all users (filtered by role USER in API typically, or filter client side)
            // Assuming /api/users exists and returns all users. If not implemented, we need it.
            // For now, I'll assume we can fetch all users.
            const usersRes = await fetch('/api/users');
            const allUsers = await usersRes.json();
            const filteredUsers = allUsers.filter((u: any) => u.roles && u.roles.some((r: any) => r.role.name === 'USER'));
            setUsers(filteredUsers);

            // 2. Fetch current assignments
            const assignRes = await fetch(`/api/forms/${formId}/assign`);
            const assignments = await assignRes.json();
            const assignedIds = new Set(assignments.map((a: any) => a.userId));
            // @ts-ignore
            setSelectedUserIds(assignedIds);

        } catch (error) {
            console.error(error)
            toast({ variant: "destructive", title: "Error al cargar datos" })
        } finally {
            setIsLoading(false)
        }
    }

    const toggleuser = (userId: string) => {
        const newSet = new Set(selectedUserIds);
        if (newSet.has(userId)) {
            newSet.delete(userId);
        } else {
            newSet.add(userId);
        }
        setSelectedUserIds(newSet);
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch(`/api/forms/${formId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: Array.from(selectedUserIds) })
            });

            if (!res.ok) throw new Error("Error al guardar asignaciones");

            toast({ title: "Asignaciones actualizadas" });
            setIsOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error al guardar" })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Users className="mr-2 h-4 w-4" /> Asignar Usuarios
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Asignar Evaluación</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                ) : (
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-4">
                            {users.map(user => (
                                <div key={user.id} className="flex items-center space-x-2 border-b pb-2 last:border-0">
                                    <Checkbox
                                        id={user.id}
                                        checked={selectedUserIds.has(user.id)}
                                        onCheckedChange={() => toggleuser(user.id)}
                                    />
                                    <Label htmlFor={user.id} className="flex flex-col cursor-pointer w-full">
                                        <span className="font-medium">{user.fullName}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}

                <DialogFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
