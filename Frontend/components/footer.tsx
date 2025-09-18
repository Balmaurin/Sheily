export function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-white/60 flex items-center justify-between">
        <p>© {new Date().getFullYear()} Sheily. Todos los derechos reservados.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-white">Privacidad</a>
          <a href="#" className="hover:text-white">Términos</a>
          <a href="#" className="hover:text-white">Contacto</a>
        </div>
      </div>
    </footer>
  );
}
