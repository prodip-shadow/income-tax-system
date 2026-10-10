import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PasswordInput = ({
  register,
  error,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          placeholder="Enter password"
          className="pr-11"
          {...register("password", {
            required: "Password is required",
          })}
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={
            show
              ? "Hide password"
              : "Show password"
          }
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          onClick={() => setShow(!show)}
        >
          {show ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;