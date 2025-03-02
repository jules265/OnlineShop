import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { lazy, Suspense } from "react";

const CustomerDashboard = lazy(() => import("@/pages/customer-dashboard"));

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Suspense fallback={<div>Loading...</div>}>
          <CustomerDashboard />
        </Suspense>
      </Route>
      <Route path="/dashboard">
        <Suspense fallback={<div>Loading...</div>}>
          <CustomerDashboard />
        </Suspense>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;