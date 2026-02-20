import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function LoginPage() {
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="flex h-full items-center justify-center bg-[var(--color-background)]">
      <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-accent-light)]">
            <FileText className="h-6 w-6 text-[var(--color-accent)]" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">
            CloudInvoice
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Sign in to manage your invoices
          </p>
        </div>

        {/* Google Sign-In */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async (response) => {
              if (response.credential) {
                try {
                  await loginWithGoogle(response.credential);
                  navigate("/", { replace: true });
                } catch {
                  toast.error("Login failed. Please try again.");
                }
              }
            }}
            onError={() => {
              toast.error("Google sign-in failed. Please try again.");
            }}
            size="large"
            width="300"
            text="signin_with"
          />
        </div>
      </div>
    </div>
  );
}
