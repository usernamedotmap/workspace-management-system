import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TaskPriorityEnum, TaskStatusEnum } from '@/constant'
import useGetWorkspaceMemberQuery from '@/hooks/api/use-get-workspace-member'
import { toast } from '@/hooks/use-toast'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { editTaskMutationFn } from '@/lib/api'
import { cn } from '@/lib/utils'
import { TaskType } from '@/types/api.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { format } from 'date-fns'
import { CalendarIcon, Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export default function EditTaskForm({ task, onClose }: { task: TaskType, onClose: () => void }) {
    const queryClient = useQueryClient();
    const workspaceId = useWorkspaceId();
    const projectId = task.project?._id as string;

    const { mutate, isPending } = useMutation({
        mutationFn: editTaskMutationFn,
    });

    const { data: memberData } = useGetWorkspaceMemberQuery(workspaceId);
    const members = memberData?.members || [];

    const memberOptions = members.map((member) => ({
        label: member.userId?.name || "Unknown",
        value: member.userId._id || ""
    }));

    const statusOPtions = Object.values(TaskStatusEnum).map((status) => ({
        label: status.charAt(0) + status.slice(1).toLocaleLowerCase(),
        value: status,
    }));

    const priorityOptions = Object.values(TaskPriorityEnum).map((priority) => ({
        label: priority.charAt(0) + priority.slice(1).toLocaleLowerCase(),
        value: priority
    }))



    const formSchema = z.object({
        title: z.string().trim().min(1, {
            message: "Title is required",
        }),
        description: z.string().trim(),
        status: z.enum(
            Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
            { required_error: "Status is required" }
        ),
        priority: z.enum(
            Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum],
            { required_error: "Priority is required" }
        ),
        assignedTo: z.string().trim().min(1, {
            message: "AssignedTo is required"
        }),
        dueDate: z.date({
            required_error: "A date of birth is required.",
        }),
    });


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: task.title ? task.title : "",
            description: task.description ? task.description : "",
            status: task.status ? task.status : "TODO",
            priority: task.priority ? task.priority : "MEDIUM",
            assignedTo: task.assignedTo?._id ?? "",
            dueDate: task.dueDate ? new Date(task.dueDate) : new Date()
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (isPending) return;

        const payload = {
            workspaceId,
            projectId,
            taskId: task._id,
            data: {
                ...values,
                dueDate: values.dueDate.toISOString(),
            }
        }

        mutate(payload, {
            onSuccess: (data) => {
                queryClient.invalidateQueries({
                    queryKey: ["all-tasks", workspaceId]
                });
                toast({
                    title: "Success",
                    description: data?.message,
                    variant: "success"
                })
                setTimeout(() => onClose(), 100);
            },
            onError: (error: unknown) => {
                if (error instanceof AxiosError) {
                    toast({
                        title: "Error",
                        description: error.response?.data?.message || error.message,
                        variant: "destructive"
                    });
                } else {
                    toast({
                        title: "Error",
                        description: (error as Error).message,
                        variant: "destructive"
                    });
                }
            }

        })
    }

    return (
        <div className='w-full h-auto max-full'>
            <div className='h-full'>
                <div className='mb-5 pb-2 border-b'>
                    <h1 className='text-xl tracking-[-0.16px] dark:text=[#fcfdffef] font-semibold text-center mb-1 sm:text-left'>
                        Edit Task
                    </h1>
                    <p>Update task to make it organize and for team collboration</p>
                </div>
                <Form {...form}>
                    <form className='space-y-3' onSubmit={form.handleSubmit(onSubmit)}>
                        <div>
                            <FormField
                                control={form.control}
                                name='title'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Task title
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Task title"
                                                className="!h-[48px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* description */}
                        <div>
                            <FormField
                                control={form.control}
                                name='description'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Task description
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} rows={2} placeholder='Description' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>


                        {/* assignedTo  */}
                        <div>
                            <FormField
                                control={form.control}
                                name='assignedTo'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Assigned To
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >

                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a assignee" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <div className='w-full max-h-[200px] overflow-y-auto scrollbar'>
                                                    {memberOptions.map((option) => (
                                                        <SelectItem className='cursor-pointer' key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Due date */}
                        <div className='!mt-2'>
                            <FormField
                                control={form.control}
                                name='dueDate'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full flex-1 pl-3 text-left font-normal ",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <Calendar mode='single' selected={field.value} onSelect={field.onChange} />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>


                        {/* status */}
                        <div>
                            <FormField
                                control={form.control}
                                name='status'
                                render={({ field }) => (

                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue className='!text-muted-foreground !capitalize' placeholder="Select a status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {statusOPtions.map((status) => (
                                                    <SelectItem
                                                        className='!capitalize'
                                                        key={status.value}
                                                        value={status.value}
                                                    >
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* priority */}

                        <div>
                            <FormField
                                control={form.control}
                                name='priority'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Priority
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >

                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a assignee" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <div className='w-full max-h-[200px] overflow-y-auto scrollbar'>
                                                    {priorityOptions.map((option) => (
                                                        <SelectItem className='cursor-pointer' key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type='submit' className='w-full' disabled={isPending} >
                            {isPending && <Loader className='animate-spin' />}
                            Save Changes
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
