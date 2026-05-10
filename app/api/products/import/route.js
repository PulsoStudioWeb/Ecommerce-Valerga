import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import Papa from "papaparse";

const CHUNK_SIZE = 500;

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function validateRow(row, index) {
  const errors = [];

  if (!row.sku?.trim()) {
    errors.push("Fila " + (index + 2) + ": SKU es obligatorio");
  }
  if (!row.nombre?.trim()) {
    errors.push("Fila " + (index + 2) + ": Nombre es obligatorio");
  }
  if (!row.precio || isNaN(Number(row.precio))) {
    errors.push("Fila " + (index + 2) + ": Precio invalido");
  }

  return errors;
}

async function getOrCreateCategory(name, categoryCache) {
  if (!name?.trim()) return null;

  const normalized = name.trim();

  if (categoryCache.has(normalized)) {
    return categoryCache.get(normalized);
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: existing } = await supabaseAdmin
    .from("categories")
    .select("id")
    .eq("name", normalized)
    .single();

  if (existing) {
    categoryCache.set(normalized, existing.id);
    return existing.id;
  }

  const { data: created } = await supabaseAdmin
    .from("categories")
    .insert({ name: normalized, slug: slugify(normalized) })
    .select("id")
    .single();

  if (created) {
    categoryCache.set(normalized, created.id);
    return created.id;
  }

  return null;
}

async function insertInChunks(products) {
  const results = { inserted: 0, updated: 0, errors: [] };
  const supabaseAdmin = getSupabaseAdmin();

  for (let i = 0; i < products.length; i += CHUNK_SIZE) {
    const chunk = products.slice(i, i + CHUNK_SIZE);

    const { data, error } = await supabaseAdmin
      .from("products")
      .upsert(chunk, {
        onConflict: "sku",
        ignoreDuplicates: false,
      })
      .select("id");

    if (error) {
      results.errors.push(
        "Chunk " + (Math.floor(i / CHUNK_SIZE) + 1) + ": " + error.message,
      );
    } else {
      results.inserted += data?.length ?? 0;
    }
  }

  return results;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No se recibio ningun archivo" },
        { status: 400 },
      );
    }

    const text = await file.text();

    const { data: rows, errors: parseErrors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    if (parseErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Error al parsear el CSV",
          details: parseErrors.map((e) => e.message),
        },
        { status: 400 },
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "El archivo esta vacio" },
        { status: 400 },
      );
    }

    const validationErrors = [];
    rows.forEach((row, index) => {
      const errors = validateRow(row, index);
      validationErrors.push(...errors);
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Errores de validacion",
          details: validationErrors.slice(0, 20),
          total_errors: validationErrors.length,
        },
        { status: 400 },
      );
    }

    const categoryCache = new Map();

    const products = await Promise.all(
      rows.map(async (row) => {
        const categoryId = await getOrCreateCategory(
          row.categoria,
          categoryCache,
        );

        return {
          sku: row.sku.trim(),
          name: row.nombre.trim(),
          slug: slugify(row.nombre.trim()),
          price: Number(row.precio),
          compare_price: row.precio_tachado ? Number(row.precio_tachado) : null,
          category_id: categoryId,
          brand: row.marca?.trim() || null,
          description: row.descripcion?.trim() || null,
          barcode: row.codigo_barras?.trim() || null,
          unit: row.unidad?.trim() || "unidad",
          is_active: row.activo === "0" ? false : true,
          images: [],
        };
      }),
    );

    const results = await insertInChunks(products);

    return NextResponse.json({
      success: true,
      message: "Importacion completada",
      inserted: results.inserted,
      total_rows: rows.length,
      errors: results.errors,
    });
  } catch (error) {
    console.error("Error en importacion:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
