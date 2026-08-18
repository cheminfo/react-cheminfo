import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-7mmjFs_t.js";import{a as n,i as r,n as i,o as a,r as o,t as s}from"./helpContent-DK9hTw1R.js";import{n as c,t as l}from"./HelpIcon-CSjmG9mZ.js";import{n as u,t as d}from"./HelpToolbarButton-DPyd2Fbg.js";var f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{c(),u(),a(),r(),f=t(),p={borderBottom:`1px dotted var(--text-faint)`,cursor:`help`},m={title:`Help/HelpTooltip`,component:n,args:{content:i,children:(0,f.jsx)(`span`,{style:p,children:`monoisotopic mass`})},argTypes:{placement:{control:`select`,options:[`top`,`right`,`bottom`,`left`]},width:{control:{type:`range`,min:180,max:480,step:20}}},parameters:{docs:{description:{component:`A piece of help attached to whatever it explains. Rest the pointer on the target — it opens after a quarter of a second, so sweeping across a row of controls opens nothing.`}}}},h={},g={args:{content:o,children:(0,f.jsx)(`span`,{style:p,children:`SMILES`})}},_={args:{content:s,width:420}},v={parameters:{layout:`padded`},render:e=>(0,f.jsxs)(`div`,{style:y,children:[(0,f.jsx)(n,{content:e.content,children:(0,f.jsx)(`span`,{style:p,children:`monoisotopic mass`})}),(0,f.jsxs)(`span`,{style:b,children:[`Monoisotopic mass`,(0,f.jsx)(l,{content:e.content})]}),(0,f.jsx)(d,{content:e.content,label:`Mass`})]})},y={display:`flex`,flexWrap:`wrap`,alignItems:`center`,gap:24},b={display:`inline-flex`,alignItems:`center`,color:`var(--text-muted)`,fontSize:13,fontWeight:600,gap:4},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    content: SMILES_HELP,
    children: <span style={TARGET_STYLE}>SMILES</span>
  }
}`,...g.parameters?.docs?.source},description:{story:`Help carrying no link closes as soon as the pointer leaves its target.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    content: ADDUCT_HELP,
    width: 420
  }
}`,..._.parameters?.docs?.source},description:{story:`A wide body, for help whose example is a line that must not wrap.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      <HelpTooltip content={args.content}>
        <span style={TARGET_STYLE}>monoisotopic mass</span>
      </HelpTooltip>
      <span style={FIELD_STYLE}>
        Monoisotopic mass
        <HelpIcon content={args.content} />
      </span>
      <HelpToolbarButton content={args.content} label="Mass" />
    </div>
}`,...v.parameters?.docs?.source},description:{story:`One payload, three triggers: the tooltip on a phrase, the glyph beside a
field label, and the help entry of a toolbar all draw the same body, so a
construct documented once cannot drift between two of its mentions.`,...v.parameters?.docs?.description}}},x=[`Default`,`WithoutExampleOrLink`,`Wide`,`EveryTrigger`]})))()}S();export{h as Default,v as EveryTrigger,_ as Wide,g as WithoutExampleOrLink,x as __namedExportsOrder,m as default};