import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-CuWlRz6M.js";import{n,t as r}from"./structureSource-DwNACzj-.js";import{n as i,t as a}from"./Structure-CZLRJYZ4.js";import{n as o,t as s}from"./OverlayLayer-Db6Ro_Ez.js";import{r as c,t as l}from"./cardFixtures-_1U6o2xc.js";import{n as u,t as d}from"./StructureExportButton-CKBqkyNy.js";import{c as f,l as p,s as m}from"./structureFixtures-CJ3OPkrl.js";function h(e){let{name:t,fragment:r,label:i,children:o,...c}=e,{idCode:l,coordinates:u,molfile:f,smiles:p}=c,m=o??(0,g.jsx)(a,{...c});return n({idCode:l,coordinates:u,molfile:f,smiles:p}).kind===`empty`?(0,g.jsx)(g.Fragment,{children:m}):(0,g.jsxs)(`div`,{className:`card-figure card-structure`,children:[(0,g.jsx)(`div`,{className:`card-figure__drawing`,children:m}),(0,g.jsx)(s,{density:`compact`,awake:!0,children:(0,g.jsx)(`div`,{className:`card-figure__tools`,"data-testid":`figure-tools`,children:(0,g.jsx)(d,{idCode:l,coordinates:u,molfile:f,smiles:p,name:t,fragment:r,label:i})})})]})}var g;function _(){return(_=e((()=>{o(),r(),i(),u(),g=t(),h.__docgenInfo={description:`A structure of a card, with the glyph that hands it over: the export
dialog, which copies it as an SVG or a PNG, a SMILES or a molfile, V2000 or
V3000. Every structure an answer draws carries it, alone or in a grid, so
none has to be redrawn to be reused.

