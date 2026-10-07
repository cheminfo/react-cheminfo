import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{a as t,c as n,o as r,s as i}from"./lookup-Cbp1oRe2.js";import{n as a}from"./iframe-DmsZCiF9.js";import{n as o,t as s}from"./marks-IBNys_4L.js";var c,l,u,d,f,p,m;function h(){return(h=e((()=>{n(),r(),o(),c=a(),l=[16,24,32,64],u={title:`Ecosystem/SiteMark`,component:s,args:{site:i[0],size:28},argTypes:{site:{control:`select`,options:i.map(e=>e.id),mapping:Object.fromEntries(i.map(e=>[e.id,e]))},size:{control:{type:`range`,min:12,max:128,step:4}}},parameters:{docs:{description:{component:`The little logo of one site of the family, as an inline SVG.`}}}},d={},f={parameters:{layout:`padded`},render:e=>(0,c.jsx)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:12},children:[...i,...t].map(t=>(0,c.jsx)(s,{site:t,size:e.size},t.id))})},p={render:e=>(0,c.jsx)(`div`,{style:{display:`flex`,alignItems:`center`,gap:12},children:l.map(t=>(0,c.jsx)(s,{site:e.site,size:t},t))})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12
  }}>
      {[...ECOSYSTEM_SITES, ...UNLISTED_SITES].map(site => <SiteMark key={site.id} site={site} size={args.size} />)}
    </div>
}`,...f.parameters?.docs?.source},description:{story:`Every mark of the family, so they can be read as one row.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12
  }}>
      {SIZES.map(size => <SiteMark key={size} site={args.site} size={size} />)}
    </div>
}`,...p.parameters?.docs?.source},description:{story:`The sizes a mark has to survive, down to the 16 px of a favicon.`,...p.parameters?.docs?.description}}},m=[`Default`,`EverySite`,`EverySize`]})))()}h();export{d as Default,f as EverySite,p as EverySize,m as __namedExportsOrder,u as default};