import PageMeta from "@/components/common/PageMeta";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <>
      <PageMeta title="404 Not Found" description="The page you are looking for does not exist." />

     
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <SearchX className="w-24 h-24 text-muted-foreground" strokeWidth={1.5} />
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                404
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
            <p className="text-muted-foreground text-lg">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Additional Help */}
          <div className="pt-4 text-sm text-muted-foreground">
            <p>
              If you believe this is a mistake, please{' '}
              <Link to="/" className="text-primary hover:underline">
                contact support
              </Link>
              .
            </p>
          </div>
        </div>
      </div>


   </>
  )
};

export default NotFound;
