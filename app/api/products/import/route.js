import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Papa from "papaparse";

// Tamaño del chunk para no romper los límites de Supabase
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
    errors.push(`Fila ${index + 2}: SKU es obligatorio`);
  }
  if (!row.name?.trim()) {
    errors.push(`Fila ${index + 2}: Nombre es obligatorio`);
  }
  if (!row.price || isNaN(Number(row.price))) {
    errors.push(`Fila ${index + 2}: Precio inválido`);
  }

  return errors;
}

async function getOrCreateCategory(name, categoryCache) {
  if (!name?.trim()) return null;

  const normalized = name.trim();

  // Ya lo tenemos en cache
  if (categoryCache.has(normalized)) {
    return categoryCache.get(normalized);
  }

  // Buscar en la base de datos
  const { data: existing } = await supabaseAdmin
    .from("categories")
    .select("id")
    .eq("name", normalized)
    .single();

  if (existing) {
    categoryCache.set(normalized, existing.id);
    return existing.id;
  }

  // Crear la categoría si no existe
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

// Inserta en chunks para no saturar Supabase
async function insertInChunks(products) {
  const results = { inserted: 0, updated: 0, errors: [] };

  for (let i = 0; i < products.length; i += CHUNK_SIZE) {
    const chunk = products.slice(i, i + CHUNK_SIZE);

    const { data, error } = await supabaseAdmin
      .from("products")
      .upsert(chunk, {
        onConflict: "sku", // si el SKU ya existe, actualiza
        ignoreDuplicates: false,
      })
      .select("id");

    if (error) {
      results.errors.push(
        `Chunk ${Math.floor(i / CHUNK_SIZE) + 1}: ${error.message}`,
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
        { error: "No se recibió ningún archivo" },
        { status: 400 },
      );
    }

    const text = await file.text();

    // Parsear CSV
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
        { error: "El archivo está vacío" },
        { status: 400 },
      );
    }

    // Validar todas las filas antes de insertar
    const validationErrors = [];
    rows.forEach((row, index) => {
      const errors = validateRow(row, index);
      validationErrors.push(...errors);
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Errores de validación",
          details: validationErrors.slice(0, 20), // máximo 20 errores para no saturar
          total_errors: validationErrors.length,
        },
        { status: 400 },
      );
    }

    // Cache de categorías para no hacer una query por cada fila
    const categoryCache = new Map();

    // Preparar productos para insertar
    const products = await Promise.all(
      rows.map(async (row) => {
        const categoryId = await getOrCreateCategory(
          row.category,
          categoryCache,
        );

        return {
          sku: row.sku.trim(),
          name: row.name.trim(),
          slug: slugify(row.name.trim()),
          price: Number(row.price),
          compare_price: row.compare_price ? Number(row.compare_price) : null,
          category_id: categoryId,
          brand: row.brand?.trim() || null,
          description: row.description?.trim() || null,
          barcode: row.barcode?.trim() || null,
          unit: row.unit?.trim() || "unidad",
          is_active: row.is_active === "0" ? false : true,
          images: [],
        };
      }),
    );

    // Insertar en chunks
    const results = await insertInChunks(products);

    return NextResponse.json({
      success: true,
      message: `Importación completada`,
      inserted: results.inserted,
      total_rows: rows.length,
      errors: results.errors,
    });
  } catch (error) {
    console.error("Error en importación:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
