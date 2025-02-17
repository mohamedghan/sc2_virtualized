import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";


import { api, userQueryOptions } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRightIcon, LockIcon, UserIcon, UserPlusIcon } from 'lucide-react'

export default function Loginold() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically handle the login logic
    // For now, we'll just show an error if fields are empty
    if (!username || !password) {
      setError('Please enter both username and password')
    } else {
      setError('')
      const res = await api.login.$post({json: {
        username: username,
        password: password
      }})
      await res.json()
      window.location = "/"
      console.log('Login attempted with:', { username, password })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <LockIcon className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Internal Tool Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the internal tool
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="sr-only">
                Username
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">
              Log in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}



function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically handle the login logic
    // For now, we'll just show an error if fields are empty
    if (!username || !password) {
      setError('Please enter both username and password')
    } else {
      setError('')
      const res = await api.login.$post({json: {
        username: username,
        password: password
      }})
      await res.json()
      window.location = "/"
      console.log('Login attempted with:', { username, password })
    }
  }

  const handleRegister = () => {
    console.log('Navigate to register page')
    navigate({to: "/register"})
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img src="logo.jpg" className="rounded-md w-16"></img>
          </div>
          <CardTitle className="text-2xl text-center font-bold text-white">Welcome Back</CardTitle>
          <CardDescription className="text-center text-blue-100">
            Enter your credentials to access the internal tool
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="sr-only">
                Username
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-900" />
                <Input
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-white border-white/10 text-blue-900 placeholder-blue-900/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-900" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white border-white/10 text-blue-900 placeholder-blue-900/50"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button className="w-full bg-white text-blue-900 hover:bg-blue-50" type="submit">
              <span>Log in</span>
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-white text-blue-900 hover:bg-blue-50" 
              type="button"
              onClick={handleRegister}
            >
              <UserPlusIcon className="mr-2 h-4 w-4" />
              <span>Register</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


const Component = () => {
  const { user } = Route.useRouteContext();
  if (!user) {
    return <Login />;
  }

  return <Outlet />;
};

// src/routes/_authenticated.tsx
export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    const queryClient = context.queryClient;
    try {
      const data = await queryClient.fetchQuery(userQueryOptions);
      return data;
    } catch (e) {
      return { user: null };
    }
  },
  component: Component,
});

