import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-start justify-center px-4 py-20">
      <p className="text-sm uppercase tracking-[0.2em] text-gold">404</p>
      <h1 className="mt-3 font-serif text-4xl text-petrol dark:text-ivory">
        Página no encontrada
      </h1>
      <p className="mt-3 text-muted">
        El recurso no existe o no tienes permiso para verlo.
      </p>
      <div className="mt-6 flex gap-3">
        <Button href="/">Ir al inicio</Button>
        <Button href="/buscar" variant="secondary">
          Buscar
        </Button>
      </div>
    </div>
  );
}
