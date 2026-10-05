import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-B0AZ9GiM.js";import{n as r,r as i}from"./buttons-B0DwqJUy.js";import{n as a,r as o}from"./familyTokens-DsQXXJV4.js";import{n as s,t as c}from"./StructureExportDialog-ColuBdLI.js";import{c as l,n as u,o as d,t as f}from"./structureFixtures-JUAU2ivx.js";function p(e){let[t,n]=(0,m.useState)(e.isOpen),[i,a]=(0,m.useState)(e.isOpen);return i!==e.isOpen&&(a(e.isOpen),n(e.isOpen)),(0,h.jsxs)(`div`,{style:S,children:[(0,h.jsx)(r,{icon:`export`,text:`Export the structure`,onClick:()=>n(!0)}),(0,h.jsx)(c,{...e,isOpen:t,onClose:()=>n(!1)})]})}var m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{i(),m=t(),s(),o(),l(),h=n(),g={title:`Structure/StructureExportDialog`,component:c,args:{isOpen:!0,smiles:d,name:`caffeine`,onClose:()=>{}},argTypes:{isOpen:{control:`boolean`},name:{control:`text`},fragment:{control:`boolean`}},parameters:{layout:`padded`,docs:{description:{component:"Every notation of a structure and the picture of it, side by side: the SMILES and the two molfiles first, with the canonical identifiers folded away under them. A value is copied by clicking it, a molfile is also saved as a file, and the picture leaves as an SVG or as a PNG at the resolution picked. The same dialog opens from the button in the corner of `StructureEditor`."}}},render:e=>(0,h.jsx)(p,{...e})},_={},v={args:{smiles:u,name:`alanine`}},y={args:{smiles:f,name:`acetone`}},b={args:{smiles:``,name:`structure`}},x={args:{smiles:`C1CCCCC`,name:`structure`}},S={display:`grid`,justifyItems:`start`,color:a.text,gap:12},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{}`,..._.parameters?.docs?.source},description:{story:`Caffeine: no stereocentre, so its three identifiers only differ by tautomer.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    smiles: ALANINE,
    name: 'alanine'
  }
}`,...v.parameters?.docs?.source},description:{story:`(S)-alanine. Dropping the stereochemistry gives the identifier its
enantiomer shares, which is what a search for a record drawn flat keys on —
open the folded section to compare the three.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    smiles: ACETONE_ENOL,
    name: 'acetone'
  }
}`,...y.parameters?.docs?.source},description:{story:`Acetone drawn as its enol. The tautomer identifier is the one the ketone
also gives, so a database keyed on it finds either drawing.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    smiles: '',
    name: 'structure'
  }
}`,...b.parameters?.docs?.source},description:{story:`A canvas nobody has drawn on yet, which the dialog says rather than guesses.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    smiles: 'C1CCCCC',
    name: 'structure'
  }
}`,...x.parameters?.docs?.source},description:{story:`A notation openchemlib refuses, which is what a pasted name or a ring that
never closes is.`,...x.parameters?.docs?.description}}},C=[`Default`,`Stereocentre`,`Tautomer`,`Nothing`,`Unreadable`]})))()}w();export{_ as Default,b as Nothing,v as Stereocentre,y as Tautomer,x as Unreadable,C as __namedExportsOrder,g as default};