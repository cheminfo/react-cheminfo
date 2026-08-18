import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{f as n,n as r}from"./iframe-NhtRTM8t.js";import{c as i,dt as a,jt as o,l as s,t as c,vr as l}from"./classnames-BNSM7D_X.js";import{n as u,r as d}from"./buttons-IE2sMQRv.js";import{i as f,n as p,t as m}from"./helpContent-gOI0QuCh.js";import{n as h,t as g}from"./HelpToolbarButton-CjRfxQ9H.js";var _,v,y;function b(){return(b=e((()=>{_=t(c()),v=n(),l(),s(),y=({className:e,compact:t=!1,tagName:n=`div`,...r})=>{let i=(0,_.default)(o,{[a]:t},e);return(0,v.createElement)(n,{...r,className:i})},y.displayName=`${i}.Divider`})))()}function x(){}var S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{d(),b(),h(),f(),S=r(),C={title:`Help/HelpToolbarButton`,component:g,args:{content:p,label:`Mass`,onClick:x},argTypes:{label:{control:`text`},small:{control:`boolean`}},parameters:{docs:{description:{component:`The help entry of a toolbar: a glyph that explains itself on hover, and opens the full guide when pressed.`}}}},w={},T={args:{label:void 0}},E={args:{small:!0,icon:`info-sign`,label:`About the mass`}},D={parameters:{layout:`padded`},render:e=>(0,S.jsxs)(`div`,{style:O,children:[(0,S.jsx)(u,{variant:`minimal`,icon:`zoom-in`,text:`Zoom`}),(0,S.jsx)(u,{variant:`minimal`,icon:`pulse`,text:`Peaks`}),(0,S.jsx)(u,{variant:`minimal`,icon:`download`,text:`Export`}),(0,S.jsx)(y,{}),(0,S.jsx)(g,{...e,content:m,label:`Adducts`}),(0,S.jsx)(g,{...e})]})},O={display:`flex`,width:`min(36rem, 92vw)`,alignItems:`center`,padding:`0.35rem 0.5rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,gap:4},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    label: undefined
  }
}`,...T.parameters?.docs?.source},description:{story:`No label, for a toolbar that has run out of room.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    small: true,
    icon: 'info-sign',
    label: 'About the mass'
  }
}`,...E.parameters?.docs?.source},description:{story:`The small size a dense toolbar needs, under a glyph of its own choosing.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={TOOLBAR_STYLE}>
      <Button variant="minimal" icon="zoom-in" text="Zoom" />
      <Button variant="minimal" icon="pulse" text="Peaks" />
      <Button variant="minimal" icon="download" text="Export" />
      <Divider />
      <HelpToolbarButton {...args} content={ADDUCT_HELP} label="Adducts" />
      <HelpToolbarButton {...args} />
    </div>
}`,...D.parameters?.docs?.source},description:{story:`The entry where it sits: last in a toolbar, after the tools it explains.`,...D.parameters?.docs?.description}}},k=[`Default`,`IconOnly`,`Small`,`InToolbar`]})))()}A();export{w as Default,T as IconOnly,D as InToolbar,E as Small,k as __namedExportsOrder,C as default};