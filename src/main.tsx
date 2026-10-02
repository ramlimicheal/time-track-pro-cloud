import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { configurationError } from "./lib/configuration";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
const issue = configurationError({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
});

function showConfigurationIssue(message: string) {
  root.render(<div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div className="max-w-lg rounded border bg-white p-6 space-y-3">
      <h1 className="text-xl font-bold">Application configuration required</h1>
      <p role="alert">{message}</p>
      <p>See the setup documentation. Never put a Supabase server secret in a Vite environment variable.</p>
    </div>
  </div>);
}

if (issue) {
  showConfigurationIssue(issue);
} else {
  // Do not initialize the generated Supabase client until configuration is valid.
  import("./App").then(({ default: App }) => root.render(<StrictMode><App /></StrictMode>))
    .catch(() => showConfigurationIssue("The application could not start. Check the deployment configuration and reload."));
}
