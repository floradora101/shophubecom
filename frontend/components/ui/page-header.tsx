import { ReactNode } from "react";
import { Heading, Text } from "./typography";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Heading level={1} className="text-3xl">
          {title}
        </Heading>
        {description && (
          <Text className="mt-2 text-warm-gray-600">{description}</Text>
        )}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
}

