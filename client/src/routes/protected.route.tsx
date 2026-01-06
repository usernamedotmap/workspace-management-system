import { DashboardSkeleton } from "@/components/skeleton-loaders/dashboard-skeleton";
import useAuth from "@/hooks/api/use-auth";
import { Navigate, Outlet } from "react-router-dom";
const ProtectedRoute = () => {
  
  // const { data: authData, isLoading, isFetching } = useAuth();
  const {data: authData, isLoading} = useAuth();
  const user = authData?.user;



  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!user) {
    return <Navigate to={"/"} replace />
  }
  // return user ? <Outlet /> : <Navigate to="/" replace />
  return <Outlet />
};

export default ProtectedRoute;
