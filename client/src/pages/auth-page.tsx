import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(1, "Display name is required"),
  organizationName: z
    .string()
    .min(4, "Organization name must be at least 4 characters")
    .optional(),
  workspaceName: z
    .string()
    .min(4, "Workspace name must be at least 4 characters")
    .optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [location] = useLocation();
  const { toast } = useToast();
  const { login, register } = useUser();

  const workspaceId = location.startsWith("/workspaces/")
    ? location.split("/workspaces/")[1]
    : null;

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
      displayName: "",
      organizationName: "",
      workspaceName: "",
    },
  });

  // Auto-login in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // First create the dummy user
      fetch('/api/create-dummy-user', { method: 'POST' })
        .then(() => {
          // Then attempt auto-login
          loginForm.setValue('username', 'demo');
          loginForm.setValue('password', 'demo123');
          loginForm.handleSubmit(onLoginSubmit)();
        })
        .catch(error => {
          console.error('Auto-login failed:', error);
        });
    }
  }, []);

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data);
      if (!result.ok) {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    try {
      const signupData = workspaceId
        ? {
            ...data,
            workspaceId: parseInt(workspaceId),
          }
        : data;

      const result = await register(signupData);
      if (!result.ok) {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Account created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    // Reset both forms when switching
    loginForm.reset();
    signupForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>{isLogin ? "Login" : "Create Account"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your credentials to access your workspace"
              : workspaceId
                ? "Create an account to join this workspace"
                : "Create your organization and workspace"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <Form {...loginForm}>
              <form
                id="login-form"
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="demo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...signupForm}>
              <form
                id="signup-form"
                onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={signupForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="johndoe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="John Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!workspaceId && (
                  <>
                    <FormField
                      control={signupForm.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Acme Corp"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="workspaceName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workspace Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Engineering"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
            </Form>
          )}
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={toggleForm}
              className="text-primary"
            >
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}