(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/ssr/middleware_ts_8a0420._.js", {

"[project]/middleware.ts [middleware] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, k: __turbopack_refresh__ }) => (() => {
"use strict";

__turbopack_esm__({
    "config": ()=>config,
    "middleware": ()=>middleware
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/next/dist/esm/api/server.js [middleware] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
async function middleware(request) {
    const { pathname } = request.nextUrl;
    // Rutas públicas que no requieren autenticación
    const publicPaths = [
        '/',
        '/login',
        '/registro',
        '/recuperar-contrasena',
        '/api/auth/signin',
        '/api/auth/callback'
    ];
    // Rutas protegidas que requieren autenticación
    const protectedPaths = [
        '/dashboard',
        '/perfil',
        '/seguridad',
        '/training',
        '/chat'
    ];
    // Verificar si la ruta es pública
    const isPublicPath = publicPaths.some((path)=>pathname.startsWith(path));
    // Verificar si la ruta es protegida
    const isProtectedPath = protectedPaths.some((path)=>pathname.startsWith(path));
    // Por ahora, permitir acceso a todas las rutas
    // La autenticación se manejará en el lado del cliente
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        '/',
        '/dashboard/:path*',
        '/login',
        '/registro',
        '/perfil/:path*',
        '/seguridad/:path*',
        '/training/:path*',
        '/chat/:path*'
    ]
};

})()),
}]);

//# sourceMappingURL=middleware_ts_8a0420._.js.map