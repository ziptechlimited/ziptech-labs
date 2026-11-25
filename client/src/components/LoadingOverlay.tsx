import { useLoading } from "../context/LoadingContext";

const LoadingOverlay = () => {
  const { isLoading } = useLoading();
  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 z-[60] grid animate-fade place-items-center bg-black/50 backdrop-blur-sm" aria-busy="true" aria-live="polite" role="status">
      <div className="zl-loader" />
    </div>
  );
};

export default LoadingOverlay;
