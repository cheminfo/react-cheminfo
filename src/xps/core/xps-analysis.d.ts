/**
 * Types for `xps-analysis`, which is written in JavaScript and ships none.
 *
 * Only what this package actually calls is declared, and each shape was read
 * off the real output rather than off the JSDoc: the VAMAS reader states peak
 * positions in kinetic energy and hands back a plain `number[]` for the
 * ordinates, and both of those are the kind of fact a hand-written declaration
 * exists to pin down.
 *
 * Everything the reader can leave out is optional here. A VAMAS block written
 * without CASA information carries no components and no regions, a file that
 * does not know its source writes a characteristic energy of zero, and a
 * background the file did not parameterise has none of the bounds below.
 */
declare module 'xps-analysis' {
  /** A quantity as the reader wraps it. */
  export interface ValueUnits {
    /** The number itself. */
    value: number;
    /** The unit it is in, almost always `eV`. */
    units: string;
  }

  /** A fit parameter, with whatever bounds the fit was run under. */
  export interface FitParameter {
    /** The fitted value. */
    value: number;
    /** The lower bound the optimiser was held to. */
    lowerBound?: number;
    /** The upper bound the optimiser was held to. */
    upperBound?: number;
    /** How the parameter was tied to another component's. */
    constrain?: {
      /** Index of the component it follows. */
      linkedComponent?: number;
      /** The multiple of that component it is held at. */
      factor?: number;
      /** The offset in eV it is held at. */
      shift?: number;
    };
  }

  /** One peak of a CASA fit, as the block comment states it. */
  export interface CasaComponent {
    /** What the fit calls it: `C 1s 1`, `Mo 3d MoS2 2H`. */
    componentID: string;
    /** The peak shape, with whatever parameters it takes. */
    shape?: { kind: string; options?: Record<string, number> };
    /** Area under the component, in the file's own units. */
    area: FitParameter;
    /** Full width at half maximum in eV. */
    fwhm: FitParameter;
    /** Where it sits, in **kinetic** energy. */
    position: FitParameter;
    /** The factor its area is divided by to get a composition. */
    relativeSensitivityFactor?: number;
    /** The same factor before any correction the file applied. */
    uncorrectedRSF?: number;
    /** Atomic mass the file states for the element. */
    atomicMass?: number;
    /** Which fit group it belongs to, `-1` for none. */
    groupIndex?: number;
    /** Its position on the kinetic axis. */
    kineticEnergy: ValueUnits;
    /** Its position on the binding axis, already converted. */
    bindingEnergy: ValueUnits;
    /** What it is taken to be; the component identifier again. */
    assignment: string;
  }

  /** A window of the spectrum with a background under it. */
  export interface CasaRegion {
    /** What the file calls it, usually the transition. */
    regionID: string;
    /** What the file states about the element the region is of. */
    block?: {
      /** The region identifier again. */
      regionBlockID?: string;
      /** Atomic mass of the element. */
      atomicMass?: number;
      /** The factor an area inside it is divided by. */
      relativeSensitivityFactor?: number;
    };
    /** How the background under it is drawn, absent when unparameterised. */
    background?: {
      /** `Shirley`, `Linear`, `Tougaard`. */
      type: string;
      /** The bounds and coefficients the background was drawn with. */
      parameters?: {
        /** Lower bound on the kinetic axis. */
        kineticEnergyStart?: ValueUnits;
        /** Upper bound on the kinetic axis. */
        kineticEnergyEnd?: ValueUnits;
        /** The kinetic start converted; the **higher** of the two. */
        bindingEnergyStart?: ValueUnits;
        /** The kinetic end converted; the **lower** of the two. */
        bindingEnergyEnd?: ValueUnits;
        /** The factor an area inside it is divided by. */
        relativeSensitivityFactor?: number;
        /** How many points at each end the endpoints are averaged over. */
        averageWidth?: number;
        /** Offset applied at the low end. */
        startOffset?: number;
        /** Offset applied at the high end. */
        endOffset?: number;
        /** Tougaard cross-section coefficients. */
        crossSection?: number[];
      };
      /** The parameter line exactly as the file wrote it. */
      rawParameters?: string;
    };
  }

