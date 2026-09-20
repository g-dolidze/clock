import { Link } from "react-router-dom";
import { Button, EmptyState } from "@ontime/web-shared";

export function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="The page you're looking for doesn't exist."
      action={
        <Link to="/">
          <Button variant="secondary">Back to discovery</Button>
        </Link>
      }
    />
  );
}
