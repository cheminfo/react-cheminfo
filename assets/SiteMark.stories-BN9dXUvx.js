import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-d1eXCcja.js";import{i as n,r}from"./lookup-C_zzqmKr.js";import{n as i,t as a}from"./marks-4pmrBkTl.js";var o,s,c,l,u,d,f;function p(){return(p=e((()=>{n(),i(),o=t(),s=[16,24,32,64],c={title:`Ecosystem/SiteMark`,component:a,args:{site:r[0],size:28},argTypes:{site:{control:`select`,options:r.map(e=>e.id),mapping:Object.fromEntries(r.map(e=>[e.id,e]))},size:{control:{type:`range`,min:12,max:128,step:4}}},parameters:{docs:{description:{component:`The little logo of one site of the family, as an inline SVG.`}}}},l={},u={parameters:{layout:`padded`},render:e=>(0,o.jsx)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:12},children:r.map(t=>(0,o.jsx)(a,{site:t,size:e.size},t.id))})},d={render:e=>(0,o.jsx)(`div`,{style:{display:`flex`,alignItems:`center`,gap:12},children:s.map(t=>(0,o.jsx)(a,{site:e.site,size:t},t))})},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12
  }}>
      {ECOSYSTEM_SITES.map(site => <SiteMark key={site.id} site={site} size={args.size} />)}
    </div>
}`,...u.parameters?.docs?.source},description:{story:`Every mark of the family, so they can be read as one row.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12
  }}>
      {SIZES.map(size => <SiteMark key={size} site={args.site} size={size} />)}
    </div>
}`,...d.parameters?.docs?.source},description:{story:`The sizes a mark has to survive, down to the 16 px of a favicon.`,...d.parameters?.docs?.description}}},f=[`Default`,`EverySite`,`EverySize`]})))()}p();export{l as Default,u as EverySite,d as EverySize,f as __namedExportsOrder,c as default};