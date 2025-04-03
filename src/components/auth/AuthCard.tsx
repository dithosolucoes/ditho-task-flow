
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

type AuthCardProps = {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthCard({ title, description, footer, children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ditho-beige py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-ditho-navy/20 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-2">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-ditho-navy">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </div>
  );
}