  /** The block identifier, read as a core level and as an Auger transition. */
  export interface NormalisedRegion {
    /** The block identifier as written. */
    name: string;
    /** The core level, every field `null` when the name is not one. */
    orbital: {
      element: string | null;
      shell: number | null;
      angularMomentum: string | null;
    };
    /** The Auger line, every field `null` when the name is not one. */
    auger: { element: string | null; transition: string | null };
  }

  /** What the reader makes of a block's records. */
  export interface NormalisedMeta {
    /** The core level the block was scanned over. */
    region: NormalisedRegion;
    /** Which axis the block states, and in what unit. */
    energyType: { kind: 'binding' | 'kinetic' | string; units: string };
    /** The X-ray source. `characteristicEnergy.value` is `0` when unknown. */
    analysisSource: {
      label: string;
      characteristicEnergy: ValueUnits;
      beamWidthX: ValueUnits;
      beamWidthY: ValueUnits;
    };
    /** The species the block is of, as the file names it. */
    speciesLabel: string;
    /** The peaks the block was fitted with, empty when it carries no fit. */
    components: CasaComponent[];
    /** The windows the block defines a background under. */
    regions: CasaRegion[];
    /** The first abscissa value, in the block's own convention. */
    from: number;
    /** The last abscissa value, in the block's own convention. */
    to: number;
    /** `FAT`, `FRR`. */
    analyserMode: string;
  }

  /** One axis of a block. */
  export interface AnalysisVariable {
    /**
     * The values. `Float64Array` on the energy axes; the ordinates come back as
     * a plain array and are converted on the way in.
     */
    data: Float64Array | number[];
    /** What the axis is: `Binding energy`, `Kinetic energy`, `Counts`. */
    label: string;
    /** The unit, absent on the ordinates. */
    units?: string;
    /** Whether the axis is the one the block was stepped along. */
    type?: string;
  }

  /** One VAMAS block once it has been read. */
  export interface AnalysisSpectrum {
    /**
     * The axes. `x` is binding energy when the reader could convert and the
     * file's own abscissa otherwise; `k` is present only when a conversion
     * happened.
     */
    variables: {
      x: AnalysisVariable;
      y: AnalysisVariable;
      k?: AnalysisVariable;
    };
    /** The experiment identifier or the sample name. */
    title?: string;
    /** What kind of measurement it is; always `XPS` from this reader. */
    dataType?: string;
    /**
     * The flat VAMAS record, keyed by the standard's own field names, plus the
     * normalised view under `cheminfo.meta`.
     */
    meta: Record<string, unknown> & {
      cheminfo: { meta: NormalisedMeta };
    };
  }

  /** A file once it has been read: one entry per block. */
  export interface Analysis {
    /** The blocks, in file order. */
    spectra: AnalysisSpectrum[];
    /**
     * The blocks, in file order.
     * @param options - Reserved by the reader; not used here.
     * @returns The blocks.
     */
    getSpectra: (options?: unknown) => AnalysisSpectrum[];
  }

  /** One reference core-level binding energy. */
  export interface XpsReference {
    /** Element symbol. */
    element: string;
    /** The level: `1s`, `2p3/2`, `4f7/2`. */
    orbital: string;
    /** Its binding energy in eV. */
    be: number;
  }

  /**
   * Read a VAMAS file.
   * @param text - The file, as bytes or as text.
   * @returns One entry per block.
   */
  export function fromVamas(text: ArrayBuffer | Uint8Array | string): Analysis;

  /**
   * Read a JCAMP-DX file.
   * @param text - The file, as bytes or as text.
   * @returns One entry per block.
   */
  export function fromJcamp(text: ArrayBuffer | Uint8Array | string): Analysis;

  /**
   * The reference binding energies of every core level, 2368 of them.
   */
  export const references: XpsReference[];
}
