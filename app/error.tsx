'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            {error.message || 'An unexpected error occurred.'}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={reset} className="w-full">
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
