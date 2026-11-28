import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-aRVavQD_.js";import{n,r}from"./buttons-DaxO8CbN.js";import{n as i,t as a}from"./divider-C3fmA2_i.js";import{o,r as s,t as c}from"./helpContent-CytPh9mh.js";import{n as l,t as u}from"./HelpToolbarButton-CZECrOwV.js";function d(){}var f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{r(),i(),l(),o(),f=t(),p={title:`Help/HelpToolbarButton`,component:u,args:{content:s,label:`Mass`,onClick:d},argTypes:{label:{control:`text`},small:{control:`boolean`}},parameters:{docs:{description:{component:`The help entry of a toolbar: a glyph that explains itself on hover, and opens the full guide when pressed.`}}}},m={},h={args:{label:void 0}},g={args:{small:!0,icon:`info-sign`,label:`About the mass`}},_={parameters:{layout:`padded`},render:e=>(0,f.jsxs)(`div`,{style:v,children:[(0,f.jsx)(n,{variant:`minimal`,icon:`zoom-in`,text:`Zoom`}),(0,f.jsx)(n,{variant:`minimal`,icon:`pulse`,text:`Peaks`}),(0,f.jsx)(n,{variant:`minimal`,icon:`download`,text:`Export`}),(0,f.jsx)(a,{}),(0,f.jsx)(u,{...e,content:c,label:`Adducts`}),(0,f.jsx)(u,{...e})]})},v={display:`flex`,width:`min(36rem, 92vw)`,alignItems:`center`,padding:`0.35rem 0.5rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,gap:4},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: undefined
  }
}`,...h.parameters?.docs?.source},description:{story:`No label, for a toolbar that has run out of room.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    small: true,
    icon: 'info-sign',
    label: 'About the mass'
  }
}`,...g.parameters?.docs?.source},description:{story:`The small size a dense toolbar needs, under a glyph of its own choosing.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:`The entry where it sits: last in a toolbar, after the tools it explains.`,..._.parameters?.docs?.description}}},y=[`Default`,`IconOnly`,`Small`,`InToolbar`]})))()}b();export{m as Default,h as IconOnly,_ as InToolbar,g as Small,y as __namedExportsOrder,p as default};