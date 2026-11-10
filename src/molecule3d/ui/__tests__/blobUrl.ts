/** The browser's URL, able to name a blob, which the test's DOM cannot. */
export class BlobUrl extends URL {
  static override createObjectURL(): string {
    return 'blob:file';
  }

  static override revokeObjectURL(): void {
    // Nothing was kept alive.
  }
}
