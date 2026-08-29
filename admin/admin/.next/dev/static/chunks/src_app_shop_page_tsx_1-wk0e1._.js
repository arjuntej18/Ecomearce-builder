(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/shop/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ShopPreviewPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://acuwayseaavxrmxjcjhi.supabase.co"), ("TURBOPACK compile-time value", "sb_publishable_yCSbBRHb8kcxfe3B6G7s8Q_kMkfp6EE"));
function ShopPreviewPage() {
    _s();
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [categories, setCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [variants, setVariants] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [inventory, setInventory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [editingId, setEditingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [savingId, setSavingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editForm, setEditForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editVariants, setEditVariants] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [discountId, setDiscountId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [discountPercent, setDiscountPercent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [savingDiscountId, setSavingDiscountId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    async function loadShop() {
        setLoading(true);
        setError("");
        try {
            const [productsResult, categoriesResult] = await Promise.all([
                supabase.from("products").select(`
            id,
            name,
            slug,
            category_id,
            brand,
            description,
            main_image_url,
            base_price,
            sale_price,
            is_featured,
            is_active
            `).eq("is_active", true).order("created_at", {
                    ascending: false
                }),
                supabase.from("categories").select("id, name, slug").order("name", {
                    ascending: true
                })
            ]);
            if (productsResult.error) {
                console.error(productsResult.error);
                setError("Unable to load products.");
                return;
            }
            const loadedProducts = productsResult.data ?? [];
            const loadedCategories = categoriesResult.data ?? [];
            setProducts(loadedProducts);
            setCategories(loadedCategories);
            if (!loadedProducts.length) {
                setVariants([]);
                setInventory([]);
                return;
            }
            const productIds = loadedProducts.map((product)=>product.id);
            const { data: variantData, error: variantError } = await supabase.from("product_variants").select(`
  id,
  product_id,
  sku,
  size,
  color,
  price,
  original_price,
  discount_percent,
  is_active
  `).in("product_id", productIds).eq("is_active", true);
            if (variantError) {
                console.error(variantError);
                setError("Unable to load product options.");
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
            } else {
                setInventory(inventoryData ?? []);
            }
        } catch (error) {
            console.error(error);
            setError("Unable to load shop preview.");
        } finally{
            setLoading(false);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ShopPreviewPage.useEffect": ()=>{
            loadShop();
        }
    }["ShopPreviewPage.useEffect"], []);
    function getProductVariants(productId) {
        return variants.filter((variant)=>variant.product_id === productId);
    }
    function getProductPrice(product) {
        const productVariants = getProductVariants(product.id);
        const prices = productVariants.map((variant)=>Number(variant.price)).filter((price)=>Number.isFinite(price) && price > 0);
        if (prices.length) {
            return Math.min(...prices);
        }
        if (product.sale_price != null) {
            return Number(product.sale_price);
        }
        return Number(product.base_price);
    }
    function getProductStock(productId) {
        const variantIds = getProductVariants(productId).map((variant)=>variant.id);
        return inventory.filter((item)=>variantIds.includes(item.variant_id)).reduce((total, item)=>total + Number(item.quantity ?? 0), 0);
    }
    function getAvailability(productId) {
        const stock = getProductStock(productId);
        if (stock <= 0) {
            return "Out of Stock";
        }
        if (stock <= 5) {
            return "Only a few left";
        }
        return "In Stock";
    }
    function startEditing(product) {
        setEditingId(product.id);
        setEditForm({
            name: product.name,
            category_id: product.category_id ?? "",
            description: product.description ?? "",
            brand: product.brand ?? "",
            base_price: String(product.base_price),
            sale_price: product.sale_price == null ? "" : String(product.sale_price),
            main_image_url: product.main_image_url ?? "",
            is_featured: Boolean(product.is_featured),
            is_active: Boolean(product.is_active)
        });
        const productVariants = getProductVariants(product.id);
        setEditVariants(productVariants.map((variant)=>({
                id: variant.id,
                sku: variant.sku,
                size: variant.size ?? "",
                color: variant.color ?? "",
                price: variant.price == null ? "" : String(variant.price)
            })));
        setError("");
    }
    function cancelEditing() {
        setEditingId(null);
        setEditForm(null);
        setEditVariants([]);
        setError("");
    }
    function updateEditVariantPrice(variantId, value) {
        setEditVariants((current)=>current.map((variant)=>variant.id === variantId ? {
                    ...variant,
                    price: value
                } : variant));
    }
    async function saveProduct(productId) {
        if (!editForm) {
            return;
        }
        const basePrice = Number(editForm.base_price);
        if (!Number.isFinite(basePrice) || basePrice <= 0) {
            setError("Base price must be greater than zero.");
            return;
        }
        let salePrice = null;
        if (editForm.sale_price.trim() !== "") {
            salePrice = Number(editForm.sale_price);
            if (!Number.isFinite(salePrice) || salePrice < 0) {
                setError("Sale price is invalid.");
                return;
            }
        }
        const variantUpdates = editVariants.map((variant)=>({
                id: variant.id,
                price: Number(variant.price)
            }));
        for (const variant of variantUpdates){
            if (!Number.isFinite(variant.price) || variant.price <= 0) {
                setError("Every variant price must be greater than zero.");
                return;
            }
        }
        setSavingId(productId);
        setError("");
        try {
            const existingProduct = products.find((product)=>product.id === productId);
            if (!existingProduct) {
                setError("Product not found.");
                return;
            }
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: editForm.name,
                    slug: existingProduct.slug,
                    description: editForm.description,
                    brand: editForm.brand,
                    base_price: basePrice,
                    sale_price: salePrice,
                    category_id: editForm.category_id || null,
                    main_image_url: editForm.main_image_url,
                    is_featured: editForm.is_featured,
                    is_active: editForm.is_active,
                    variants: variantUpdates
                })
            });
            const result = await response.json();
            if (!response.ok) {
                setError(result.error || "Unable to save product.");
                return;
            }
            setProducts((current)=>current.map((product)=>product.id === productId ? {
                        ...product,
                        ...result.product
                    } : product));
            if (Array.isArray(result.variants)) {
                setVariants((current)=>current.map((variant)=>{
                        const updated = result.variants.find((item)=>item.id === variant.id);
                        return updated ? {
                            ...variant,
                            ...updated
                        } : variant;
                    }));
            }
            setEditingId(null);
            setEditForm(null);
            setEditVariants([]);
        } catch (error) {
            console.error(error);
            setError("Unable to save product.");
        } finally{
            setSavingId(null);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-white text-gray-900",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-7xl p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-3xl font-bold",
                                    children: "Shop Preview"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/shop/page.tsx",
                                    lineNumber: 688,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-gray-500",
                                    children: "Preview the customer shop and edit products directly."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/shop/page.tsx",
                                    lineNumber: 692,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/shop/page.tsx",
                            lineNumber: 687,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "http://localhost:3001/shop",
                            target: "_blank",
                            className: "rounded-lg border-2 border-green-600 bg-green-600 px-5 py-3 text-center font-semibold text-white hover:bg-green-700",
                            children: "Open Storefront"
                        }, void 0, false, {
                            fileName: "[project]/src/app/shop/page.tsx",
                            lineNumber: 697,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/shop/page.tsx",
                    lineNumber: 686,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/src/app/shop/page.tsx",
                    lineNumber: 707,
                    columnNumber: 11
                }, this),
                loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-xl border border-gray-200 bg-gray-50 p-8 text-gray-500",
                    children: "Loading shop..."
                }, void 0, false, {
                    fileName: "[project]/src/app/shop/page.tsx",
                    lineNumber: 713,
                    columnNumber: 11
                }, this) : products.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500",
                    children: "No active products found."
                }, void 0, false, {
                    fileName: "[project]/src/app/shop/page.tsx",
                    lineNumber: 718,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                    children: products.map((product)=>{
                        const price = getProductPrice(product);
                        const availability = getAvailability(product.id);
                        const editing = editingId === product.id;
                        const saving = savingId === product.id;
                        const categoryName = categories.find((category)=>category.id === product.category_id)?.name || "Uncategorized";
                        const productVariants = getProductVariants(product.id);
                        function startDiscount(productId) {
                            setDiscountId(productId);
                            setDiscountPercent("");
                            setError("");
                        }
                        function cancelDiscount() {
                            setDiscountId(null);
                            setDiscountPercent("");
                        }
                        async function saveDiscount(productId) {
                            const percent = Number(discountPercent);
                            if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) {
                                setError("Discount must be between 1% and 99%.");
                                return;
                            }
                            setSavingDiscountId(productId);
                            setError("");
                            try {
                                const response = await fetch(`/api/admin/products/${productId}/discount`, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        discount_percent: percent
                                    })
                                });
                                const result = await response.json();
                                if (!response.ok) {
                                    setError(result.error || "Unable to apply discount.");
                                    return;
                                }
                                if (Array.isArray(result.variants)) {
                                    setVariants((current)=>current.map((variant)=>{
                                            const updated = result.variants.find((item)=>item.id === variant.id);
                                            return updated ? {
                                                ...variant,
                                                ...updated
                                            } : variant;
                                        }));
                                }
                                setDiscountId(null);
                                setDiscountPercent("");
                            } catch (error) {
                                console.error(error);
                                setError("Unable to apply discount.");
                            } finally{
                                setSavingDiscountId(null);
                            }
                        }
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-xl border border-gray-200 bg-white p-4 shadow-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "overflow-hidden rounded-lg bg-gray-100",
                                    children: product.main_image_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: product.main_image_url,
                                        alt: product.name,
                                        className: "aspect-square w-full object-cover"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/shop/page.tsx",
                                        lineNumber: 868,
                                        columnNumber: 25
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex aspect-square items-center justify-center text-sm text-gray-500",
                                        children: "No image"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/shop/page.tsx",
                                        lineNumber: 878,
                                        columnNumber: 25
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/shop/page.tsx",
                                    lineNumber: 866,
                                    columnNumber: 21
                                }, this),
                                !editing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-medium uppercase tracking-wide text-gray-500",
                                                    children: categoryName
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 887,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "mt-1 font-semibold text-gray-900",
                                                    children: product.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 891,
                                                    columnNumber: 27
                                                }, this),
                                                product.brand && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-1 text-xs text-gray-500",
                                                    children: product.brand
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 896,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-3",
                                                    children: (()=>{
                                                        const discountedVariant = productVariants.find((variant)=>Number(variant.discount_percent ?? 0) > 0 && variant.original_price != null);
                                                        const discountPercent = Number(discountedVariant?.discount_percent ?? 0);
                                                        const originalPrice = Number(discountedVariant?.original_price ?? price);
                                                        const currentPrice = Number(discountedVariant?.price ?? price);
                                                        if (discountPercent > 0 && originalPrice > currentPrice) {
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-sm text-gray-500 line-through",
                                                                        children: [
                                                                            "₹",
                                                                            originalPrice.toFixed(2)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/shop/page.tsx",
                                                                        lineNumber: 933,
                                                                        columnNumber: 11
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-lg font-bold text-gray-900",
                                                                        children: [
                                                                            "₹",
                                                                            currentPrice.toFixed(2)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/shop/page.tsx",
                                                                        lineNumber: 937,
                                                                        columnNumber: 11
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "mt-1 text-sm font-bold text-green-600",
                                                                        children: [
                                                                            discountPercent,
                                                                            "% OFF"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/shop/page.tsx",
                                                                        lineNumber: 941,
                                                                        columnNumber: 11
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/shop/page.tsx",
                                                                lineNumber: 932,
                                                                columnNumber: 9
                                                            }, this);
                                                        }
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-lg font-bold text-gray-900",
                                                            children: [
                                                                "₹",
                                                                price.toFixed(2)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/shop/page.tsx",
                                                            lineNumber: 949,
                                                            columnNumber: 7
                                                        }, this);
                                                    })()
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 901,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-1 text-sm font-medium text-gray-700",
                                                    children: availability
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 956,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-1 text-xs text-gray-400",
                                                    children: [
                                                        productVariants.length,
                                                        " ",
                                                        "option",
                                                        productVariants.length === 1 ? "" : "s"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 962,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/shop/page.tsx",
                                            lineNumber: 886,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-3 gap-2 mt-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>startEditing(product),
                                                    className: "rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800",
                                                    children: "Edit"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 975,
                                                    columnNumber: 3
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: `http://localhost:3001/product/${product.slug}`,
                                                    target: "_blank",
                                                    className: "rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900 hover:bg-gray-50",
                                                    children: "View"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 985,
                                                    columnNumber: 3
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>startDiscount(product.id),
                                                    className: "rounded-lg border border-green-600 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50",
                                                    children: "Discount"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 993,
                                                    columnNumber: 3
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/shop/page.tsx",
                                            lineNumber: 974,
                                            columnNumber: 25
                                        }, this),
                                        discountId === product.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-3 rounded-lg border border-green-200 bg-green-50 p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "mb-2 block text-xs font-semibold text-gray-700",
                                                    children: "Discount percentage"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1006,
                                                    columnNumber: 5
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "1",
                                                            max: "99",
                                                            step: "1",
                                                            value: discountPercent,
                                                            onChange: (event)=>setDiscountPercent(event.target.value),
                                                            placeholder: "10",
                                                            className: "w-20 rounded-lg border border-gray-300 bg-white p-2 text-sm"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/shop/page.tsx",
                                                            lineNumber: 1011,
                                                            columnNumber: 7
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm text-gray-700",
                                                            children: "%"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/shop/page.tsx",
                                                            lineNumber: 1026,
                                                            columnNumber: 7
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1010,
                                                    columnNumber: 5
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-3 flex gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            disabled: savingDiscountId === product.id,
                                                            onClick: ()=>saveDiscount(product.id),
                                                            className: "flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-400",
                                                            children: savingDiscountId === product.id ? "Applying..." : "Apply"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/shop/page.tsx",
                                                            lineNumber: 1032,
                                                            columnNumber: 7
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            disabled: savingDiscountId === product.id,
                                                            onClick: cancelDiscount,
                                                            className: "flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700",
                                                            children: "Cancel"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/shop/page.tsx",
                                                            lineNumber: 1051,
                                                            columnNumber: 7
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1031,
                                                    columnNumber: 5
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/shop/page.tsx",
                                            lineNumber: 1005,
                                            columnNumber: 3
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/shop/page.tsx",
                                    lineNumber: 885,
                                    columnNumber: 23
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-4 space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "mb-1 block text-xs font-semibold text-gray-600",
                                                    children: "Name"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1071,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    value: editForm?.name ?? "",
                                                    onChange: (event)=>setEditForm((prev)=>prev ? {
                                                                ...prev,
                                                                name: event.target.value
                                                            } : prev),
                                                    className: "w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1075,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/shop/page.tsx",
                                            lineNumber: 1070,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "mb-1 block text-xs font-semibold text-gray-600",
                                                    children: "Category"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1101,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: editForm?.category_id ?? "",
                                                    onChange: (event)=>setEditForm((prev)=>prev ? {
                                                                ...prev,
                                                                category_id: event.target.value
                                                            } : prev),
                                                    className: "w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "Uncategorized"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/shop/page.tsx",
                                                            lineNumber: 1128,
                                                            columnNumber: 29
                                                        }, this),
                                                        categories.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: category.id,
                                                                children: category.name
                                                            }, category.id, false, {
                                                                fileName: "[project]/src/app/shop/page.tsx",
                                                                lineNumber: 1136,
                                                                columnNumber: 33
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1105,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/shop/page.tsx",
                                            lineNumber: 1100,
                                            columnNumber: 25
                                        }, this),
                                        editVariants.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "mb-2 block text-xs font-semibold text-gray-600",
                                                    children: "Variant Prices"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1157,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-2",
                                                    children: editVariants.map((variant)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "rounded-lg border border-gray-200 bg-gray-50 p-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "mb-2 text-xs text-gray-500",
                                                                    children: [
                                                                        variant.size,
                                                                        variant.color
                                                                    ].filter(Boolean).join(" / ") || variant.sku
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                                    lineNumber: 1172,
                                                                    columnNumber: 37
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-sm font-medium text-gray-700",
                                                                            children: "₹"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/shop/page.tsx",
                                                                            lineNumber: 1187,
                                                                            columnNumber: 39
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "number",
                                                                            min: "0.01",
                                                                            step: "0.01",
                                                                            value: variant.price,
                                                                            onChange: (event)=>updateEditVariantPrice(variant.id, event.target.value),
                                                                            className: "w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/shop/page.tsx",
                                                                            lineNumber: 1191,
                                                                            columnNumber: 39
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                                    lineNumber: 1186,
                                                                    columnNumber: 37
                                                                }, this)
                                                            ]
                                                        }, variant.id, true, {
                                                            fileName: "[project]/src/app/shop/page.tsx",
                                                            lineNumber: 1166,
                                                            columnNumber: 35
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1161,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/shop/page.tsx",
                                            lineNumber: 1156,
                                            columnNumber: 27
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "mb-1 block text-xs font-semibold text-gray-600",
                                                    children: "Base Price"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1219,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    min: "0",
                                                    step: "0.01",
                                                    value: editForm?.base_price ?? "",
                                                    onChange: (event)=>setEditForm((prev)=>prev ? {
                                                                ...prev,
                                                                base_price: event.target.value
                                                            } : prev),
                                                    className: "w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1223,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/shop/page.tsx",
                                            lineNumber: 1218,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "mb-1 block text-xs font-semibold text-gray-600",
                                                    children: "Sale Price"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1252,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    min: "0",
                                                    step: "0.01",
                                                    value: editForm?.sale_price ?? "",
                                                    onChange: (event)=>setEditForm((prev)=>prev ? {
                                                                ...prev,
                                                                sale_price: event.target.value
                                                            } : prev),
                                                    className: "w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1256,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/shop/page.tsx",
                                            lineNumber: 1251,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "mb-1 block text-xs font-semibold text-gray-600",
                                                    children: "Brand"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1285,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    value: editForm?.brand ?? "",
                                                    onChange: (event)=>setEditForm((prev)=>prev ? {
                                                                ...prev,
                                                                brand: event.target.value
                                                            } : prev),
                                                    className: "w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1289,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/shop/page.tsx",
                                            lineNumber: 1284,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "mb-1 block text-xs font-semibold text-gray-600",
                                                    children: "Description"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1315,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                    rows: 3,
                                                    value: editForm?.description ?? "",
                                                    onChange: (event)=>setEditForm((prev)=>prev ? {
                                                                ...prev,
                                                                description: event.target.value
                                                            } : prev),
                                                    className: "w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1319,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/shop/page.tsx",
                                            lineNumber: 1314,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "mb-1 block text-xs font-semibold text-gray-600",
                                                    children: "Image URL"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1346,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "url",
                                                    value: editForm?.main_image_url ?? "",
                                                    onChange: (event)=>setEditForm((prev)=>prev ? {
                                                                ...prev,
                                                                main_image_url: event.target.value
                                                            } : prev),
                                                    className: "w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1350,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/shop/page.tsx",
                                            lineNumber: 1345,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "flex items-center gap-2 text-sm",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: editForm?.is_featured ?? false,
                                                            onChange: (event)=>setEditForm((prev)=>prev ? {
                                                                        ...prev,
                                                                        is_featured: event.target.checked
                                                                    } : prev)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/shop/page.tsx",
                                                            lineNumber: 1378,
                                                            columnNumber: 29
                                                        }, this),
                                                        "Featured"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1377,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "flex items-center gap-2 text-sm",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: editForm?.is_active ?? true,
                                                            onChange: (event)=>setEditForm((prev)=>prev ? {
                                                                        ...prev,
                                                                        is_active: event.target.checked
                                                                    } : prev)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/shop/page.tsx",
                                                            lineNumber: 1405,
                                                            columnNumber: 29
                                                        }, this),
                                                        "Active"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1404,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/shop/page.tsx",
                                            lineNumber: 1376,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    disabled: saving,
                                                    onClick: ()=>saveProduct(product.id),
                                                    className: "flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-400",
                                                    children: saving ? "Saving..." : "Save"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1433,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    disabled: saving,
                                                    onClick: cancelEditing,
                                                    className: "flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50",
                                                    children: "Cancel"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/shop/page.tsx",
                                                    lineNumber: 1450,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/shop/page.tsx",
                                            lineNumber: 1432,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/shop/page.tsx",
                                    lineNumber: 1069,
                                    columnNumber: 23
                                }, this)
                            ]
                        }, product.id, true, {
                            fileName: "[project]/src/app/shop/page.tsx",
                            lineNumber: 861,
                            columnNumber: 19
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/app/shop/page.tsx",
                    lineNumber: 722,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600",
                    children: "Product details and variant prices can be edited here. Stock remains managed in Admin → Inventory."
                }, void 0, false, {
                    fileName: "[project]/src/app/shop/page.tsx",
                    lineNumber: 1472,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/shop/page.tsx",
            lineNumber: 684,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/shop/page.tsx",
        lineNumber: 683,
        columnNumber: 5
    }, this);
}
_s(ShopPreviewPage, "AzmcrdXxdBXlpboWkjnpLc6tfR8=");
_c = ShopPreviewPage;
var _c;
__turbopack_context__.k.register(_c, "ShopPreviewPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_shop_page_tsx_1-wk0e1._.js.map