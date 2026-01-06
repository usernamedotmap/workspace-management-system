import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import { TaskType } from "@/types/api.type";
import EditTaskDialog from "../edit-task-dialog";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTaskMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface DataTableRowActionsProps {
  row: Row<TaskType>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);


  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useMutation({
    mutationFn: deleteTaskMutationFn,
  });


  const taskId = row.original._id as string;
  const taskCode = row.original.taskCode;
  const projectId  = row.original.project?._id as string

  const task = row.original;

  const handleConfirm = () => {

    mutate({ workspaceId, taskId, projectId }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ["all-tasks", workspaceId]
        })
        toast({
          title: "Success",
          description: data.message,
          variant: "success"
        })

        setTimeout(() => setOpenDeleteDialog(false), 100);

      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.response?.data?.message || error?.message,
          variant: "destructive"
        })
      }
    })
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem className="cursor-pointer"
            onClick={() => setOpenEditDialog(true)}>
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={`!text-destructive cursor-pointer ${taskId}`}
            onClick={() => setOpenDeleteDialog(true)}
          >
            Delete Task
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* edit task diaglog */}
      <EditTaskDialog task={task} isOpen={openEditDialog} onClose={() => setOpenEditDialog(false)} />

      <ConfirmDialog
        isOpen={openDeleteDialog}
        isLoading={isPending}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirm}
        title="Delete Task"
         description={
          <>Are you sure you want to delete <strong className="text-red-500">{taskCode
          }</strong>? This action cannot be undone.
          </>}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
