import { Link } from "react-router-dom";
import AppShell from "../components/ui/AppShell";
import { Eyebrow } from "../components/ui/primitives";

const NotFound = () => (
  <AppShell>
    <div className="flex flex-col items-center py-24 text-center">
      <Eyebrow>Error 404</Eyebrow>
      <h1 className="display mt-4 text-5xl font-medium sm:text-7xl">Off the record.</h1>
      <p className="mt-4 max-w-md text-subtle">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn btn-primary btn-lg mt-8">Back to home</Link>
    </div>
  </AppShell>
);

export default NotFound;
