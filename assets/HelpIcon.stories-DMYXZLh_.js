import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-CrDw_Dpt.js";import{n,t as r}from"./inputGroup-CK70pVZ6.js";import{n as i,t as a}from"./HelpIcon-3bgwK_sc.js";import{a as o,i as s,n as c,o as l,r as u,t as d}from"./helpContent-CytPh9mh.js";function f(e){return(0,p.jsxs)(`div`,{style:S,children:[(0,p.jsxs)(`span`,{style:C,children:[e.label,(0,p.jsx)(a,{content:e.help,size:e.size})]}),e.children]})}var p,m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{n(),i(),l(),p=t(),m=[`top`,`right`,`bottom`,`left`],h={title:`Help/HelpIcon`,component:a,args:{content:u},argTypes:{size:{control:{type:`range`,min:10,max:32,step:1}},placement:{control:`select`,options:m}},parameters:{docs:{description:{component:`The small question mark that sits beside a field label. It is reachable by tab, so the explanation is not reserved to whoever is holding a pointer.`}}}},g={},_={args:{content:s}},v={args:{content:c,label:`Minimum RMSD`,icon:`info-sign`}},y={parameters:{layout:`padded`},render:e=>(0,p.jsxs)(`div`,{style:x,children:[(0,p.jsx)(f,{label:`Molecular formula`,help:o,size:e.size,children:(0,p.jsx)(r,{readOnly:!0,value:`C8H10N4O2`})}),(0,p.jsx)(f,{label:`Monoisotopic mass`,help:u,size:e.size,children:(0,p.jsx)(r,{readOnly:!0,value:`194.0804 Da`})}),(0,p.jsx)(f,{label:`Adduct`,help:d,size:e.size,children:(0,p.jsx)(r,{readOnly:!0,value:`[M+H]+`})})]})},b={parameters:{layout:`padded`},render:e=>(0,p.jsx)(`div`,{style:w,children:m.map(t=>(0,p.jsxs)(`span`,{style:C,children:[t,(0,p.jsx)(a,{content:e.content,placement:t})]},t))})},x={display:`flex`,width:`min(22rem, 90vw)`,flexDirection:`column`,gap:12},S={display:`flex`,flexDirection:`column`,gap:4},C={display:`inline-flex`,alignItems:`center`,color:`var(--text-muted)`,fontSize:13,fontWeight:600,gap:4},w={display:`flex`,flexWrap:`wrap`,alignItems:`center`,gap:24},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    content: NOMINAL_MASS_HELP
  }
}`,..._.parameters?.docs?.source},description:{story:`Help whose rule takes more than one case to see, each read in turn.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    content: MINIMUM_RMSD_HELP,
    label: 'Minimum RMSD',
    icon: 'info-sign'
  }
}`,...v.parameters?.docs?.source},description:{story:`Free-form help with no title, behind the glyph a site already uses; the
label names it for a screen reader.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:`Where the glyph actually lives: on the line of the label it follows.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {PLACEMENTS.map(placement => <span key={placement} style={LABEL_STYLE}>
          {placement}
          <HelpIcon content={args.content} placement={placement} />
        </span>)}
    </div>
}`,...b.parameters?.docs?.source},description:{story:`The four sides the help can open on, for a glyph near an edge of the page.`,...b.parameters?.docs?.description}}},T=[`Default`,`SeveralExamples`,`PlainContent`,`BesideFieldLabels`,`EveryPlacement`]})))()}E();export{y as BesideFieldLabels,g as Default,b as EveryPlacement,v as PlainContent,_ as SeveralExamples,T as __namedExportsOrder,h as default};