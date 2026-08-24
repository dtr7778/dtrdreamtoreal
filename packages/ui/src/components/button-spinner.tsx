import { Button, type ButtonProps } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";

interface ButtonSpinnerProps extends Omit<ButtonProps, "render"> {
  isLoading: boolean;
}

function ButtonSpinner({
  children,
  isLoading,
  size = "default",
  ...props
}: ButtonSpinnerProps) {
  return (
    <Button
      {...props}
      size={size}
      disabled={isLoading}
      aria-disabled={isLoading}
    >
      {isLoading && <Spinner />}
      {isLoading && size?.startsWith("icon") ? null : children}
    </Button>
  );
}

export { ButtonSpinner };
