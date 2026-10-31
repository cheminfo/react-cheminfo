import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-UBFJIISL.js";import{n as r,t as i}from"./useT-D4354NT8.js";import{n as a,t as o}from"./StructureExportDialog-CxbgwlX2.js";import{n as s,t as c}from"./OverlayIconButton-Csx6z8t8.js";function l(e){let{label:t,testId:n=`card-structure`,...i}=e,a=r(),[s,l]=(0,u.useState)(!1);return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(c,{icon:`export`,label:t??a(`structure.export.glyph`),active:s,opensMenu:!0,testId:n,onClick:()=>l(!0)}),(0,d.jsx)(o,{...i,isOpen:s,onClose:()=>l(!1)})]})}var u,d;function f(){return(f=e((()=>{u=t(),i(),s(),a(),d=n(),l.__docgenInfo={description:`The glyph beside a figure that hands its one structure over: as a SMILES,
a molfile or an idCode, each copied with a click, or as a picture — the
export dialog, the one the chat opens on its own molecule cards. It is drawn
like the figure's other glyphs, so it sits in the \`tools\` of a \`CardFigure\`
or of any overlay bar.
@param props - The structure, the name of its files, and the glyph's name.
@returns The glyph; the dialog is drawn over the page while it is open.`,methods:[],displayName:`StructureExportButton`,props:{idCode:{required:!1,tsType:{name:`string`},description:`A canonical openchemlib idCode, coordinates included or not.
@default undefined`},coordinates:{required:!1,tsType:{name:`string`},description:`Encoded 2D coordinates, when they did not travel with the idCode.
@default undefined`},molfile:{required:!1,tsType:{name:`string`},description:`A molfile, V2000 or V3000.
@default undefined`},smiles:{required:!1,tsType:{name:`string`},description:`A SMILES.
@default undefined`},name:{required:!1,tsType:{name:`string`},description:`Base name of every file saved from here, extension excluded.
@default 'structure'`},fragment:{required:!1,tsType:{name:`boolean`},description:`Whether the structure is a query fragment, which is what a substructure
filter draws. A fragment's idCode is not a molecule's, so this has to be
said when the notation handed over does not already carry it.
@default false`},notations:{required:!1,tsType:{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'smiles'
| 'molfileV3000'
| 'molfileV2000'
| 'idCode'
| 'noStereoIdCode'
| 'noStereoTautomerIdCode'`,elements:[{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'molfileV3000'`},{name:`literal`,value:`'molfileV2000'`},{name:`literal`,value:`'idCode'`},{name:`literal`,value:`'noStereoIdCode'`},{name:`literal`,value:`'noStereoTautomerIdCode'`}]},{name:`string`}],raw:`Record<StructureNotationKind, string>`}],raw:`Partial<Record<StructureNotationKind, string>>`},description:`Notations the caller wrote itself, shown and saved as they are instead of
the ones OpenChemLib would write from the structure — a drawing program
whose molfile keeps superatoms that a round trip would drop.
@default {}`},label:{required:!1,tsType:{name:`string`},description:`What the glyph is called, for the pointer and for a screen reader.
@default the chrome's own line, \`Copy or save the structure: SMILES,
  molfile\``},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the glyph.\n@default 'card-structure'"}}}})))()}export{f as n,l as t};