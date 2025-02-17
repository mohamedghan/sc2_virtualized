import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, LogOutIcon } from "lucide-react"
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PlayIcon, PauseIcon, PlusIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

//TODO: remove this fake response
const skel = {
  State: {
    Running: false,
    Dead: false,
    Status: "created"
  },
  Name: "heuristic_lamarr",
  Id: "c8c2263040451645f2ad45caa9f1ff23c3d597f1da8b4b0e4a1afc494f6511c7",
  Config: {
    Image: "sc2: latest"
  }
}

const buttonLoading = <Button disabled variant="outline" size="sm"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wait</Button>
export default function Index() {
  const queryClient = useQueryClient();
  const { isPending, error, data:container } = useQuery({
    queryKey: ['get-containers'],
    queryFn: getContainers,
    retry: 0
  })
  const smutation = useMutation({
    mutationFn: async ({state}) => {
      // TODO: start or stop container depending on state
      queryClient.invalidateQueries({ queryKey: ['get-containers'] })
      // TODO: replace with server response
      return skel
    },
  })

  const handleCreateContainer = async () => {
    // TODO: create a new container
    queryClient.invalidateQueries({queryKey: ['get-containers']})
  }

  const handleStartContainer = async (id: string) => {
    smutation.mutate({state:"start"})
  }

  const handleLaunchContainer = async () => {
    const a = document.createElement('a')
    a.href = "/vnc"
    a.target = "_blank"
    a.click()
  }

  const handleStopContainer = async (id: string) => {
    smutation.mutate({state:"stop"})
  }

  if (isPending) return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SC2 Internal Tool</h1>
      <div className="mb-4 flex justify-between items-center">
        <Button onClick={() => window.location = "/api/logout"} disabled>
          <LogOutIcon className="mr-2 h-4 w-4" /> Logout
        </Button>
        <Button onClick={handleCreateContainer} disabled>
          <PlusIcon className="mr-2 h-4 w-4" /> Create Container
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow key="555">
              <TableCell><Skeleton className="h-4 w-[600px]"/></TableCell>
              <TableCell><Skeleton className="h-4 w-[150px]"/></TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs bg-yellow-200 text-yellow-800`}
                >
                  loading
                </span>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-[150px]"></Skeleton></TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[150px]"></Skeleton>
              </TableCell>
            </TableRow>
            
        </TableBody>
      </Table>
    </div>
  )

  console.log(container)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SC2 Internal Tool</h1>
      <div className="mb-4 flex justify-between items-center">
        <Button onClick={() => window.location = "/api/logout"}>
          <LogOutIcon className="mr-2 h-4 w-4" /> Logout
        </Button>
        <Button onClick={handleCreateContainer}>
          <PlusIcon className="mr-2 h-4 w-4" /> Create Container
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!error ? <TableRow key={container.Id}>
              <TableCell>{container.Id}</TableCell>
              <TableCell>{container.Name}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    container.State.Running
                      ? 'bg-green-200 text-green-800'
                      : container.State.Dead
                        ? 'bg-red-200 text-red-800'
                        : 'bg-yellow-200 text-yellow-800'
                  }`}
                >
                  {container.State.Status}
                </span>
              </TableCell>
              <TableCell>{container.Config.Image}</TableCell>
              <TableCell>
                {smutation.isPending ? buttonLoading : container.State.Running ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStopContainer(container.Id)}
                  >
                    <PauseIcon className="mr-2 h-4 w-4" /> Stop
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartContainer(container.Id)}
                  >
                    <PlayIcon className="mr-2 h-4 w-4" /> Start
                  </Button>
                )}
                <Button disabled={!container.State.Running || smutation.isPending}
                  variant="outline"
                  size="sm"
                  className='mx-3'
                  onClick={() => handleLaunchContainer()}
                >
                  <PlayIcon className="mr-2 h-4 w-4" />Launch
                </Button>
              </TableCell>
            </TableRow> : null}
            
        </TableBody>
      </Table>
    </div>
  )
}

async function getContainers() {
  // TODO: get the user container
  return skel
}

export const Route = createFileRoute('/_auth/')({
  component: () => <Index />,
})
