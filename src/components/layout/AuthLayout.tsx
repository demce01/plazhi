
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md px-4 py-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">BeachEase</h1>
              <p className="text-sm text-muted-foreground">
                Your beach reservation platform
              </p>
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
