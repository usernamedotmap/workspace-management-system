import useWorkspaceId from "@/hooks/use-workspace-id";
import AnalyticsCard from "./common/analytics-card";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceAnalyticsQueryFn } from "@/lib/api";

const WorkspaceAnalytics = () => {
  const workspaceId = useWorkspaceId();
  const {data, isPending} = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: () => getWorkspaceAnalyticsQueryFn(workspaceId),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const anaylytics = data?.analytics;
  

  return (
    <div className="grid gap-4 md:gap-5 lg:grid-cols-2 xl:grid-cols-3">
    
        <AnalyticsCard
          isLoading={isPending}
          title={`Total Task`}
          value={anaylytics?.totalTasks || 0}
          iconColor="text-sky-500"
        />
        <AnalyticsCard
          isLoading={isPending}
          title={`Overdue Task`}
          value={anaylytics?.overdueTasks || 0}
          iconColor="text-rose-500"
        />
        <AnalyticsCard
          isLoading={isPending}
          title={`Completed Task`}
          value={anaylytics?.completedTasks || 0}
          iconColor="text-green-500"
        />
     
    </div>
  );
};

export default WorkspaceAnalytics;
