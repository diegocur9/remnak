export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-balance text-6xl font-black tracking-tight text-foreground sm:text-7xl md:text-8xl">
          REM<span className="text-constructor">NAK</span>
        </h1>
        <p className="text-balance text-lg font-medium text-muted-foreground sm:text-xl">
          Nada sobra.
        </p>
      </div>
    </main>
  );
}
