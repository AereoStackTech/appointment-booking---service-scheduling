import { Badge } from "@/components/ui/badge";
import { AppointmentStatus } from "@prisma/client";
import { Clock, CheckCircle2, CheckCheck, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: AppointmentStatus | string;
  className?: string;
  showIcon?: boolean;
}

export function AppointmentStatusBadge({
  status,
  className,
  showIcon = true,
}: StatusBadgeProps) {
  switch (status) {
    case AppointmentStatus.PENDING:
    case "PENDING":
      return (
        <Badge
          variant="pending"
          className={cn("gap-1 font-medium font-mono text-[11px]", className)}
        >
          {showIcon && <Clock className="w-3 h-3 text-amber-600" />}
          <span>PENDING</span>
        </Badge>
      );
    case AppointmentStatus.CONFIRMED:
    case "CONFIRMED":
      return (
        <Badge
          variant="confirmed"
          className={cn("gap-1 font-medium font-mono text-[11px]", className)}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          <span>CONFIRMED</span>
        </Badge>
      );
    case AppointmentStatus.COMPLETED:
    case "COMPLETED":
      return (
        <Badge
          variant="completed"
          className={cn("gap-1 font-medium font-mono text-[11px]", className)}
        >
          {showIcon && <CheckCheck className="w-3 h-3 text-sky-600" />}
          <span>COMPLETED</span>
        </Badge>
      );
    case AppointmentStatus.CANCELLED:
    case "CANCELLED":
      return (
        <Badge
          variant="cancelled"
          className={cn("gap-1 font-medium font-mono text-[11px]", className)}
        >
          {showIcon && <XCircle className="w-3 h-3 text-rose-600" />}
          <span>CANCELLED</span>
        </Badge>
      );
    case AppointmentStatus.NO_SHOW:
    case "NO_SHOW":
      return (
        <Badge
          variant="noshow"
          className={cn("gap-1 font-medium font-mono text-[11px]", className)}
        >
          {showIcon && <AlertTriangle className="w-3 h-3 text-purple-600" />}
          <span>NO SHOW</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
  }
}
