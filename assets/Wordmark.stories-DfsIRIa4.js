import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{a as t,o as n}from"./lookup-DCkzqGBz.js";import{n as r}from"./iframe-CrDw_Dpt.js";import{n as i,r as a}from"./familyTokens-DsQXXJV4.js";import{n as o,t as s}from"./Wordmark-gkwsf1XK.js";var c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{n(),o(),a(),c=r(),l=[13,17,28,44],u={title:`Ecosystem/Wordmark`,component:s,args:{siteId:`chemcalc`,size:17},argTypes:{siteId:{control:`select`,options:t.map(e=>e.id)},size:{control:{type:`range`,min:12,max:64,step:1}}},parameters:{docs:{description:{component:`The name of one site of the family, written in the two colours it owns.`}}}},d={},f={parameters:{layout:`padded`},render:e=>(0,c.jsx)(`div`,{style:m,children:t.map(t=>(0,c.jsxs)(`div`,{style:h,children:[(0,c.jsx)(s,{siteId:t.id,size:e.size}),(0,c.jsx)(`span`,{style:g,children:t.host})]},t.id))})},p={render:e=>(0,c.jsx)(`div`,{style:{display:`flex`,alignItems:`baseline`,gap:20},children:l.map(t=>(0,c.jsx)(s,{siteId:e.siteId,size:t},t))})},m={display:`grid`,gap:6,justifyItems:`start`},h={display:`grid`,width:`min(30rem, 90vw)`,alignItems:`baseline`,gap:12,gridTemplateColumns:`13.5rem 1fr`},g={color:i.textFaint,fontFamily:`ui-monospace, SFMono-Regular, Menlo, monospace`,fontSize:`0.75rem`},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={COLUMN_STYLE}>
      {ECOSYSTEM_SITES.map(site => <div key={site.id} style={ROW_STYLE}>
          <Wordmark siteId={site.id} size={args.size} />
          <span style={HOST_STYLE}>{site.host}</span>
        </div>)}
    </div>
}`,...f.parameters?.docs?.source},description:{story:`Every name of the family in one column, so the two naming rules can be read
against the addresses beside them: a name that splits on itself — ChemCalc,
EquiLibrium, PolyCarp — carries no domain and no dot, a one-word name takes
\`.cheminfo\` after a faint dot, and the \`.org\` of the address is never
written, because the name is the site rather than where it lives.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => <div style={{
    display: 'flex',
    alignItems: 'baseline',
    gap: 20
  }}>
      {SIZES.map(size => <Wordmark key={size} siteId={args.siteId} size={size} />)}
    </div>
}`,...p.parameters?.docs?.source},description:{story:`The sizes a name is set at, from a footer line up to a landing heading.`,...p.parameters?.docs?.description}}},_=[`Default`,`EverySite`,`EverySize`]})))()}v();export{d as Default,f as EverySite,p as EverySize,_ as __namedExportsOrder,u as default};