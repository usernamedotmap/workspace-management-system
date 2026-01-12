import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";
import GoogleOauthButton from "@/components/auth/google-oauth-button";
import { useMutation } from "@tanstack/react-query";
import { loginMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeClosed, Loader } from "lucide-react";
import { useState } from "react";
import PageMeta from "@/components/common/PageMeta";
// import { useStore } from "@/store/store";

const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const [showPassword, setShowPassword] = useState(false);

  // const { setAccessToken } = useStore();


  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,

  })

  const formSchema = z.object({
    email: z.string().trim().email("Invalid email address").min(1, {
      message: "Workspace name is required",
    }),
    password: z.string().trim().min(1, {
      message: "Password is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;

    mutate(values, {
      onSuccess: (data) => {
        const user = data.user;
        const decodeUrl = returnUrl ? decodeURIComponent(returnUrl) : undefined
        navigate(decodeUrl || `/workspace/${user.currentWorkSpace}`)

      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.response.data.message || error.message,
          variant: "destructive"
        })
      }
    })
  };

  return (
    <>
    <PageMeta title="Sign In" description="Sign in to your account" />
    
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
   
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 justify-center font-semibold"
        >
          <Logo />
          <span>TMS</span>
        </Link>

        {/* Card na dito */}

        <Card>
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-xl sm:text-2xl">Welcome back</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Login with your Email or Google account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6">
                  <div className="flex flex-col gap-4">
                    <GoogleOauthButton label="Login" />
                  </div>

                  {/* divider daw */}
                  <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Johndoe@example.com"
                                className="!h-[48px] focus:ring-ring focus:outline-none"
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="relative grid gap-2">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center">
                              <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                Password
                              </FormLabel>

                            </div>
                            <FormControl>
                              <Input
                                type={showPassword ? "text" : "password"}
                                className="!h-[48px]"
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}

                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <EyeClosed />
                      ) : (
                          <Eye />
                        )}
                      </div>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Button disabled={isPending} type="submit" className="w-full">
                      {isPending ? <Loader className="animate-spin" /> : "Login"}
                    </Button>
                  </div>
                  <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/sign-up"
                      className="underline underline-offset-4"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
          By clicking continue, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>

      </div>
    </div>

    </>
  );
};

export default SignIn;
