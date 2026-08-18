import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-7mmjFs_t.js";import{n,t as r}from"./inputGroup-BbgEKAVM.js";import{i,n as a,r as o,t as s}from"./helpContent-DK9hTw1R.js";import{n as c,t as l}from"./HelpIcon-CSjmG9mZ.js";function u(e){return(0,d.jsxs)(`div`,{style:v,children:[(0,d.jsxs)(`span`,{style:y,children:[e.label,(0,d.jsx)(l,{content:e.help,size:e.size})]}),e.children]})}var d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{n(),c(),i(),d=t(),f=[`top`,`right`,`bottom`,`left`],p={title:`Help/HelpIcon`,component:l,args:{content:a},argTypes:{size:{control:{type:`range`,min:10,max:32,step:1}},placement:{control:`select`,options:f}},parameters:{docs:{description:{component:`The small question mark that sits beside a field label. It is reachable by tab, so the explanation is not reserved to whoever is holding a pointer.`}}}},m={},h={parameters:{layout:`padded`},render:e=>(0,d.jsxs)(`div`,{style:_,children:[(0,d.jsx)(u,{label:`Molecular formula`,help:o,size:e.size,children:(0,d.jsx)(r,{readOnly:!0,value:`C8H10N4O2`})}),(0,d.jsx)(u,{label:`Monoisotopic mass`,help:a,size:e.size,children:(0,d.jsx)(r,{readOnly:!0,value:`194.0804 Da`})}),(0,d.jsx)(u,{label:`Adduct`,help:s,size:e.size,children:(0,d.jsx)(r,{readOnly:!0,value:`[M+H]+`})})]})},g={parameters:{layout:`padded`},render:e=>(0,d.jsx)(`div`,{style:b,children:f.map(t=>(0,d.jsxs)(`span`,{style:y,children:[t,(0,d.jsx)(l,{content:e.content,placement:t})]},t))})},_={display:`flex`,width:`min(22rem, 90vw)`,flexDirection:`column`,gap:12},v={display:`flex`,flexDirection:`column`,gap:4},y={display:`inline-flex`,alignItems:`center`,color:`var(--text-muted)`,fontSize:13,fontWeight:600,gap:4},b={display:`flex`,flexWrap:`wrap`,alignItems:`center`,gap:24},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={FORM_STYLE}>
      <Field label="Molecular formula" help={SMILES_HELP} size={args.size}>
        <InputGroup readOnly value="C8H10N4O2" />
      </Field>
      <Field label="Monoisotopic mass" help={MONOISOTOPIC_MASS_HELP} size={args.size}>
        <InputGroup readOnly value="194.0804 Da" />
      </Field>
      <Field label="Adduct" help={ADDUCT_HELP} size={args.size}>
        <InputGroup readOnly value="[M+H]+" />
      </Field>
    </div>
}`,...h.parameters?.docs?.source},description:{story:`Where the glyph actually lives: on the line of the label it follows.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {PLACEMENTS.map(placement => <span key={placement} style={LABEL_STYLE}>
          {placement}
          <HelpIcon content={args.content} placement={placement} />
        </span>)}
    </div>
}`,...g.parameters?.docs?.source},description:{story:`The four sides the help can open on, for a glyph near an edge of the page.`,...g.parameters?.docs?.description}}},x=[`Default`,`BesideFieldLabels`,`EveryPlacement`]})))()}S();export{h as BesideFieldLabels,m as Default,g as EveryPlacement,x as __namedExportsOrder,p as default};