The glyph stands beside the top right corner, faded until the structure is
pointed at, as the glyphs of \`CardFigure\` (\`react-cheminfo/card\`) do;
\`styles/card.css\` draws both. A structure with nothing to read draws its
placeholder alone.
@param props - The structure, its size, and the name of its files.
@returns The structure and its glyph.`,methods:[],displayName:`CardStructure`,props:{idCode:{required:!1,tsType:{name:`string`},description:`A canonical openchemlib idCode, coordinates included or not. The most
exact notation, so it is drawn in preference to the others.
@default undefined`},coordinates:{required:!1,tsType:{name:`string`},description:`Encoded 2D coordinates, when they did not travel with the idCode.
@default undefined`},molfile:{required:!1,tsType:{name:`string`},description:`A molfile, V2000 or V3000, drawn when there is no usable idCode.
@default undefined`},smiles:{required:!1,tsType:{name:`string`},description:`A SMILES, drawn when there is neither an idCode nor a molfile. The layout
is invented, so two depictions of the same molecule may differ.
@default undefined`},width:{required:!1,tsType:{name:`number`},description:`Width of the picture, in pixels.
@default 200`},height:{required:!1,tsType:{name:`number`},description:`Height of the picture, in pixels.
@default 140`},labels:{required:!1,tsType:{name:`StructureLabels`},description:`What is written on the picture besides the structure itself.
@default {}`},atomLabels:{required:!1,tsType:{name:`ReadonlyMap`,elements:[{name:`number`},{name:`string`}],raw:`ReadonlyMap<number, string>`},description:`Text of the caller's own written on atoms — ring numbers, canonical
numbers, an assignment — keyed by atom index as openchemlib counts atoms,
from 0. An empty text, or an index the structure has no atom at, writes
nothing.
@default undefined`},atomLabelPlacement:{required:!1,tsType:{name:`union`,raw:`'beside' | 'instead'`,elements:[{name:`literal`,value:`'beside'`},{name:`literal`,value:`'instead'`}]},description:`Where the \`atomLabels\` go: beside each element symbol, as a small
superscript, or in place of it.
@default 'beside'`},autoCrop:{required:!1,tsType:{name:`boolean`},description:`Crop the picture to the atoms rather than centring them in the box.
@default true`},autoCropMargin:{required:!1,tsType:{name:`number`},description:`Blank space kept around the structure when it is cropped, in pixels.
@default 4`},atomHighlight:{required:!1,tsType:{name:`Array`,elements:[{name:`number`}],raw:`number[]`},description:`Atoms to paint, which is how a substructure match is shown.
@default undefined`},atomHighlightColor:{required:!1,tsType:{name:`string`},description:`The colour the highlighted atoms are painted.
@default '#a5d8ff'`},bondHighlight:{required:!1,tsType:{name:`Array`,elements:[{name:`number`}],raw:`number[]`},description:`Bonds to paint.
@default undefined`},bondHighlightColor:{required:!1,tsType:{name:`string`},description:`The colour the highlighted bonds are painted.
@default '#ffd8a8'`},substructure:{required:!1,tsType:{name:`string`},description:"A query fragment, as an openchemlib idCode, whose every match is painted —\natoms and bonds alike, so the hit reads as one shape. When set, it takes\nthe place of `atomHighlight` and `bondHighlight`.\n@default undefined"},substructureColor:{required:!1,tsType:{name:`string`},description:"The colour the `substructure` match is painted.\n@default '#ffd500'"},substructureOpacity:{required:!1,tsType:{name:`number`},description:`How opaque the \`substructure\` match is painted, from 0 to 1. Light, so the
bonds and the atom labels under it stay legible.
@default 0.15`},onAtomClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(atom: number) => void`,signature:{arguments:[{type:{name:`number`},name:`atom`}],return:{name:`void`}}},description:`Called with the index of the atom that was clicked, counted from 0 as
openchemlib counts atoms.
@default undefined`},onBondClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(bond: number) => void`,signature:{arguments:[{type:{name:`number`},name:`bond`}],return:{name:`void`}}},description:`Called with the index of the bond that was clicked, counted from 0.
@default undefined`},fallback:{required:!1,tsType:{name:`ReactNode`},description:`What is shown when there is no structure, or when the one supplied cannot
be read. An em dash rather than a red box: a missing structure is a row of
a table far more often than it is a bug worth shouting about.
@default '—'`},name:{required:!1,tsType:{name:`string`},description:`Base name of every file saved from the export, extension excluded.
@default 'structure'`},fragment:{required:!1,tsType:{name:`boolean`},description:`Whether the structure is a query fragment, such as a toxicophore, whose
idCode is not a molecule's.
@default false`},label:{required:!1,tsType:{name:`string`},description:`What the glyph is called, for the pointer and for a screen reader.
@default the chrome's own line, \`Copy or save the structure: SMILES,
  molfile\``},children:{required:!1,tsType:{name:`ReactNode`},description:`The drawing, when the site draws the structure itself — its own
highlights, its own numbering. The export still reads the notations.
@default a \`Structure\` drawn from the same notations, at the same size`}}}})))()}var v,y,b,x,S;function C(){return(C=e((()=>{_(),c(),p(),v=t(),y={title:`Card/CardStructure`,component:h,args:{smiles:m,name:`caffeine`,width:240,height:160},argTypes:{name:{control:`text`},label:{control:`text`},fragment:{control:`boolean`}},parameters:{layout:`fullscreen`,docs:{description:{component:`A structure of a card with the glyph that hands it over: the export dialog, which copies it as an SVG or a PNG, a SMILES or a molfile. The glyph stands beside the top right corner and fades until the structure is pointed at.`}}},render:e=>(0,v.jsx)(l,{children:(0,v.jsx)(`div`,{className:`card`,children:(0,v.jsx)(h,{...e})})})},b={},x={render:()=>(0,v.jsx)(l,{children:(0,v.jsx)(`div`,{className:`card`,style:{display:`flex`,flexWrap:`wrap`,gap:12},children:f.map(({name:e,smiles:t})=>(0,v.jsx)(h,{smiles:t,name:e,width:140,height:100},e))})})},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{}`,...b.parameters?.docs?.source},description:{story:`One structure: point at it, press the glyph, and copy it.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <ChatFrame>
      <div className="card" style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12
    }}>
        {DEMO_MOLECULES.map(({
        name,
        smiles
      }) => <CardStructure key={name} smiles={smiles} name={name} width={140} height={100} />)}
      </div>
    </ChatFrame>
}`,...x.parameters?.docs?.source},description:{story:`A grid, where every structure carries its own glyph.`,...x.parameters?.docs?.description}}},S=[`Default`,`Grid`]})))()}C();export{b as Default,x as Grid,S as __namedExportsOrder,y as default};