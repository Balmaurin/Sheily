import { Accordion } from "@/components/ui/accordion";

export function FAQ() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-semibold">Preguntas frecuentes</h2>
        <p className="mt-3 text-white/70 max-w-prose">
          Respuestas rápidas a dudas comunes sobre la red, el orbe y la capa de verificación.
        </p>
        <div className="mt-8">
          <Accordion
            items={[
              {
                id: "1",
                question: "¿Puedo integrar mi login con el orbe?",
                answer:
                  "Sí. Expone eventos (success/error) que puedes conectar a tu flujo de autenticación para alterar la animación."
              },
              {
                id: "2",
                question: "¿Cómo personalizo colores y tipografías?",
                answer:
                  "Edita tailwind.config.ts (palette) y aplica clases en los componentes. Puedes añadir fuentes en layout.tsx."
              },
              {
                id: "3",
                question: "¿Es accesible y performante?",
                answer:
                  "La animación respeta prefers-reduced-motion y usa canvas eficiente con ResizeObserver."
              }
            ]}
          />
        </div>
      </div>
    </section>
  );
}
