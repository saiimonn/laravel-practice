import { Head} from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, List} from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@inertiajs/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Task {
    id: number;
    title: string;
    description: string | null;
    due_date?: string | null;
    is_complete: Boolean;
    list_id: number;
    list: {
        id: number;
        title: string;
    }
}

interface List {
    id: number;
    title: string;
}

interface TasksIndexProps {
    tasks: {
        data: Task[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    lists: List[];
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks',
        href: '/tasks',
    },
]

const TasksIndex = ({tasks, lists, flash}:TasksIndexProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [toastType, setToastType] = useState<'success' | 'error'>('success')

    useEffect(() => {
        if(flash?.success) {
            setToastMessage(flash.success)
            setToastType('success')
            setShowToast(true)
        } else if (flash?.error) {
            setToastMessage(flash.error)
            setToastType('error')
            setShowToast(true)
        }
    }, [flash])

    useEffect(() => {
        if(showToast) {
            toast(toastMessage)
            const timer = setTimeout(() => {
                setShowToast(false)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [showToast])

    const {data, setData, post, put, processing, reset, delete: destroy} = useForm({
        title: '',
        description: '',
        list_id: lists.length > 0 ? lists[0].id : '',
        due_date: '',
        is_complete: false as boolean,
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if(editingTask) {
            put(route('tasks.update', editingTask.id), {
                onSuccess: () => {
                    setIsOpen(false)
                    reset()
                    setEditingTask(null)
                }
            })
        } else {
            post(route('tasks.store'), {
                onSuccess: () => {
                    setIsOpen(false)
                    reset
                }
            })
        }
    }

    const handleEdit = (task: Task) => {
        setEditingTask(task)
        setData({
            title: task.title,
            description: task.description || '',
            list_id: task.list_id.toString(),
            due_date: task.due_date || '',
            is_complete: task.is_complete,
        })
        setIsOpen(true)
    }

    const handleDelete = (taskId: number) => {
        destroy(route('tasks.destroy', taskId))
    }

    return(
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tasks" />
            <div className = "flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className = "flex justify-between items-center">
                    <h1 className = "text-2xl font-bold">Tasks</h1>
                    
                    <Dialog open = {isOpen} onOpenChange = {setIsOpen}>
                        <DialogTrigger>
                            <Button>
                                <Plus className = "size-4 mr-2"/>
                                New List
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                            </DialogHeader>

                            <form onSubmit = {handleSubmit} className = "space-y-4">
                                <div className = "space-y-2">
                                    <Label htmlFor="Title">Title</Label>
                                    <Input
                                        id = "Title"
                                        value = {data.title}
                                        onChange = {(e) => setData('title', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className = "space-y-2">
                                    <Label htmlFor = "Description">Description</Label>
                                    <Textarea
                                        id = "Description"
                                        value = {data.description}
                                        onChange = {(e) => setData('description', e.target.value)}
                                    />
                                </div>

                                <div className = "space-y-2">
                                    <Label htmlFor = "List">List</Label>
                                    <Select value = {String(data.list_id)} onValueChange = {(value) => setData('list_id', Number(value))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder = "Select a list"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {lists.map(list => (
                                                <SelectItem key = {list.id} value = {String(list.id)}>
                                                    {list.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className = "space-y-2">
                                    <Label htmlFor = "Due_Date">Due Date</Label>
                                    <Input
                                        id = "Due_Date"
                                        type = "date"
                                        value = {data.due_date || ''}
                                        onChange = {(e) => setData('due_date', e.target.value)}
                                    />
                                </div>

                                <div className = "flex items-center space-x-2">
                                    <Input 
                                        type = "checkbox"
                                        id = "isComplete"
                                        checked = {data.is_complete}
                                        onChange = {(e) => setData('is_complete', e.target.checked)}
                                        className = "size-4 rounded border-gray-300 focus:ring-2 focus:ring-primary"
                                    />

                                    <Label htmlFor = "isComplete">Completed</Label>
                                </div>

                                <div className = "w-full">
                                    <Button
                                        className = "w-full bg-black text-white"
                                        type = "submit"
                                        disabled = {processing}
                                    >
                                        {editingTask ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <Table className = "w-full">
                    <TableHead>
                        <TableRow className = "flex justify-between w-full">
                            <TableCell>Title</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>List</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.data.map((task) => (
                            <TableRow key = {task.id} className = " flex justify-between">
                                <TableCell>{task.title}</TableCell>
                                <TableCell>{task.description || 'No Description'}</TableCell>
                                <TableCell>
                                    <div className = "flex items-center gap-2">
                                        <List className = "size-4 text-muted-foreground" />
                                        {task.list.title}
                                    </div>
                                </TableCell>
                                <TableCell>{task.due_date}</TableCell>
                                <TableCell>{task.is_complete ? <h1 className = "text-green-400">Done</h1> : <h1 className = "text-yellow-400">Pending</h1>}</TableCell>
                                <TableCell>
                                    <Button
                                        variant = "ghost"
                                        size = "icon"
                                        onClick = {() => handleEdit(task)}
                                    >
                                        <Pencil />
                                    </Button>

                                    <Button
                                        variant = "ghost"
                                        size = "icon"
                                        onClick = {() => handleDelete(task.id)}
                                    >
                                        <Trash2 />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    )
}

export default TasksIndex