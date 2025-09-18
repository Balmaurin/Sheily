import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Verificación por personas",
    desc: "Dispositivos cotidianos actúan como verificadores, aportando seguridad descentralizada."
  },
  {
    title: "Agregación de pruebas",
    desc: "Pruebas zk se agregan y se anclan en múltiples L1 para integridad verificable."
  },
  {
    title: "Rendimiento y UX",
    desc: "Animaciones suaves, accesibles y con bajo impacto en el rendimiento."
  },
  {
    title: "Tooling moderno",
    desc: "Next.js + Tailwind + componentes inspirados en shadcn para velocidad de entrega."
  }
];

export function FeatureGrid() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-semibold">Características</h2>
        <p className="mt-3 text-white/70 max-w-prose">
          Base sólida para una landing con estilo moderno, lista para personalizar y conectar con tu backend.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Card key={i} className={cn("h-full")}>
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-white/60 space-y-1">
                  <li>• Seguro</li>
                  <li>• Escalable</li>
                  <li>• Elegante</li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
