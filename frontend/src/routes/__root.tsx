import * as React from 'react'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { type QueryClient } from '@tanstack/react-query';

interface MyRouterContext {
    queryClient: QueryClient;
  }

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <React.Fragment>
        <Outlet />
    </React.Fragment>
  ),
})
