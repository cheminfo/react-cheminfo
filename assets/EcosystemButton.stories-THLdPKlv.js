import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-7mmjFs_t.js";import{r as n,t as r}from"./headerButton-DRQf5QD1.js";import{i,r as a}from"./lookup-KSPN-VnK.js";import{n as o,t as s}from"./EcosystemButton-DiOkyS3i.js";var c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{i(),o(),n(),c=t(),l=a.map(e=>e.id),u={title:`Ecosystem/EcosystemButton`,component:s,argTypes:{...r,currentSiteId:{control:`select`,options:l}},parameters:{docs:{description:{component:`The Tools entry. Each tile lights up in the colour of the site it opens; the current site is shown but never linked.`}}}},d={},f={args:{currentSiteId:`vcl`}},p={args:{currentSiteId:`chemcalc`,compact:!0}},m={parameters:{layout:`padded`},args:{currentSiteId:`vcl`},render:e=>(0,c.jsx)(`div`,{className:`sb-header`,style:{width:`min(60rem, 90vw)`},children:(0,c.jsx)(s,{...e})})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    currentSiteId: 'vcl'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    currentSiteId: 'chemcalc',
    compact: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  args: {
    currentSiteId: 'vcl'
  },
  render: args => <div className="sb-header" style={{
    width: 'min(60rem, 90vw)'
  }}>
      <EcosystemButton {...args} />
    </div>
}`,...m.parameters?.docs?.source},description:{story:`The button where it actually lives: pushed to the right of a site's bar.`,...m.parameters?.docs?.description}}},h=[`Default`,`CurrentSite`,`Compact`,`InHeader`]})))()}g();export{p as Compact,f as CurrentSite,d as Default,m as InHeader,h as __namedExportsOrder,u as default};