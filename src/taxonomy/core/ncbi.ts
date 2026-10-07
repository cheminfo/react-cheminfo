/**
 * The page of a taxon in the NCBI Taxonomy Browser.
 * @param taxId - The NCBI Taxonomy id.
 * @returns Its address, e.g.
 * `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=5076`.
 */
export function ncbiTaxonomyUrl(taxId: number): string {
  return `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${encodeURIComponent(String(taxId))}`;
}
