// ============================================================================
// Centralized Image Resolver
// ============================================================================
// Supports both legacy buckets and new consolidated bucket structure
// 
// Legacy buckets: product-images, barber-photos, service-images, site-images
// New buckets: luxecut-public, luxecut-photos, luxecut-admin
// ============================================================================

// Bucket type definition - supports both legacy and new naming
export type LegacyBucket = 'product-images' | 'barber-photos' | 'service-images' | 'site-images';
export type NewBucket = 'luxecut-public' | 'luxecut-photos' | 'luxecut-admin';
export type StorageBucket = LegacyBucket | NewBucket;

// Mapping from legacy to new bucket structure (for future migration)
const BUCKET_MIGRATION_MAP: Record<LegacyBucket, { bucket: NewBucket; folder: string }> = {
  'product-images': { bucket: 'luxecut-public', folder: 'products' },
  'service-images': { bucket: 'luxecut-public', folder: 'services' },
  'barber-photos': { bucket: 'luxecut-photos', folder: '' },
  'site-images': { bucket: 'luxecut-public', folder: 'site' },
};

/**
 * Resolve an image URL from either a full URL or a storage path
 * Supports both legacy and new bucket structures
 */
export function resolveImageUrl(opts: {
  url?: string | null;
  path?: string | null;
  bucket: StorageBucket;
}): string {
  const { url, path, bucket } = opts;

  // If it's already a full URL, return as-is
  if (url && /^https?:\/\//i.test(url)) return url;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl || !path) return '';

  // Build the storage URL
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Resolve barber photo - checks multiple possible fields
 */
export function resolveBarberPhoto(barber: any): string {
  if (!barber) return getDefaultBarberPhoto();

  // Priority order: direct photo URL > stored path > default
  const directPhoto = barber.photo || barber.avatar_url;
  if (directPhoto && /^https?:\/\//i.test(directPhoto)) return directPhoto;

  // Try resolving from path with appropriate bucket
  const bucket = barber.storage_bucket || 'barber-photos';
  const resolved = resolveImageUrl({
    url: barber.photo,
    path: barber.photo_path,
    bucket: bucket as StorageBucket
  });

  return resolved || getDefaultBarberPhoto();
}

/**
 * Resolve product image - checks multiple possible fields
 */
export function resolveProductImage(product: any): string {
  if (!product) return '/default-product.png';

  // Priority order: imageUrl > imageurl (lowercase) > path resolution > default
  const directImage = product.imageUrl || product.imageurl || product.image_url;
  if (directImage && /^https?:\/\//i.test(directImage)) return directImage;

  // Try resolving from path with appropriate bucket
  const bucket = product.storage_bucket || 'product-images';
  const resolved = resolveImageUrl({
    url: directImage,
    path: product.image_path,
    bucket: bucket as StorageBucket
  });

  return resolved || '/default-product.png';
}

/**
 * Resolve service image - checks multiple possible fields
 */
export function resolveServiceImage(service: any): string {
  if (!service) return '';

  // Priority order: imageUrl > imageurl (lowercase) > path resolution
  const directImage = service.imageUrl || service.imageurl || service.image_url;
  if (directImage && /^https?:\/\//i.test(directImage)) return directImage;

  // Try resolving from path with appropriate bucket
  const bucket = service.storage_bucket || 'service-images';
  const resolved = resolveImageUrl({
    url: directImage,
    path: service.image_path,
    bucket: bucket as StorageBucket
  });

  return resolved || '';
}

/**
 * Get the new bucket location for a legacy bucket (for uploads)
 * This helps with gradual migration to new bucket structure
 */
export function getNewBucketPath(legacyBucket: LegacyBucket, filename: string): { bucket: NewBucket; path: string } {
  const mapping = BUCKET_MIGRATION_MAP[legacyBucket];
  const folder = mapping.folder ? `${mapping.folder}/` : '';
  return {
    bucket: mapping.bucket,
    path: `${folder}${filename}`
  };
}

// Default fallback images
function getDefaultBarberPhoto(): string {
  return 'https://images.unsplash.com/photo-1580905400738-25e359a8492c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
}
