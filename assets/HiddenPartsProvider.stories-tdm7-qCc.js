import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-d1eXCcja.js";import{_ as n,d as r,f as i,l as a,p as o,r as s,t as c,y as l}from"./sharePanels-VRAsasOx.js";import{n as u,t as d}from"./HiddenPartsProvider-C_7dzeyF.js";var f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{n(),u(),o(),s(),f=t(),p=`?smiles=c1ccc2ccccc2c1&hide=examples,diagram&limit=4000`,m=l(p,r),h={display:`grid`,gap:8},g={color:`var(--text-muted)`,fontSize:12},_={maxWidth:`32rem`,margin:0,color:`var(--text-muted)`,fontSize:12},v={title:`Share/HiddenPartsProvider`,component:d,args:{hidden:i,children:(0,f.jsx)(c,{})},argTypes:{hidden:{control:`check`,options:a},children:{control:!1}},parameters:{layout:`padded`,docs:{description:{component:`Puts the configuration of the current link where every part of the page can read it, so nothing has to be threaded through props. Tick the parts in the controls to watch the page change.`}}}},y={},b={args:{hidden:[]}},x={render:e=>(0,f.jsxs)(`div`,{style:h,children:[(0,f.jsx)(`code`,{style:g,children:p}),(0,f.jsx)(`p`,{style:_,children:`hidden: [${m.hidden.join(`, `)}] · limit: ${String(m.params.limit)}`}),(0,f.jsx)(d,{hidden:m.hidden,children:e.children})]})},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{}`,...y.parameters?.docs?.source},description:{story:`The page inside a course tile: the hints and the limit are switched off.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    hidden: []
  }
}`,...b.parameters?.docs?.source},description:{story:`The same page on our own site, where a link switches nothing off.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => <div style={COLUMN_STYLE}>
      <code style={ADDRESS_STYLE}>{LINK_SEARCH}</code>
      <p style={NOTE_STYLE}>
        {\`hidden: [\${LINK_CONFIG.hidden.join(', ')}] · limit: \${String(LINK_CONFIG.params.limit)}\`}
      </p>
      <HiddenPartsProvider hidden={LINK_CONFIG.hidden}>
        {args.children}
      </HiddenPartsProvider>
    </div>
}`,...x.parameters?.docs?.source},description:{story:"Read straight off an address: `diagram` names no part of this version and is\nignored, and the 4000 hits it asks for come back clamped to 200.",...x.parameters?.docs?.description}}},S=[`Default`,`NothingHidden`,`FromTheLink`]})))()}C();export{y as Default,x as FromTheLink,b as NothingHidden,S as __namedExportsOrder,v as default};