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

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        <p className="text-sm font-light whitespace-nowrap">
          Users editing this page
        </p>

        <div className="flex items-center -space-x-3">
          {/* Current User */}
          {self && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="border-2 border-background relative z-50">
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

          {/* Other Collaborators */}
          {others.map((other) => (
            <Tooltip key={other.connectionId}>
              <TooltipTrigger asChild>
                <Avatar className="border-2 border-background">
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