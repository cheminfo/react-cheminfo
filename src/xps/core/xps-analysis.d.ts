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

  /**
   * A molecule, as little of one as the prediction actually touches.
   *
   * Declared structurally rather than as `openchemlib`'s `Molecule` so that
   * neither this declaration nor the viewer has to type-depend on a chemistry
   * toolkit it never calls; an OCL molecule satisfies it.
   */
  export interface PredictableMolecule {
    /** The canonical identifier of the molecule. */
    getIDCode: () => string;
    /** How many atoms it has. */
    getAllAtoms: () => number;
    /**
     * The element of one atom.
     * @param atom - Its index.
     * @returns The element symbol.
     */
    getAtomLabel: (atom: number) => string;
  }

  /** A pair of arrays, as the spectrum generator returns one. */
  export interface GeneratedSpectrum {
    /** The abscissa, in eV. */
    x: Float64Array | number[];
    /** The ordinate. */
    y: Float64Array | number[];
  }

  /** What the statistics say about one fragment. */
  export interface HosePrediction {
    /** Which sphere the fragment was matched at. */
    sphere: number;
    /** The five-number summary of the values behind it, in eV. */
    boxplot: {
      min: number;
      q1: number;
      median: number;
      q3: number;
      max: number;
    };
    /** The fragment itself. */
    idCode: string;
    /** How many atoms of the database the summary was built from. */
    nbValues: number;
  }

  /** One predicted line, and the atoms of the query it stands for. */
  export interface HoseGroup {
    /** The fragment at each sphere, largest last. */
    hoses: string[];
    /** The element the line belongs to. */
    atomLabel: string;
    /** Every atom of the query that matched this fragment. */
    atomNumbers: number[];
    /** What the statistics say, absent when no sphere matched. */
    prediction: HosePrediction;
    /** The diastereotopic identifiers to light up on a drawn structure. */
    _highlight: string[];
  }

  /** A predicted line before it is broadened into a spectrum. */
  export interface PredictedPeak {
    /** Where it sits, in eV. */
    x: number;
    /** Its height, `1` for every line the prediction states. */
    y: number;
    /** The spread the service reports, absent from a statistical prediction. */
    standardDeviation?: number;
  }

  /** What a prediction from the database gives back. */
  export interface HosePredictionResult {
    /** One entry per distinct fragment, ordered by binding energy. */
    grouped: HoseGroup[];
    /** The lines broadened into a trace. */
    spectrum: GeneratedSpectrum;
    /** Box-plot annotations, in the shape the old jsGraph chart drew. */
    annotations: unknown[];
    /** The lines themselves. */
    peaks: PredictedPeak[];
  }

  /** What the prediction service gives back. */
  export interface AiPredictionResult {
    /** One line per predicted orbital. */
    peaks: PredictedPeak[];
    /** The lines broadened into a trace. */
    spectrum: GeneratedSpectrum;
    /** The optimised geometry, as an XYZ block. */
    xyz: string;
  }

  /**
   * How a set of lines is turned into a trace.
   *
   * The grid lives under `generator` rather than at the top level, which is
   * easy to get wrong: options written flat are silently ignored and the
   * spectrum comes back over the generator's default window of 0 to 1000 eV in
   * 10 001 points, which looks like a working trace until it is read.
   */
  export interface GenerateSpectrumOptions {
    /** The window to generate over, how finely, and how wide each line is. */
    generator?: {
      /** First x value. */
      from?: number;
      /** Last x value. */
      to?: number;
      /** How many points. */
      nbPoints?: number;
      /**
       * The width of a line at a given position.
       * @param x - Where the line sits.
       * @returns Its full width at half maximum.
       */
      peakWidthFct?: (x: number) => number;
      /** The shape each line is broadened with. */
      shape?: { kind?: string; [key: string]: unknown };
    };
    /** The lowest intensity kept. */
    threshold?: number;
  }

  /** How a prediction from the database is run. */
  export interface PredictUsingHoseCodesOptions {
    /**
     * Which computed quantity to predict.
     * @default 'gw'
     */
    statsKey?: string;
    /**
     * Whether to correct the gas-phase values to a solid reference.
     * @default 'solid'
     */
    energyReference?: 'solid' | 'none';
    /**
     * Restrict the prediction to the atoms carrying this map number.
     * @default undefined
     */
    atomMapNo?: number;
    /**
     * How the lines are broadened.
     * @default undefined
     */
    spectrum?: GenerateSpectrumOptions;
    /**
     * The statistics to predict against, `{ spheres: { … } }`. Supplying them
     * skips the reader's own download from `data.cheminfo.org`, which is what
     * lets a page hold the database itself.
     * @default undefined
     */
    data?: unknown;
  }

  /** How a prediction from the service is run. */
  export interface PredictUsingAiOptions {
    /**
     * Whether the service corrects to a solid reference.
     * @default 'solid'
     */
    energyReference?: 'solid' | 'none';
    /**
     * How the lines are broadened.
     * @default undefined
     */
    spectrum?: GenerateSpectrumOptions;
  }

  /**
   * Predict a spectrum from the fragment statistics of a database.
   * @param molecule - The structure to predict.
   * @param options - Which quantity, how broadened, and what to predict against.
   * @returns The lines, the trace, and the fragment behind each line.
   */
  export function predictUsingHoseCodes(
    molecule: PredictableMolecule,
    options?: PredictUsingHoseCodesOptions,
  ): Promise<HosePredictionResult>;

  /**
   * Predict a spectrum with the xTB and machine-learning service.
   * @param molecule - The structure to predict.
   * @param options - How the lines are broadened.
   * @returns The lines, the trace, and the optimised geometry.
   */
  export function predictUsingAI(
    molecule: PredictableMolecule,
    options?: PredictUsingAiOptions,
  ): Promise<AiPredictionResult>;

  /**
   * Predict the spectrum of the repeating unit of a polymer.
   * @param monomer - The monomer, with its two attachment points.
   * @param options - As for a prediction from the database.
   * @returns The prediction, for the middle unit alone.
   */
  export function predictPolymer(
    monomer: PredictableMolecule,
    options?: PredictUsingHoseCodesOptions,
  ): Promise<HosePredictionResult>;

  /** A named set of spectra, as the polymer database stores them. */
  export interface ManagedAnalysis {
    /** Identity inside the manager. */
    id: string;
    /** What it is called. */
    label: string;
    /** The blocks it holds. */
    spectra: AnalysisSpectrum[];
  }

  /** A library of analyses, restored from the JSON one was serialised to. */
  export class AnalysesManager {
    /**
     * Restore a library from its serialised form.
     * @param json - The library as it was written out.
     * @returns The manager.
     */
    static fromJSON: (json: unknown) => AnalysesManager;
    /** The analyses it holds. */
    analyses: ManagedAnalysis[];
    /**
     * Every spectrum of every analysis.
     * @param options - Reserved by the manager; not used here.
     * @returns The blocks.
     */
    getSpectra: (options?: unknown) => AnalysisSpectrum[];
    /**
     * The analyses matching a selection.
     * @param options - Which analyses to return.
     * @returns The analyses.
     */
    getAnalyses: (options?: { ids?: string[] }) => ManagedAnalysis[];
  }
}
