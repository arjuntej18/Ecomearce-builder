(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/admin/products/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
// Admin product list with inline variant-price editing.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://acuwayseaavxrmxjcjhi.supabase.co"), ("TURBOPACK compile-time value", "sb_publishable_yCSbBRHb8kcxfe3B6G7s8Q_kMkfp6EE"));
function ProductsPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [variants, setVariants] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [inventory, setInventory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [editingVariantId, setEditingVariantId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingPrice, setEditingPrice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [savingVariantId, setSavingVariantId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    async function loadProducts() {
        setLoading(true);
        setError("");
        try {
            const { data: productData, error: productError } = await supabase.from("products").select("id, name, slug, brand, base_price, sale_price, is_active, is_featured").order("created_at", {
                ascending: false
            });
            if (productError) {
                console.error(productError);
                setError("Unable to load products.");
                return;
            }
            const loadedProducts = productData ?? [];
            setProducts(loadedProducts);
            if (!loadedProducts.length) {
                setVariants([]);
                setInventory([]);
                return;
            }
            const productIds = loadedProducts.map((product)=>product.id);
            const { data: variantData, error: variantError } = await supabase.from("product_variants").select("id, product_id, price, size, color, sku").in("product_id", productIds).eq("is_active", true);
            if (variantError) {
                console.error(variantError);
                setVariants([]);
                setInventory([]);
                return;
            }
            const loadedVariants = variantData ?? [];
            setVariants(loadedVariants);
            if (!loadedVariants.length) {
                setInventory([]);
                return;
            }
            const variantIds = loadedVariants.map((variant)=>variant.id);
            const { data: inventoryData, error: inventoryError } = await supabase.from("inventory").select("variant_id, quantity").in("variant_id", variantIds);
            if (inventoryError) {
                console.error(inventoryError);
                setInventory([]);
                return;
            }
            setInventory(inventoryData ?? []);
        } catch (error) {
            console.error(error);
            setError("Unable to load products.");
            setProducts([]);
            setVariants([]);
            setInventory([]);
        } finally{
            setLoading(false);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductsPage.useEffect": ()=>{
            loadProducts();
        }
    }["ProductsPage.useEffect"], []);
    const filteredProducts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProductsPage.useMemo[filteredProducts]": ()=>{
            const query = search.trim().toLowerCase();
            return products.filter({
                "ProductsPage.useMemo[filteredProducts]": (product)=>{
                    const matchesSearch = !query || product.name.toLowerCase().includes(query) || product.slug.toLowerCase().includes(query) || (product.brand ?? "").toLowerCase().includes(query);
                    const matchesFilter = filter === "all" || filter === "active" && product.is_active || filter === "inactive" && !product.is_active;
                    return matchesSearch && matchesFilter;
                }
            }["ProductsPage.useMemo[filteredProducts]"]);
        }
    }["ProductsPage.useMemo[filteredProducts]"], [
        products,
        search,
        filter
    ]);
    function getProductVariants(productId) {
        return variants.filter((variant)=>variant.product_id === productId);
    }
    function getVariantCount(productId) {
        return getProductVariants(productId).length;
    }
    function getStock(productId) {
        const productVariantIds = getProductVariants(productId).map((variant)=>variant.id);
        return inventory.filter((item)=>productVariantIds.includes(item.variant_id)).reduce((total, item)=>total + Number(item.quantity ?? 0), 0);
    }
    function getStartingPrice(productId) {
        const prices = getProductVariants(productId).map((variant)=>Number(variant.price)).filter((price)=>Number.isFinite(price) && price > 0);
        if (!prices.length) {
            return null;
        }
        return Math.min(...prices);
    }
    function startPriceEdit(variant) {
        setEditingVariantId(variant.id);
        setEditingPrice(String(variant.price ?? ""));
        setError("");
    }
    function cancelPriceEdit() {
        setEditingVariantId(null);
        setEditingPrice("");
    }
    async function saveVariantPrice(variant) {
        const price = Number(editingPrice);
        if (!Number.isFinite(price) || price <= 0) {
            setError("Price must be greater than zero.");
            return;
        }
        setSavingVariantId(variant.id);
        setError("");
        try {
            const response = await fetch(`/api/admin/products/${variant.product_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: products.find((product)=>product.id === variant.product_id)?.name ?? "",
                    slug: products.find((product)=>product.id === variant.product_id)?.slug ?? "",
                    description: products.find((product)=>product.id === variant.product_id)?.slug ?? "",
                    brand: products.find((product)=>product.id === variant.product_id)?.brand ?? "",
                    base_price: products.find((product)=>product.id === variant.product_id)?.base_price ?? price,
                    sale_price: products.find((product)=>product.id === variant.product_id)?.sale_price ?? null,
                    category_id: null,
                    main_image_url: null,
                    is_featured: products.find((product)=>product.id === variant.product_id)?.is_featured ?? false,
                    is_active: products.find((product)=>product.id === variant.product_id)?.is_active ?? true,
                    variants: [
                        {
                            id: variant.id,
                            price
                        }
                    ]
                })
            });
            const result = await response.json();
            if (!response.ok) {
                setError(result.error || "Unable to update price.");
                return;
            }
            setVariants((current)=>current.map((item)=>item.id === variant.id ? {
                        ...item,
                        price
                    } : item));
            setEditingVariantId(null);
            setEditingPrice("");
        } catch (error) {
            console.error(error);
            setError("Unable to update price.");
        } finally{
            setSavingVariantId(null);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-gray-50 p-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-7xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col justify-between gap-4 sm:flex-row sm:items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-3xl font-bold text-gray-900",
                                            children: "Products"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/products/page.tsx",
                                            lineNumber: 508,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700",
                                            children: products.length
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/products/page.tsx",
                                            lineNumber: 512,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/products/page.tsx",
                                    lineNumber: 507,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-gray-500",
                                    children: "Manage products, pricing, stock and availability."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/products/page.tsx",
                                    lineNumber: 517,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/products/page.tsx",
                            lineNumber: 506,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>router.push("/admin/products/new"),
                            className: "rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800",
                            children: "+ Add Product"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/products/page.tsx",
                            lineNumber: 522,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/products/page.tsx",
                    lineNumber: 505,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/products/page.tsx",
                    lineNumber: 536,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-6 flex flex-col gap-3 md:flex-row md:items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: search,
                            onChange: (e)=>setSearch(e.target.value),
                            placeholder: "Search products...",
                            className: "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black md:max-w-md"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/products/page.tsx",
                            lineNumber: 543,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2",
                            children: [
                                "all",
                                "active",
                                "inactive"
                            ].map((filterValue)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setFilter(filterValue),
                                    className: `rounded-lg border px-4 py-3 text-sm font-semibold capitalize ${filter === filterValue ? "border-black bg-black text-white" : "border-gray-300 bg-white text-gray-900"}`,
                                    children: filterValue
                                }, filterValue, false, {
                                    fileName: "[project]/src/app/admin/products/page.tsx",
                                    lineNumber: 564,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/products/page.tsx",
                            lineNumber: 555,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/products/page.tsx",
                    lineNumber: 542,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm",
                    children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-8 text-gray-500",
                        children: "Loading products..."
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/products/page.tsx",
                        lineNumber: 591,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "overflow-x-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "min-w-full",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    className: "border-b bg-gray-50",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
                                                children: "Product"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/products/page.tsx",
                                                lineNumber: 599,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
                                                children: "Brand"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/products/page.tsx",
                                                lineNumber: 603,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
                                                children: "Price"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/products/page.tsx",
                                                lineNumber: 607,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
                                                children: "Variants"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/products/page.tsx",
                                                lineNumber: 611,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
                                                children: "Stock"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/products/page.tsx",
                                                lineNumber: 615,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
                                                children: "Featured"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/products/page.tsx",
                                                lineNumber: 619,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
                                                children: "Status"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/products/page.tsx",
                                                lineNumber: 623,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-6 py-4 text-left text-sm font-semibold text-gray-900",
                                                children: "Actions"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/products/page.tsx",
                                                lineNumber: 627,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/products/page.tsx",
                                        lineNumber: 598,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/products/page.tsx",
                                    lineNumber: 597,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: [
                                        filteredProducts.map((product)=>{
                                            const productVariants = getProductVariants(product.id);
                                            const variantCount = productVariants.length;
                                            const stock = getStock(product.id);
                                            const startingPrice = getStartingPrice(product.id);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "border-b last:border-b-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "font-semibold text-gray-900",
                                                                children: product.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/products/page.tsx",
                                                                lineNumber: 662,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-1 text-sm text-gray-500",
                                                                children: product.slug
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/products/page.tsx",
                                                                lineNumber: 668,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/products/page.tsx",
                                                        lineNumber: 661,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-5 text-gray-700",
                                                        children: product.brand || "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/products/page.tsx",
                                                        lineNumber: 675,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-5",
                                                        children: productVariants.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2",
                                                            children: productVariants.map((variant)=>{
                                                                const isEditing = editingVariantId === variant.id;
                                                                const isSaving = savingVariantId === variant.id;
                                                                const label = [
                                                                    variant.size,
                                                                    variant.color
                                                                ].filter(Boolean).join(" / ") || variant.sku;
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "min-w-[90px] text-xs text-gray-500",
                                                                            children: label
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/products/page.tsx",
                                                                            lineNumber: 718,
                                                                            columnNumber: 41
                                                                        }, this),
                                                                        !isEditing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            onClick: ()=>startPriceEdit(variant),
                                                                            className: "rounded px-2 py-1 font-semibold text-gray-900 hover:bg-gray-100 hover:underline",
                                                                            children: [
                                                                                "₹",
                                                                                Number(variant.price ?? 0).toFixed(2)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/admin/products/page.tsx",
                                                                            lineNumber: 725,
                                                                            columnNumber: 43
                                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                    type: "number",
                                                                                    min: "0.01",
                                                                                    step: "0.01",
                                                                                    value: editingPrice,
                                                                                    onChange: (event)=>setEditingPrice(event.target.value),
                                                                                    className: "w-24 rounded border border-gray-300 px-2 py-1 text-sm",
                                                                                    autoFocus: true
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin/products/page.tsx",
                                                                                    lineNumber: 744,
                                                                                    columnNumber: 45
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    type: "button",
                                                                                    disabled: isSaving,
                                                                                    onClick: ()=>saveVariantPrice(variant),
                                                                                    className: "rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white disabled:bg-gray-400",
                                                                                    children: isSaving ? "..." : "Save"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin/products/page.tsx",
                                                                                    lineNumber: 764,
                                                                                    columnNumber: 45
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    type: "button",
                                                                                    disabled: isSaving,
                                                                                    onClick: cancelPriceEdit,
                                                                                    className: "rounded border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700",
                                                                                    children: "Cancel"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin/products/page.tsx",
                                                                                    lineNumber: 781,
                                                                                    columnNumber: 45
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/admin/products/page.tsx",
                                                                            lineNumber: 743,
                                                                            columnNumber: 43
                                                                        }, this)
                                                                    ]
                                                                }, variant.id, true, {
                                                                    fileName: "[project]/src/app/admin/products/page.tsx",
                                                                    lineNumber: 712,
                                                                    columnNumber: 39
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/products/page.tsx",
                                                            lineNumber: 685,
                                                            columnNumber: 31
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm text-gray-400",
                                                            children: "No variant price"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/products/page.tsx",
                                                            lineNumber: 801,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/products/page.tsx",
                                                        lineNumber: 682,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-5",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700",
                                                            children: variantCount
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/products/page.tsx",
                                                            lineNumber: 808,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/products/page.tsx",
                                                        lineNumber: 807,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: stock === 0 ? "font-semibold text-red-600" : stock <= 5 ? "font-semibold text-orange-600" : "font-semibold text-gray-900",
                                                                children: stock
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/products/page.tsx",
                                                                lineNumber: 816,
                                                                columnNumber: 29
                                                            }, this),
                                                            stock <= 5 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-1 text-xs text-gray-500",
                                                                children: stock === 0 ? "Out of stock" : "Low stock"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/products/page.tsx",
                                                                lineNumber: 832,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/products/page.tsx",
                                                        lineNumber: 815,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-5",
                                                        children: product.is_featured ? "Yes" : "No"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/products/page.tsx",
                                                        lineNumber: 841,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-5",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `rounded-full px-3 py-1 text-xs font-semibold ${product.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`,
                                                            children: product.is_active ? "Active" : "Inactive"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/products/page.tsx",
                                                            lineNumber: 848,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/products/page.tsx",
                                                        lineNumber: 847,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-5",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>router.push(`/admin/products/${product.id}`),
                                                            className: "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:border-black",
                                                            children: "Edit"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/products/page.tsx",
                                                            lineNumber: 862,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/products/page.tsx",
                                                        lineNumber: 861,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, product.id, true, {
                                                fileName: "[project]/src/app/admin/products/page.tsx",
                                                lineNumber: 655,
                                                columnNumber: 25
                                            }, this);
                                        }),
                                        !filteredProducts.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                colSpan: 8,
                                                className: "px-6 py-12 text-center text-gray-500",
                                                children: "No products found."
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/products/page.tsx",
                                                lineNumber: 881,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/products/page.tsx",
                                            lineNumber: 880,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/products/page.tsx",
                                    lineNumber: 633,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/products/page.tsx",
                            lineNumber: 596,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/products/page.tsx",
                        lineNumber: 595,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/products/page.tsx",
                    lineNumber: 589,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/admin/products/page.tsx",
            lineNumber: 503,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/admin/products/page.tsx",
        lineNumber: 502,
        columnNumber: 5
    }, this);
}
_s(ProductsPage, "Me+MJ5uZDev+9qV3mKvSch588F4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ProductsPage;
var _c;
__turbopack_context__.k.register(_c, "ProductsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_admin_products_page_tsx_0vky2ec._.js.map