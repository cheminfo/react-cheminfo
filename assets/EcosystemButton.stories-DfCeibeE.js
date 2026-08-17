import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-C3dizwu_.js";import{i as n,n as r,r as i,t as a}from"./headerButton-baZ5xEGR.js";import{i as o,r as s}from"./marks-B2cb3B2p.js";import{n as c,t as l}from"./EcosystemMenu-CCssv2jH.js";function u(e){let{currentSiteId:t,label:n=`Tools`,...r}=e;return(0,d.jsx)(i,{...r,className:`ecosystem-button`,icon:`grid-view`,label:n,menu:(0,d.jsx)(l,{currentSiteId:t})})}var d;function f(){return(f=e((()=>{n(),c(),d=t(),u.__docgenInfo={description:`The Tools entry of a site header: one button opening every other site of the
family, each behind its own little logo.
@param props - The site it sits on, and how the menu opens.
@returns The button and its menu.`,methods:[],displayName:`EcosystemButton`,props:{compact:{required:!1,tsType:{name:`boolean`},description:`Whether the button is reduced to its icon — no text, no caret — for a
header that has run out of room. The icon still opens the same menu.
@default false`},placement:{required:!1,tsType:{name:`PopoverNextProps['placement']`,raw:`PopoverNextProps['placement']`},description:`Side the menu opens on.
@default 'bottom-end'`},currentSiteId:{required:!1,tsType:{name:`union`,raw:`| 'inchi'
| 'vcl'
| 'smiles'
| 'chemcalc'
| 'nmrium'
| 'surge'
| 'tex'
| 'lcao'
| 'regexp'
| 'pdb'
| 'elucidation'
| 'equilibrium'
| 'polycarp'
| '3d'
| 'pt'`,elements:[{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'pt'`}]},description:`The site this button sits on, which is shown but never linked.
@default undefined`},label:{required:!1,tsType:{name:`string`},description:`Text of the button. In a compact bar it is not written, but it stays what
the pointer and a screen reader are told.
@default 'Tools'`}}}})))()}var p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{o(),f(),r(),p=t(),m=s.map(e=>e.id),h={title:`Ecosystem/EcosystemButton`,component:u,argTypes:{...a,currentSiteId:{control:`select`,options:m}},parameters:{docs:{description:{component:`The Tools entry. Each tile lights up in the colour of the site it opens; the current site is shown but never linked.`}}}},g={},_={args:{currentSiteId:`vcl`}},v={args:{currentSiteId:`chemcalc`,compact:!0}},y={parameters:{layout:`padded`},args:{currentSiteId:`vcl`},render:e=>(0,p.jsx)(`div`,{className:`sb-header`,style:{width:`min(60rem, 90vw)`},children:(0,p.jsx)(u,{...e})})},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    currentSiteId: 'vcl'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    currentSiteId: 'chemcalc',
    compact: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:`The button where it actually lives: pushed to the right of a site's bar.`,...y.parameters?.docs?.description}}},b=[`Default`,`CurrentSite`,`Compact`,`InHeader`]})))()}x();export{v as Compact,_ as CurrentSite,g as Default,y as InHeader,b as __namedExportsOrder,h as default};