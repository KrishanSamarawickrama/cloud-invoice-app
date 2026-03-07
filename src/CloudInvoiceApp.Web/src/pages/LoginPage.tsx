import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--color-background)] via-[var(--color-accent-light)] to-[var(--color-background)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 shadow-xl"
      >
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent)] shadow-lg">
            <FileText className="h-7 w-7 text-white" />
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
      </motion.div>
    </div>
  );
}
