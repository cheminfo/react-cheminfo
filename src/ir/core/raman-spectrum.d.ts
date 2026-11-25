/**
 * Types for `raman-spectrum`, which is written in JavaScript and ships none.
 *
 * Only the two readers this package calls are declared, and each returns the
 * one field read off it: its `spectra`. Not its `Analysis` class, which comes
 * from the copy of `common-spectrum` that `raman-spectrum` depends on — a copy
 * that need not be the one `ir-spectrum` brings, so the two classes are not
 * the same type at run time even when they share a name.
 */
declare module 'raman-spectrum' {
  import type { MeasurementXY } from 'cheminfo-types';

  /** What a reader built: one spectrum per block of the file. */
  export interface RamanAnalysis {
    /** The spectra, in the order the file wrote them. */
    spectra: MeasurementXY[];
  }

  /**
   * Read a Thermo Galactic SPC file as Raman: every subfile is typed `Raman`
   * whatever the header says, and keeps its own `x` and `y`.
   * @param data - The file, as bytes.
   * @returns One spectrum per subfile.
   */
  export function fromSPC(data: ArrayBuffer | Uint8Array): RamanAnalysis;

  /**
   * Read a Renishaw WDF file. A map holds one spectrum per point, each carrying
   * its position in `meta`.
   * @param data - The file, as bytes.
   * @returns One spectrum per point.
   */
  export function fromWDF(data: ArrayBuffer | Uint8Array): RamanAnalysis;
}
