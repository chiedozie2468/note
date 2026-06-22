"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Avatars() {
  const self = useSelf();
  const others = useOthers();

  const totalUsers = (self ? 1 : 0) + others.length;

  return (
    <TooltipProvider>
      <div className="flex w-full items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Users
          </span>

          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {totalUsers}
          </span>
        </div>

        {/* Right Side */}
        <div className="flex items-center -space-x-3">
          {self && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="relative z-50 h-8 w-8 border-2 border-background">
                  <AvatarImage src={self.info?.avatar} />
                  <AvatarFallback>
                    {self.info?.name?.charAt(0)?.toUpperCase() || "Y"}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>

              <TooltipContent>
                <p>You</p>
              </TooltipContent>
            </Tooltip>
          )}

          {others.map((other) => (
            <Tooltip key={other.connectionId}>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={other.info?.avatar} />
                  <AvatarFallback>
                    {other.info?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>

              <TooltipContent>
                <p>{other.info?.name || "Unknown User"}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}