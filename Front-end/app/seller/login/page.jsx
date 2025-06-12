"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function SellerAuthPage() {
  const router = useRouter()
  const { login, register } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegisterChange = (e) => {
    const { name, value } = e.target
    setRegisterForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(loginForm.email, loginForm.password)
      toast({
        title: "Login successful",
        description: "Welcome back to your seller dashboard.",
      })
      router.push("/seller/dashboard")
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Registration failed",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      await register(registerForm.name, registerForm.email, registerForm.password)
      toast({
        title: "Registration successful",
        description: "Your seller account has been created.",
      })
      router.push("/seller/dashboard")
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-lg border p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Seller Portal</h1>
          <p className="text-gray-600">Login or register to manage your products</p>
        </div>

        

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-2 block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <div className="text-right text-sm">
                <Link href="#" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="register-name" className="mb-2 block text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="register-name"
                  name="name"
                  value={registerForm.name}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="register-email" className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="register-password" className="mb-2 block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            By continuing, you agree to our{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
