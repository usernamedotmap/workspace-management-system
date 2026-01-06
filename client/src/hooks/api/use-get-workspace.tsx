import { getWorkspaceByIdQueryFn } from "@/lib/api";
import { CustomError } from "@/types/custom-error.type";
import {  useQuery } from "@tanstack/react-query";

const useGetWorkspaceQuery = (workspaceId: string) => {
    const query = useQuery<any, CustomError>({
        queryKey: ["workspace", workspaceId],
        queryFn: () => getWorkspaceByIdQueryFn(workspaceId),
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error: any) => {
      // Don't retry on 401 or 403
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 1;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
        enabled: !!workspaceId  
    });

    return query;
};

export default useGetWorkspaceQuery;
