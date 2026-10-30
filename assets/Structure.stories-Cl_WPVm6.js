import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-cveapjj4.js";import{n as r,r as i}from"./familyTokens-DsQXXJV4.js";import{n as a,t as o}from"./Structure-BxRzjFYd.js";import{c as s,i as c,l,o as u,r as d,s as f}from"./structureFixtures-CJ3OPkrl.js";function p(e){let t=new Map;for(let n=0;n<e;n++)t.set(n,String(n+1));return t}function m(e){let[t,n]=(0,g.useState)(null);return(0,_.jsx)(h,{caption:t===null?`click an atom`:`atom ${t}`,children:(0,_.jsx)(o,{...e,atomHighlight:t===null?void 0:[t],onAtomClick:n})})}function h(e){return(0,_.jsxs)(`figure`,{style:j,children:[e.children,(0,_.jsx)(`figcaption`,{style:M,children:e.caption})]})}var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;function P(){return(P=e((()=>{g=t(),a(),i(),l(),_=n(),v=[{width:110,height:80},{width:200,height:150},{width:320,height:240}],y=[{caption:`a name, not a notation`,smiles:`benzene`},{caption:`a ring that never closes`,smiles:`C1CCCCC`},{caption:`a molfile with no atoms`,molfile:`
OCL MolfileCreator  2D

  0  0  0  0  0  0  0  0  0  0999 V2000
M  END
`},{caption:`nothing at all`}],b={title:`Structure/Structure`,component:o,args:{smiles:f,width:220,height:160},argTypes:{width:{control:{type:`range`,min:80,max:480,step:10}},height:{control:{type:`range`,min:60,max:360,step:10}},autoCrop:{control:`boolean`},autoCropMargin:{control:{type:`range`,min:0,max:40,step:2}}},parameters:{docs:{description:{component:`A read-only depiction, drawn from whichever notation the caller has — an idCode, a molfile or a SMILES — and never a broken box when there is none.`}}}},x={},S={parameters:{layout:`padded`},render:e=>(0,_.jsx)(`div`,{style:A,children:s.map(t=>(0,_.jsx)(o,{...e,autoCrop:!1,smiles:t.smiles,labels:{caption:t.name}},t.name))})},C={parameters:{layout:`padded`},render:e=>(0,_.jsx)(`div`,{style:A,children:v.map(t=>(0,_.jsx)(o,{...e,autoCrop:!1,width:t.width,height:t.height},t.width))})},w={parameters:{layout:`padded`},render:e=>(0,_.jsx)(`div`,{style:A,children:y.map(t=>(0,_.jsx)(h,{caption:t.caption,children:(0,_.jsx)(o,{...e,smiles:t.smiles,molfile:t.molfile,fallback:`no structure`})},t.caption))})},T={args:{width:260,height:200,autoCrop:!1,labels:{atoms:!0,bonds:!0,caption:`caffeine`}}},E={args:{smiles:d,width:280,height:200,autoCrop:!1,atomHighlight:c,labels:{caption:`acetyl`}}},D={args:{substructure:u},parameters:{layout:`padded`},render:e=>(0,_.jsx)(`div`,{style:A,children:s.map(t=>(0,_.jsx)(o,{...e,autoCrop:!1,smiles:t.smiles,labels:{caption:t.name}},t.name))})},O={args:{width:260,height:200,autoCrop:!1,atomLabels:p(14)}},k={args:{smiles:d,width:280,height:200,autoCrop:!1},render:e=>(0,_.jsx)(m,{...e})},A={display:`flex`,flexWrap:`wrap`,alignItems:`flex-end`,gap:16},j={display:`flex`,flexDirection:`column`,alignItems:`center`,padding:0,border:`1px dashed ${r.borderStrong}`,borderRadius:r.radius,margin:0,gap:4},M={padding:`0 8px 6px`,color:r.textMuted,fontSize:`0.75rem`},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {DEMO_MOLECULES.map(molecule => <Structure key={molecule.name} {...args} autoCrop={false} smiles={molecule.smiles} labels={{
      caption: molecule.name
    }} />)}
    </div>
}`,...S.parameters?.docs?.source},description:{story:`Three molecules the sites show, each named inside its own picture.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {SIZES.map(size => <Structure key={size.width} {...args} autoCrop={false} width={size.width} height={size.height} />)}
    </div>
}`,...C.parameters?.docs?.source},description:{story:`The same molecule from a table row up to a panel of its own. Cropping is off
here, because a cropped picture keeps the atoms at the size the notation
lays them out and so barely follows the box it is given.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {UNREADABLE.map(entry => <Figure key={entry.caption} caption={entry.caption}>
          <Structure {...args} smiles={entry.smiles} molfile={entry.molfile} fallback="no structure" />
        </Figure>)}
    </div>
}`,...w.parameters?.docs?.source},description:{story:`What a page gets when the notation is wrong, empty, or simply absent: the
same quiet placeholder at the size of the picture that would have been
drawn, so a list of structures keeps its rhythm instead of gaining a red box.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source},description:{story:`Atom and bond indices written on the picture, which is what turns a
depiction into something an assignment or a highlight can point at.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source},description:{story:`The acetyl of aspirin painted, which is how a substructure hit is shown.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    substructure: BENZENE_QUERY
  },
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {DEMO_MOLECULES.map(molecule => <Structure key={molecule.name} {...args} autoCrop={false} smiles={molecule.smiles} labels={{
      caption: molecule.name
    }} />)}
    </div>
}`,...D.parameters?.docs?.source},description:{story:`The hits of a substructure search, each painted where the drawn query sits:
the ring of aspirin and of benzene, and nothing on caffeine, which has none.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    width: 260,
    height: 200,
    autoCrop: false,
    atomLabels: numberedAtoms(14)
  }
}`,...O.parameters?.docs?.source},description:{story:`Text of the caller's own beside every atom — here each heavy atom numbered
from one, the way a guide or a ring count points at atoms.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    smiles: ASPIRIN,
    width: 280,
    height: 200,
    autoCrop: false
  },
  render: args => <ClickToHighlight {...args} />
}`,...k.parameters?.docs?.source},description:{story:`Clicking an atom paints it, which is how an attachment point is picked.`,...k.parameters?.docs?.description}}},N=[`Default`,`RealMolecules`,`EverySize`,`Unreadable`,`Labels`,`Highlighted`,`Substructure`,`AtomLabels`,`ClickableAtoms`]})))()}P();export{O as AtomLabels,k as ClickableAtoms,x as Default,C as EverySize,E as Highlighted,T as Labels,S as RealMolecules,D as Substructure,w as Unreadable,N as __namedExportsOrder,b as default};