import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";
import { API } from "../lib/api";
import AppShell from "../components/ui/AppShell";
import { EmptyState, Spinner } from "../components/ui/primitives";

// Older links point at /profile/:id — resolve them to the public execution record.
const UserProfile = () => {
  const { id } = useParams();
  const [slug, setSlug] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/users/${id}`)
      .then((res) => (res.data.slug && res.data.role === "founder" ? setSlug(res.data.slug) : setFailed(true)))
      .catch(() => setFailed(true));
  }, [id]);

  if (slug) return <Navigate to={`/f/${slug}`} replace />;
  return (
    <AppShell>
      {failed ? <EmptyState title="No public record" body="This person doesn't have a public execution record." /> : <Spinner />}
    </AppShell>
  );
};

export default UserProfile;
