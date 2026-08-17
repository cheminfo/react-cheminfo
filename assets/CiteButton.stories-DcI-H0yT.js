import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-CQXG1m5e.js";import{i as n,n as r,r as i,t as a}from"./headerButton-BNqLY7bj.js";import{n as o,t as s}from"./CitationMenu-D0CDvPxk.js";import{n as c,t as l}from"./paper-C32vaBes.js";function u(e){let{reference:t,label:n=`Cite`,...r}=e;return(0,d.jsx)(i,{...r,className:`citation-button`,icon:`citation`,label:n,menu:(0,d.jsx)(s,{reference:t})})}var d;function f(){return(f=e((()=>{n(),o(),d=t(),u.__docgenInfo={description:`The Cite entry of a site header: one button opening the article at its DOI,
the reference in the style a journal asks for, and the files a reference
manager imports.
@param props - The work being cited, and how the menu opens.
@returns The button and its menu.`,methods:[],displayName:`CiteButton`,props:{compact:{required:!1,tsType:{name:`boolean`},description:`Whether the button is reduced to its icon — no text, no caret — for a
header that has run out of room. The icon still opens the same menu.
@default false`},placement:{required:!1,tsType:{name:`PopoverNextProps['placement']`,raw:`PopoverNextProps['placement']`},description:`Side the menu opens on.
@default 'bottom-end'`},reference:{required:!0,tsType:{name:`Reference`},description:`The work the site asks to be cited.`},label:{required:!1,tsType:{name:`string`},description:`Text of the button. In a compact bar it is not written, but it stays what
the pointer and a screen reader are told.
@default 'Cite'`}}}})))()}var p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{f(),r(),c(),p=t(),m={title:`Citation/CiteButton`,component:u,args:{reference:l},argTypes:a,parameters:{docs:{description:{component:`The Cite entry of a site header. Open it, hover an entry for the preview, and the styles sit in the submenu.`}}}},h={},g={args:{label:`Cite this work`}},_={args:{placement:`bottom-start`}},v={args:{compact:!0}},y={parameters:{layout:`padded`},render:e=>(0,p.jsx)(`div`,{className:`sb-header`,style:{width:`min(60rem, 90vw)`},children:(0,p.jsx)(u,{...e})})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Cite this work'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-start'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div className="sb-header" style={{
    width: 'min(60rem, 90vw)'
  }}>
      <CiteButton {...args} />
    </div>
}`,...y.parameters?.docs?.source},description:{story:`The button where it actually lives: pushed to the right of a site's bar.`,...y.parameters?.docs?.description}}},b=[`Default`,`CustomLabel`,`BottomStart`,`Compact`,`InHeader`]})))()}x();export{_ as BottomStart,v as Compact,g as CustomLabel,h as Default,y as InHeader,b as __namedExportsOrder,m as default};