import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardSkeleton() {
  return (
    <div className="pb-4">
      {/* Dashboard Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4 gap-4">
          <Skeleton className="h-8 w-[140px]" /> {/* Logo/Title */}
          <div className="ml-auto flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" /> {/* User Avatar */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex justify-center items-center h-full p-10">
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <Skeleton className="h-6 w-[150px]" /> {/* Group Name */}
                  <Skeleton className="h-4 w-[100px]" /> {/* Date */}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-4 w-[120px]" /> {/* Balance Text */}
                    </div>
                    <Skeleton className="h-9 w-[100px]" /> {/* View Details Button */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}