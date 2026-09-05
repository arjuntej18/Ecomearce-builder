// Admin-only product creation API.
// Creates a product with multiple images, variants and inventory securely.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type VariantInput = {
  color: string;
  size: string;
  sku: string;
  price: string | number;
  stock: string | number;
};

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;

function getExtension(type: string) {
  if (type === "image/jpeg") {
    return "jpg";
  }

  if (type === "image/png") {
    return "png";
  }

  return "webp";
}

export async function POST(request: Request) {
  const uploadedImagePaths: string[] = [];
  let createdProductId: string | null = null;

  try {
    // Check logged-in admin.
    const supabaseSession =
      await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { data: profile } =
      await supabaseSession
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const name = String(
      formData.get("name") || ""
    ).trim();

    const slug = String(
      formData.get("slug") || ""
    ).trim();

    const description = String(
      formData.get("description") || ""
    ).trim();

    const brand = String(
      formData.get("brand") || ""
    ).trim();

    const basePrice = String(
      formData.get("base_price") || ""
    );

    const salePrice = String(
      formData.get("sale_price") || ""
    );

    const categoryId = String(
      formData.get("category_id") || ""
    ).trim();

    const isFeatured =
      String(
        formData.get("is_featured")
      ) === "true";

    const isActive =
      String(
        formData.get("is_active")
      ) !== "false";

    const variantsText = String(
      formData.get("variants") || "[]"
    );

    // Read all uploaded images.
    const imageEntries = formData
      .getAll("images")
      .filter(
        (value): value is File =>
          value instanceof File &&
          value.size > 0
      );

    // Backward compatibility with old single-image requests.
    if (
      imageEntries.length === 0
    ) {
      const legacyImage =
        formData.get("image");

      if (
        legacyImage instanceof File &&
        legacyImage.size > 0
      ) {
        imageEntries.push(legacyImage);
      }
    }

    if (!name || !slug || !basePrice) {
      return NextResponse.json(
        {
          error:
            "Name, slug and base price are required.",
        },
        { status: 400 }
      );
    }

    if (imageEntries.length > MAX_IMAGES) {
      return NextResponse.json(
        {
          error:
            `A maximum of ${MAX_IMAGES} images are allowed.`,
        },
        { status: 400 }
      );
    }

    let variants: VariantInput[];

    try {
      variants = JSON.parse(
        variantsText
      );
    } catch {
      return NextResponse.json(
        {
          error: "Invalid variant data.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(variants) ||
      variants.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "At least one variant is required.",
        },
        { status: 400 }
      );
    }

    for (const variant of variants) {
      if (
        !variant.color?.trim() ||
        !variant.size?.trim() ||
        !variant.sku?.trim() ||
        Number(variant.price) <= 0 ||
        Number(variant.stock) < 0
      ) {
        return NextResponse.json(
          {
            error:
              "Every variant needs color, size, code, price and valid stock.",
          },
          { status: 400 }
        );
      }
    }

    // Upload product images.
    const uploadedImages: {
      path: string;
      publicUrl: string;
    }[] = [];

    for (
      let index = 0;
      index < imageEntries.length;
      index++
    ) {
      const image = imageEntries[index];

      if (
        !ALLOWED_IMAGE_TYPES.includes(
          image.type
        )
      ) {
        return NextResponse.json(
          {
            error:
              `Image ${index + 1} must be JPG, PNG or WebP.`,
          },
          { status: 400 }
        );
      }

      if (
        image.size > MAX_IMAGE_SIZE
      ) {
        return NextResponse.json(
          {
            error:
              `Image ${index + 1} must be 5 MB or smaller.`,
          },
          { status: 400 }
        );
      }

      const extension =
        getExtension(image.type);

      const filePath =
        `products/${crypto.randomUUID()}.${extension}`;

      const {
        error: uploadError,
      } = await supabaseAdmin.storage
        .from("public-image")
        .upload(
          filePath,
          image,
          {
            contentType:
              image.type,
            cacheControl:
              "3600",
            upsert: false,
          }
        );

      if (uploadError) {
        console.error(
          "Image upload error:",
          uploadError
        );

        return NextResponse.json(
          {
            error:
              "Unable to upload product image.",
          },
          { status: 500 }
        );
      }

      uploadedImagePaths.push(
        filePath
      );

      const {
        data: publicUrlData,
      } =
        supabaseAdmin.storage
          .from("public-image")
          .getPublicUrl(
            filePath
          );

      uploadedImages.push({
        path: filePath,
        publicUrl:
          publicUrlData.publicUrl,
      });
    }

    // First image is the main product image.
    const mainImageUrl =
      uploadedImages.length > 0
        ? uploadedImages[0]
            .publicUrl
        : null;

    // Create product.
    const {
      data: product,
      error: productError,
    } = await supabaseAdmin
      .from("products")
      .insert({
        name,
        slug,
        description,
        brand,
        base_price:
          Number(basePrice),
        sale_price:
          salePrice === ""
            ? null
            : Number(salePrice),
        main_image_url:
          mainImageUrl,
        category_id:
          categoryId || null,
        is_featured:
          isFeatured,
        is_active:
          isActive,
      })
      .select("id")
      .single();

    if (
      productError ||
      !product
    ) {
      console.error(productError);

      if (
        uploadedImagePaths.length > 0
      ) {
        await supabaseAdmin.storage
          .from("public-image")
          .remove(
            uploadedImagePaths
          );
      }

      return NextResponse.json(
        {
          error:
            productError?.message ||
            "Unable to create product.",
        },
        { status: 500 }
      );
    }

    createdProductId =
      product.id;

    // Save all gallery images.
    if (
      uploadedImages.length > 0
    ) {
      const imageRows =
        uploadedImages.map(
          (image, index) => ({
            product_id:
              product.id,
            image_url:
              image.publicUrl,
            sort_order:
              index,
          })
        );

      const {
        error: imageRowsError,
      } =
        await supabaseAdmin
          .from("product_images")
          .insert(
            imageRows
          );

      if (imageRowsError) {
        console.error(
          "Product images error:",
          imageRowsError
        );

        await supabaseAdmin
          .from("products")
          .delete()
          .eq(
            "id",
            product.id
          );

        await supabaseAdmin.storage
          .from("public-image")
          .remove(
            uploadedImagePaths
          );

        return NextResponse.json(
          {
            error:
              imageRowsError.message ||
              "Unable to save product images.",
          },
          { status: 500 }
        );
      }
    }

    // Create variants.
    const variantRows =
      variants.map(
        (variant) => ({
          product_id:
            product.id,
          size:
            variant.size.trim(),
          color:
            variant.color.trim(),
          sku:
            variant.sku.trim(),
          price:
            Number(
              variant.price
            ),
          image_url: null,
          is_active: true,
        })
      );

    const {
      data: createdVariants,
      error: variantError,
    } =
      await supabaseAdmin
        .from("product_variants")
        .insert(
          variantRows
        )
        .select("id");

    if (
      variantError ||
      !createdVariants ||
      createdVariants.length !==
        variants.length
    ) {
      console.error(
        variantError
      );

      await supabaseAdmin
        .from("product_variants")
        .delete()
        .eq(
          "product_id",
          product.id
        );

      await supabaseAdmin
        .from("product_images")
        .delete()
        .eq(
          "product_id",
          product.id
        );

      await supabaseAdmin
        .from("products")
        .delete()
        .eq(
          "id",
          product.id
        );

      if (
        uploadedImagePaths.length > 0
      ) {
        await supabaseAdmin.storage
          .from("public-image")
          .remove(
            uploadedImagePaths
          );
      }

      return NextResponse.json(
        {
          error:
            variantError?.message ||
            "Unable to create variants.",
        },
        { status: 500 }
      );
    }

    // Create inventory.
    const inventoryRows =
      createdVariants.map(
        (
          variant,
          index
        ) => ({
          variant_id:
            variant.id,
          quantity:
            Number(
              variants[index]
                .stock
            ),
          low_stock_threshold: 5,
        })
      );

    const {
      error: inventoryError,
    } =
      await supabaseAdmin
        .from("inventory")
        .insert(
          inventoryRows
        );

    if (inventoryError) {
      console.error(
        inventoryError
      );

      await supabaseAdmin
        .from("inventory")
        .delete()
        .in(
          "variant_id",
          createdVariants.map(
            (variant) =>
              variant.id
          )
        );

      await supabaseAdmin
        .from("product_variants")
        .delete()
        .eq(
          "product_id",
          product.id
        );

      await supabaseAdmin
        .from("product_images")
        .delete()
        .eq(
          "product_id",
          product.id
        );

      await supabaseAdmin
        .from("products")
        .delete()
        .eq(
          "id",
          product.id
        );

      if (
        uploadedImagePaths.length > 0
      ) {
        await supabaseAdmin.storage
          .from("public-image")
          .remove(
            uploadedImagePaths
          );
      }

      return NextResponse.json(
        {
          error:
            inventoryError.message ||
            "Unable to create inventory.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      productId:
        product.id,
      variantCount:
        createdVariants.length,
      imageUrl:
        mainImageUrl,
      imageCount:
        uploadedImages.length,
    });
  } catch (error) {
    console.error(error);

    if (createdProductId) {
      await supabaseAdmin
        .from("inventory")
        .delete()
        .in(
          "variant_id",
          (
            await supabaseAdmin
              .from(
                "product_variants"
              )
              .select("id")
              .eq(
                "product_id",
                createdProductId
              )
          ).data?.map(
            (variant) =>
              variant.id
          ) ?? []
        );

      await supabaseAdmin
        .from("product_variants")
        .delete()
        .eq(
          "product_id",
          createdProductId
        );

      await supabaseAdmin
        .from("product_images")
        .delete()
        .eq(
          "product_id",
          createdProductId
        );

      await supabaseAdmin
        .from("products")
        .delete()
        .eq(
          "id",
          createdProductId
        );
    }

    if (
      uploadedImagePaths.length > 0
    ) {
      await supabaseAdmin.storage
        .from("public-image")
        .remove(
          uploadedImagePaths
        );
    }

    return NextResponse.json(
      {
        error:
          "Unable to create product.",
      },
      { status: 500 }
    );
  }
}