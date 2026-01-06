

import { getMembersInWOrkspaceQueryFn } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const useGetWorkspaceMemberQuery = (workspaceId: string) => {
  const query = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () =>  getMembersInWOrkspaceQueryFn(workspaceId),
    staleTime: Infinity,
  })

  return query;
}

export default useGetWorkspaceMemberQuery;
