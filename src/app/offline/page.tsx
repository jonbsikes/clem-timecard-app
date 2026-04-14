export default function Offline() {
  return (
    <main className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">You're offline</h1>
        <p className="text-stone-600">Your time card will be saved locally and synced when you're back on signal.</p>
      </div>
    </main>
  );
}
