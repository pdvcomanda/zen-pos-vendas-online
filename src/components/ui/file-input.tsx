
import * as React from "react";
import { cn } from "@/lib/utils";

export interface FileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  accept?: string;
  onFilesChange?: (files: File[]) => void;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, accept, onFilesChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && onFilesChange) {
        const filesArray = Array.from(event.target.files);
        onFilesChange(filesArray);
      }
    };

    return (
      <input
        type="file"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        accept={accept}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
FileInput.displayName = "FileInput";

export { FileInput };
