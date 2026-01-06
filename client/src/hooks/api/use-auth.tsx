import { getCurrentUserQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const useAuth = () => {
  const query = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUserQueryFn,
    // staleTime: 0,
    // retry: 1,
    staleTime: 5 * 60 * 1000,        // 🔴 IMPORTANT
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (let axios interceptor handle it)
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry other errors up to 1 time
      return failureCount < 1;
    },             // 🔴 IMPORTANT
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  return query;
};

export default useAuth;
