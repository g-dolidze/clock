import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card } from "@ontime/web-shared";
import { useLogin } from "../hooks/useAuth";

const schema = z.object({
  name: z.string().min(1, "Tell us what to call you").max(120),
  email: z.string().min(3, "Enter a valid email").email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/account";

  function onSubmit(values: FormValues) {
    login.mutate(values, {
      onSuccess: () => navigate(redirectTo, { replace: true }),
    });
  }

  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="mb-2 text-2xl font-black text-white">Sign in</h1>
      <p className="mb-6 text-sm text-white/60">
        No password needed — just your name and email. We use this to track your orders and
        reservations.
      </p>
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-white/80">
              Name
            </label>
            <input
              id="name"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#e3572c]"
              placeholder="Nino Beridze"
              {...register("name")}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-white/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#e3572c]"
              placeholder="nino@example.com"
              {...register("email")}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>
          {login.isError && <p className="text-sm text-red-400">Sign in failed. Please try again.</p>}
          <Button type="submit" loading={login.isPending} className="w-full">
            Continue
          </Button>
        </form>
      </Card>
    </div>
  );
}
