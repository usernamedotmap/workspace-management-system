import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TaskType } from "@/types/api.type";
import EditTaskForm from "./edit-task-form";
import PermissionsGuard from "@/components/resuable/permission-guard";
import { Permissions } from "@/constant";


const EditTaskDialog = ({task, isOpen, onClose}: {task: TaskType, isOpen: boolean, onClose: () => void}) => {

    return (
        <div>
            <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <PermissionsGuard requiredPermission={Permissions.EDIT_TASK}>
                    <EditTaskForm task={task} onClose={onClose} />
                </PermissionsGuard>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default EditTaskDialog;