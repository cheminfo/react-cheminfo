import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-d1eXCcja.js";import{l as n,n as r,v as i}from"./pedagogyFixtures-SRQjvSWn.js";import{n as a,t as o}from"./SyntaxTooltip-Dr91omm5.js";var s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{a(),i(),s=t(),c={borderBottom:`1px dotted #5b6875`,cursor:`help`,fontFamily:`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`,fontSize:14,fontWeight:600},l={title:`Pedagogy/SyntaxTooltip`,component:o,args:{content:r,children:(0,s.jsx)(`code`,{style:c,children:`c1ccccc1`})},argTypes:{placement:{control:`select`,options:[`bottom`,`top`,`right`,`left`]},codeLabel:{control:`text`},inputLabel:{control:`text`}},parameters:{docs:{description:{component:`The one rich tooltip of a tool: every cheatsheet row, option chip and help icon opens this, so adding a construct means writing the same five fields.`}}}},u={},d={args:{isOpen:!0},parameters:{layout:`padded`}},f={args:{content:n,children:(0,s.jsx)(`code`,{style:c,children:`C1CCCCC1`})}},p={parameters:{layout:`padded`},args:{placement:`right`}},m={args:{codeLabel:`Pattern`,inputLabel:`Molecule`}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source},description:{story:`Hover the chip: the syntax, its name, the summary, the detail, the example.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true
  },
  parameters: {
    layout: 'padded'
  }
}`,...d.parameters?.docs?.source},description:{story:`Pinned open with \`isOpen\`, which is how a page holds one open on click — and
the only way to read the dark treatment that is most of what this component
is without hovering it.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    content: RING_CLOSURE_SYNTAX,
    children: <code style={CHIP_STYLE}>C1CCCCC1</code>
  }
}`,...f.parameters?.docs?.source},description:{story:`A construct with no provenance to quote drops the small grey tag.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  args: {
    placement: 'right'
  }
}`,...p.parameters?.docs?.source},description:{story:`A cheatsheet row opens to its right, where there is room for 360 px.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    codeLabel: 'Pattern',
    inputLabel: 'Molecule'
  }
}`,...m.parameters?.docs?.source},description:{story:`The two labels are the tool's words: a query and the molecule it runs on.`,...m.parameters?.docs?.description}}},h=[`Default`,`Open`,`WithoutATag`,`OnACheatsheetRow`,`RenamedLabels`]})))()}g();export{u as Default,p as OnACheatsheetRow,d as Open,m as RenamedLabels,f as WithoutATag,h as __namedExportsOrder,l as default};