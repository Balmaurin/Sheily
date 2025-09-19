const CHUNK_PUBLIC_PATH = "server/app/page.js";
const runtime = require("../chunks/ssr/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/ssr/node_modules_next_9f45d6._.js");
runtime.loadChunk("server/chunks/ssr/_9377d1._.js");
runtime.getOrInstantiateRuntimeModule("[project]/.next-internal/server/app/page/actions.js [app-rsc] (ecmascript)", CHUNK_PUBLIC_PATH);
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/node_modules/next/dist/esm/build/templates/app-page.js?page=/page { COMPONENT_0 => \"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js server component)\", COMPONENT_1 => \"[project]/app/error.tsx [app-rsc] (ecmascript, Next.js server component)\", COMPONENT_2 => \"[project]/app/not-found.tsx [app-rsc] (ecmascript, Next.js server component)\", COMPONENT_3 => \"[project]/app/page.tsx [app-rsc] (ecmascript, Next.js server component)\" } [app-rsc] (ecmascript) <facade>", CHUNK_PUBLIC_PATH).exports;
