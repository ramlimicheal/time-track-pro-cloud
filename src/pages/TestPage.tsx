export default function TestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Test Page</h1>
        <p>If you can see this, React is working!</p>
        <div className="space-y-2 text-left bg-gray-100 p-4 rounded">
          <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</p>
          <p><strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</p>
        </div>
      </div>
    </div>
  );
}
