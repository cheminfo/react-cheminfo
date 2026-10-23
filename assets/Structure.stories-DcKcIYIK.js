import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-4Zysk6mk.js";import{n as r,r as i}from"./familyTokens-DsQXXJV4.js";import{n as a,t as o}from"./Structure-BMRHteT3.js";import{c as s,i as c,o as l,r as u,s as d}from"./structureFixtures-JUAU2ivx.js";function f(e){let t=new Map;for(let n=0;n<e;n++)t.set(n,String(n+1));return t}function p(e){let[t,n]=(0,h.useState)(null);return(0,g.jsx)(m,{caption:t===null?`click an atom`:`atom ${t}`,children:(0,g.jsx)(o,{...e,atomHighlight:t===null?void 0:[t],onAtomClick:n})})}function m(e){return(0,g.jsxs)(`figure`,{style:k,children:[e.children,(0,g.jsx)(`figcaption`,{style:A,children:e.caption})]})}var h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{h=t(),a(),i(),s(),g=n(),_=[{width:110,height:80},{width:200,height:150},{width:320,height:240}],v=[{caption:`a name, not a notation`,smiles:`benzene`},{caption:`a ring that never closes`,smiles:`C1CCCCC`},{caption:`a molfile with no atoms`,molfile:`
OCL MolfileCreator  2D

  0  0  0  0  0  0  0  0  0  0999 V2000
M  END
`},{caption:`nothing at all`}],y={title:`Structure/Structure`,component:o,args:{smiles:l,width:220,height:160},argTypes:{width:{control:{type:`range`,min:80,max:480,step:10}},height:{control:{type:`range`,min:60,max:360,step:10}},autoCrop:{control:`boolean`},autoCropMargin:{control:{type:`range`,min:0,max:40,step:2}}},parameters:{docs:{description:{component:`A read-only depiction, drawn from whichever notation the caller has — an idCode, a molfile or a SMILES — and never a broken box when there is none.`}}}},b={},x={parameters:{layout:`padded`},render:e=>(0,g.jsx)(`div`,{style:O,children:d.map(t=>(0,g.jsx)(o,{...e,autoCrop:!1,smiles:t.smiles,labels:{caption:t.name}},t.name))})},S={parameters:{layout:`padded`},render:e=>(0,g.jsx)(`div`,{style:O,children:_.map(t=>(0,g.jsx)(o,{...e,autoCrop:!1,width:t.width,height:t.height},t.width))})},C={parameters:{layout:`padded`},render:e=>(0,g.jsx)(`div`,{style:O,children:v.map(t=>(0,g.jsx)(m,{caption:t.caption,children:(0,g.jsx)(o,{...e,smiles:t.smiles,molfile:t.molfile,fallback:`no structure`})},t.caption))})},w={args:{width:260,height:200,autoCrop:!1,labels:{atoms:!0,bonds:!0,caption:`caffeine`}}},T={args:{smiles:u,width:280,height:200,autoCrop:!1,atomHighlight:c,labels:{caption:`acetyl`}}},E={args:{width:260,height:200,autoCrop:!1,atomLabels:f(14)}},D={args:{smiles:u,width:280,height:200,autoCrop:!1},render:e=>(0,g.jsx)(p,{...e})},O={display:`flex`,flexWrap:`wrap`,alignItems:`flex-end`,gap:16},k={display:`flex`,flexDirection:`column`,alignItems:`center`,padding:0,border:`1px dashed ${r.borderStrong}`,borderRadius:r.radius,margin:0,gap:4},A={padding:`0 8px 6px`,color:r.textMuted,fontSize:`0.75rem`},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {DEMO_MOLECULES.map(molecule => <Structure key={molecule.name} {...args} autoCrop={false} smiles={molecule.smiles} labels={{
      caption: molecule.name
    }} />)}
    </div>
}`,...x.parameters?.docs?.source},description:{story:`Three molecules the sites show, each named inside its own picture.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {SIZES.map(size => <Structure key={size.width} {...args} autoCrop={false} width={size.width} height={size.height} />)}
    </div>
}`,...S.parameters?.docs?.source},description:{story:`The same molecule from a table row up to a panel of its own. Cropping is off
here, because a cropped picture keeps the atoms at the size the notation
lays them out and so barely follows the box it is given.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {UNREADABLE.map(entry => <Figure key={entry.caption} caption={entry.caption}>
          <Structure {...args} smiles={entry.smiles} molfile={entry.molfile} fallback="no structure" />
        </Figure>)}
    </div>
}`,...C.parameters?.docs?.source},description:{story:`What a page gets when the notation is wrong, empty, or simply absent: the
same quiet placeholder at the size of the picture that would have been
drawn, so a list of structures keeps its rhythm instead of gaining a red box.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    width: 260,
    height: 200,
    autoCrop: false,
    labels: {
      atoms: true,
      bonds: true,
      caption: 'caffeine'
    }
  }
}`,...w.parameters?.docs?.source},description:{story:`Atom and bond indices written on the picture, which is what turns a
depiction into something an assignment or a highlight can point at.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    smiles: ASPIRIN,
    width: 280,
    height: 200,
    autoCrop: false,
    atomHighlight: ASPIRIN_ACETYL,
    labels: {
      caption: 'acetyl'
    }
  }
}`,...T.parameters?.docs?.source},description:{story:`The acetyl of aspirin painted, which is how a substructure hit is shown.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    width: 260,
    height: 200,
    autoCrop: false,
    atomLabels: numberedAtoms(14)
  }
}`,...E.parameters?.docs?.source},description:{story:`Text of the caller's own beside every atom — here each heavy atom numbered
from one, the way a guide or a ring count points at atoms.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    smiles: ASPIRIN,
    width: 280,
    height: 200,
    autoCrop: false
  },
  render: args => <ClickToHighlight {...args} />
}`,...D.parameters?.docs?.source},description:{story:`Clicking an atom paints it, which is how an attachment point is picked.`,...D.parameters?.docs?.description}}},j=[`Default`,`RealMolecules`,`EverySize`,`Unreadable`,`Labels`,`Highlighted`,`AtomLabels`,`ClickableAtoms`]})))()}M();export{E as AtomLabels,D as ClickableAtoms,b as Default,S as EverySize,T as Highlighted,w as Labels,x as RealMolecules,C as Unreadable,j as __namedExportsOrder,y as default};