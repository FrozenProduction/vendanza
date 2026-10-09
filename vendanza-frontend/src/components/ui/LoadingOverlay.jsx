export default function LoadingOverlay({ visible }) {
  if (!visible) return null;
  return (
    <div className="loading-overlay-app">
      <div className="spinner-app" />
    </div>
  );
}
