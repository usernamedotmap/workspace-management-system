import { useParams } from "react-router-dom";
import AnalyticsCard from "../common/analytics-card";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useQuery } from "@tanstack/react-query";
import { getProjectAnalyticsQueryFn } from "@/lib/api";

const ProjectAnalytics = () => {
  const params = useParams();
  const projectId = params.projectId as string;

  const workspaceId = useWorkspaceId();

  const { data, isPending, } = useQuery({
    queryKey: ["project-analytics", projectId],
    queryFn: () => getProjectAnalyticsQueryFn({
      workspaceId, projectId
    }),
    staleTime: 0,
    enabled: !!projectId
  });

  const analytics = data?.analytics;


  return (
    <div className="grid gap-4 md:gap-5 lg:grid-cols-2 xl:grid-cols-3">
      <AnalyticsCard title={`Completed Tasks`} value={analytics?.completedTasks || 0} isLoading={isPending} iconColor="" />
      <AnalyticsCard title={`Overdue Tasks`} value={analytics?.overdueTasks || 0} isLoading={isPending} iconColor="text-rose-500" />
      <AnalyticsCard title={`Total Tasks`} value={analytics?.totalTasks || 0} isLoading={isPending} iconColor="text-sky-500" />
    </div>
  );
};

export default ProjectAnalytics;
