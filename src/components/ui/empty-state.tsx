import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sand-100 text-sand-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-sand-900 mb-2">{title}</h3>
      {description ? <p className="text-sand-600 mb-4">{description}</p> : null}
      {action ? <div className="flex justify-center">{action}</div> : null}
    </div>
  );
}
