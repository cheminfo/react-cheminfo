/** The columns of the little table the delimited stories hand over. */
export const MOLECULE_TABLE_HEADER: readonly string[] = [
  'name',
  'formula',
  'monoisotopic mass',
  'note',
];

/**
 * Five real compounds, and the cells that make the escaping visible: a name
 * holding commas (`2,4-D`), a note holding a semicolon, and two notes holding
 * quotes. Written with a tab only the quoted notes have to be escaped, their
 * inner quotes doubled; switch the separator to a comma or a semicolon and the
 * cells carrying that character are quoted too.
 */
export const MOLECULE_TABLE_ROWS: ReadonlyArray<readonly string[]> = [
  ['caffeine', 'C8H10N4O2', '194.08038', 'the stimulant of coffee and tea'],
  ['aspirin', 'C9H8O4', '180.04226', 'sold as "Aspirin", a Bayer trademark'],
  [
    '2,4-D',
    'C8H6Cl2O3',
    '219.96940',
    'herbicide; short for 2,4-dichlorophenoxyacetic acid',
  ],
  ['vanillin', 'C8H8O3', '152.04734', 'what vanilla smells of'],
  [
    'paracetamol',
    'C8H9NO2',
    '151.06333',
    'called "acetaminophen" in the United States',
  ],
];
