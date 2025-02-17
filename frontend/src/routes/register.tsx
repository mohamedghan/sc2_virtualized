import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlusIcon, UserIcon, LockIcon, ArrowLeftIcon } from 'lucide-react'
import { api } from '@/lib/api'

function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Please enter both username and password')
    } else {
      setError('')
      console.log('Registration attempted with:', { username, password })
        const res = await api.register.$post({
            json: {
                username: username,
                password: password
            }
        })

        if (res.status == 401) {
            return 
        }

        navigate({to: "/"})
    }
  }

  const handleBackToLogin = () => {
    console.log('Navigate back to login page')
    navigate({to: "/"})
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center">
                <img src="logo.jpg" className="rounded-md w-16"></img>
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-bold text-white">Create an Account</CardTitle>
          <CardDescription className="text-center text-blue-100">
            Enter your details to register for an account
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
                  pattern='[a-zA-Z][0-9a-zA-Z]*'        
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
              <UserPlusIcon className="mr-2 h-4 w-4" />
              <span>Register</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-white text-blue-900 hover:text-blue-900 hover:bg-blue-50" 
              type="button"
              onClick={handleBackToLogin}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              <span>Back to Login</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/register')({
  component: () => <Register/> ,
})
