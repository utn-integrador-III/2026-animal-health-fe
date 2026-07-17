export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}
