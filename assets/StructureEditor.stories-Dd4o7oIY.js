import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-CFVqFo_y.js";import{n as r,r as i}from"./familyTokens-DsQXXJV4.js";import{a,l as o,s}from"./structureFixtures-CJ3OPkrl.js";import{n as c,t as l}from"./StructureEditor-DXwQCdDL.js";function u(e){let[t,n]=(0,p.useState)(0);return(0,m.jsxs)(`div`,{style:T,children:[(0,m.jsx)(`button`,{type:`button`,style:E,onClick:()=>n(e=>e+1),children:`Reload`}),(0,m.jsx)(l,{...e,revision:t})]})}function d(e){let[t,n]=(0,p.useState)(null);return(0,m.jsxs)(`div`,{style:T,children:[(0,m.jsx)(l,{...e,onChange:n}),t===null?(0,m.jsx)(`p`,{style:D,children:`Draw or edit the structure — its notations appear here.`}):(0,m.jsxs)(`div`,{style:O,children:[t.mode===`molecule`?(0,m.jsx)(f,{label:`Formula, from the molecule`,value:t.molecule.getMolecularFormula().formula}):null,(0,m.jsx)(f,{label:`SMILES`,value:t.smiles}),(0,m.jsx)(f,{label:`idCode`,value:t.idCode}),(0,m.jsx)(f,{label:`Molfile`,value:t.molfile})]})]})}function f(e){return(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`div`,{style:k,children:e.label}),(0,m.jsx)(`pre`,{style:A,children:e.value===``?`—`:e.value})]})}var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{p=t(),c(),i(),o(),m=n(),h={title:`Structure/StructureEditor`,component:l,args:{onChange:()=>{},inputFormat:`smiles`,value:s,debounce:300,minHeight:320,style:{height:380}},argTypes:{fragment:{control:`boolean`},exportable:{control:`boolean`},importable:{control:`boolean`},mode:{control:`inline-radio`,options:[`molecule`,`reaction`]},help:{control:`boolean`},inputFormat:{control:`inline-radio`,options:[`idcode`,`molfile`,`smiles`]},debounce:{control:{type:`range`,min:0,max:1e3,step:50}},minHeight:{control:{type:`range`,min:200,max:640,step:20}},revision:{control:{type:`number`,min:0,step:1}}},parameters:{layout:`padded`,docs:{description:{component:"The canvas structure editor, sized so its toolbar is never clipped. Hovering a toolbar button names it, shows its key and says what it does; the buttons in the corner open a structure file, hand the drawing over — every notation of it and the picture — and open a guide to the keys, which F1 opens too. A molfile, an SDF, a SMILES or an idCode dropped on the canvas, as a file or as text, replaces the drawing. It is uncontrolled: the value is read when the editor appears and again whenever `revision` changes, and an edit is reported once the drawing has been still."}}},render:e=>(0,m.jsx)(d,{...e})},g={},_={args:{inputFormat:`idcode`,value:``}},v={args:{fragment:!0,value:a}},y={args:{help:!1}},b={args:{help:!1,exportable:!1,importable:!1}},x={args:{debounce:0}},S={args:{minHeight:200,style:{}}},C={args:{mode:`reaction`,inputFormat:`idcode`,value:``}},w={args:{minHeight:200,style:{},value:a},render:e=>(0,m.jsx)(u,{...e})},T={display:`grid`,width:`min(52rem, 92vw)`,gap:12},E={padding:`4px 10px`,border:`1px solid ${r.border}`,borderRadius:6,background:r.surface,color:r.text,cursor:`pointer`,fontSize:`0.8125rem`,justifySelf:`start`},D={margin:0,color:r.textMuted,fontSize:`0.8125rem`},O={display:`grid`,gap:10},k={color:r.textMuted,fontSize:`0.6875rem`,fontWeight:700,letterSpacing:`0.04em`,textTransform:`uppercase`},A={overflow:`auto`,maxHeight:`11rem`,padding:`6px 8px`,border:`1px solid ${r.border}`,borderRadius:6,margin:`2px 0 0`,background:r.surfaceSunken,fontFamily:`ui-monospace, SFMono-Regular, Menlo, monospace`,fontSize:`0.75rem`,whiteSpace:`pre`},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source},description:{story:`Draw on the caffeine and watch the three notations follow the canvas.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    inputFormat: 'idcode',
    value: ''
  }
}`,..._.parameters?.docs?.source},description:{story:`A blank canvas, which is what a page asking the visitor to draw opens on.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    fragment: true,
    value: BENZENE
  }
}`,...v.parameters?.docs?.source},description:{story:`Query mode, which is what a substructure filter draws in. Erasing the canvas
here leaves the idCode of the empty fragment rather than an empty string,
which is the case \`isEmptyIdCode\` exists to catch.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    help: false
  }
}`,...y.parameters?.docs?.source},description:{story:`No tooltips and no help button, for a site that explains the editor on a
page of its own. The export button stays: it is not help.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    help: false,
    exportable: false,
    importable: false
  }
}`,...b.parameters?.docs?.source},description:{story:`No button in the corner and no drop, for a page that takes and hands the
structure over its own way.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    debounce: 0
  }
}`,...x.parameters?.docs?.source},description:{story:`Every stroke reported, rather than only the last one of a burst.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    minHeight: 200,
    style: {}
  }
}`,...S.parameters?.docs?.source},description:{story:`A box smaller than the toolbar, which is the case the measured floor exists
for: the toolbar is one canvas of a fixed height, so a container shorter than
it cuts the last buttons off rather than scrolling them.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    mode: 'reaction',
    inputFormat: 'idcode',
    value: ''
  }
}`,...C.parameters?.docs?.source},description:{story:`The reaction canvas, with its own toolbar and its own arrow.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    minHeight: 200,
    style: {},
    value: BENZENE
  },
  render: args => <ReloadDemo {...args} />
}`,...w.parameters?.docs?.source},description:{story:`Reload puts the structure on the canvas again by bumping \`revision\`, which is
what an example, a share link or a Clear button does. The box is measured
again each time, so a reload never leaves the toolbar cut off.`,...w.parameters?.docs?.description}}},j=[`Default`,`Empty`,`Fragment`,`NoHelp`,`NoCornerButtons`,`NoDebounce`,`SmallBox`,`Reaction`,`Reloadable`]})))()}M();export{g as Default,_ as Empty,v as Fragment,b as NoCornerButtons,x as NoDebounce,y as NoHelp,C as Reaction,w as Reloadable,S as SmallBox,j as __namedExportsOrder,h as default};