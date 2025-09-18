import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-6 text-center rounded-3xl border border-border bg-card/60 p-10">
        <h3 className="text-2xl md:text-3xl font-semibold">¿Listo para construir?</h3>
        <p className="mt-3 text-white/70 max-w-2xl mx-auto">
          Empieza en minutos: clona, instala dependencias, personaliza secciones y conecta tu backend.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button size="lg">Crear cuenta</Button>
          <Button size="lg" variant="ghost">Ver docs</Button>
        </div>
      </div>
    </section>
  );
}
