import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-Ce8kprmR.js";import{i as n,r}from"./lookup-D4naSy63.js";import{n as i,t as a}from"./Wordmark-h-GoMN2L.js";var o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{n(),i(),o=t(),s=[13,17,28,44],c={title:`Ecosystem/Wordmark`,component:a,args:{siteId:`chemcalc`,size:17},argTypes:{siteId:{control:`select`,options:r.map(e=>e.id)},size:{control:{type:`range`,min:12,max:64,step:1}}},parameters:{docs:{description:{component:`The name of one site of the family, written in the two colours it owns.`}}}},l={},u={parameters:{layout:`padded`},render:e=>(0,o.jsx)(`div`,{style:f,children:r.map(t=>(0,o.jsxs)(`div`,{style:p,children:[(0,o.jsx)(a,{siteId:t.id,size:e.size}),(0,o.jsx)(`span`,{style:m,children:t.host})]},t.id))})},d={render:e=>(0,o.jsx)(`div`,{style:{display:`flex`,alignItems:`baseline`,gap:20},children:s.map(t=>(0,o.jsx)(a,{siteId:e.siteId,size:t},t))})},f={display:`grid`,gap:6,justifyItems:`start`},p={display:`grid`,width:`min(30rem, 90vw)`,alignItems:`baseline`,gap:12,gridTemplateColumns:`13.5rem 1fr`},m={color:`var(--text-faint, #8a96a3)`,fontFamily:`ui-monospace, SFMono-Regular, Menlo, monospace`,fontSize:`0.75rem`},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={COLUMN_STYLE}>
      {ECOSYSTEM_SITES.map(site => <div key={site.id} style={ROW_STYLE}>
          <Wordmark siteId={site.id} size={args.size} />
          <span style={HOST_STYLE}>{site.host}</span>
        </div>)}
    </div>
}`,...u.parameters?.docs?.source},description:{story:`Every name of the family in one column, so the two naming rules can be read
against the addresses beside them: a name that splits on itself — ChemCalc,
EquiLibrium, PolyCarp — carries no domain and no dot, a one-word name takes
\`.cheminfo\` after a faint dot, and the \`.org\` of the address is never
written, because the name is the site rather than where it lives.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => <div style={{
    display: 'flex',
    alignItems: 'baseline',
    gap: 20
  }}>
      {SIZES.map(size => <Wordmark key={size} siteId={args.siteId} size={size} />)}
    </div>
}`,...d.parameters?.docs?.source},description:{story:`The sizes a name is set at, from a footer line up to a landing heading.`,...d.parameters?.docs?.description}}},h=[`Default`,`EverySite`,`EverySize`]})))()}g();export{l as Default,u as EverySite,d as EverySize,h as __namedExportsOrder,c as default};