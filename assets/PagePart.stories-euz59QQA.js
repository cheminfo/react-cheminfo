import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-DqsyC3lB.js";import{a as n,i as r,l as i,n as a,p as o,r as s,t as c}from"./sharePanels-DRfPV0mx.js";import{n as l,t as u}from"./HiddenPartsProvider-Cyeo_vpm.js";function d(e){let{address:t,hidden:n}=e;return(0,f.jsxs)(`div`,{style:g,children:[(0,f.jsx)(`code`,{style:_,children:t}),(0,f.jsx)(u,{hidden:n,children:(0,f.jsx)(c,{})})]})}var f,p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{l(),n(),o(),s(),f=t(),p=[],m=[`hints`],h={display:`flex`,flexWrap:`wrap`,alignItems:`start`,gap:24},g={display:`grid`,gap:8},_={color:`var(--text-muted)`,fontSize:12},v={width:`min(24rem, 92vw)`,minHeight:54,border:`1px dashed var(--border-strong)`,borderRadius:`var(--radius)`},y={maxWidth:`32rem`,margin:0,color:`var(--text-muted)`,fontSize:12},b={title:`Share/PagePart`,component:r,args:{part:`hints`,children:(0,f.jsx)(a,{title:`Hints`,children:`Aromatic carbons are written lowercase, so benzene is c1ccccc1.`})},argTypes:{part:{control:`select`,options:i},children:{control:!1}},parameters:{docs:{description:{component:`A region of the page a shared link may leave out. A switched-off part is dropped from the tree rather than hidden with CSS, so an embedded figure never mounts a canvas nobody will see.`}}}},x={},S={parameters:{layout:`padded`},render:e=>(0,f.jsxs)(`div`,{style:g,children:[(0,f.jsx)(`code`,{style:_,children:`?smiles=c1ccc2ccccc2c1&hide=hints`}),(0,f.jsx)(`div`,{style:v,children:(0,f.jsx)(u,{hidden:m,children:(0,f.jsx)(r,{...e})})}),(0,f.jsx)(`p`,{style:y,children:`The outline is all that is left: no panel, and nothing mounted inside it.`})]})},C={parameters:{layout:`padded`},render:()=>(0,f.jsxs)(`div`,{style:h,children:[(0,f.jsx)(d,{address:`?smiles=c1ccc2ccccc2c1`,hidden:p}),(0,f.jsx)(d,{address:`?smiles=c1ccc2ccccc2c1&hide=hints`,hidden:m})]})},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{}`,...x.parameters?.docs?.source},description:{story:`With no link switching anything off, a part simply draws what it holds.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={COLUMN_STYLE}>
      <code style={ADDRESS_STYLE}>?smiles=c1ccc2ccccc2c1&amp;hide=hints</code>
      <div style={HOLE_STYLE}>
        <HiddenPartsProvider hidden={HINTS_HIDDEN}>
          <PagePart {...args} />
        </HiddenPartsProvider>
      </div>
      <p style={NOTE_STYLE}>
        The outline is all that is left: no panel, and nothing mounted inside
        it.
      </p>
    </div>
}`,...S.parameters?.docs?.source},description:{story:"Under `hide=hints`, the very same part returns nothing to render at all.",...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: () => <div style={ROW_STYLE}>
      <UnderLink address="?smiles=c1ccc2ccccc2c1" hidden={NOTHING_HIDDEN} />
      <UnderLink address="?smiles=c1ccc2ccccc2c1&hide=hints" hidden={HINTS_HIDDEN} />
    </div>
}`,...C.parameters?.docs?.source},description:{story:"The same page under two links, so what `hide=` costs is the missing panel.",...C.parameters?.docs?.description}}},w=[`Default`,`Hidden`,`SideBySide`]})))()}T();export{x as Default,S as Hidden,C as SideBySide,w as __namedExportsOrder,b as default};