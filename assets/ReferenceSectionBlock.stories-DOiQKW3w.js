import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-BDQJEmVY.js";import{_ as n,o as r,r as i,u as a,v as o}from"./pedagogyFixtures-SRQjvSWn.js";import{n as s,t as c}from"./ReferenceSectionBlock-D_Zb-UM-.js";var l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{s(),o(),l=t(),u=e=>(0,l.jsx)(`div`,{style:{width:`min(32rem, 92vw)`},children:(0,l.jsx)(e,{})}),d={title:`Pedagogy/ReferenceSectionBlock`,component:c,decorators:[u],args:{section:i},argTypes:{syntaxWidth:{control:{type:`range`,min:60,max:260,step:10}}},parameters:{layout:`padded`,docs:{description:{component:`One titled block of the cheatsheet: a coloured heading, an optional line under it, and a row per construct. Rows are spans in a column rather than a table, which survives both a tooltip and a page break.`}}}},f={},p={args:{section:r}},m={args:{section:n}},h={args:{section:a}},g={args:{section:n,syntaxWidth:80}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source},description:{story:`Every row carries a long description, so every one is dotted and hoverable.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    section: GROUPS_SECTION
  }
}`,...p.parameters?.docs?.source},description:{story:`A block shipped before its long descriptions were written: a row without one
is plain text, not a chip that opens nothing.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    section: STEREOCHEMISTRY_SECTION
  }
}`,...m.parameters?.docs?.source},description:{story:`The heading colour is how the blocks are told apart on a printed sheet.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    section: SCREEN_ONLY_SECTION
  }
}`,...h.parameters?.docs?.source},description:{story:"`noPrint` adds the `no-print` class, and the sheet loses the block.",...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    section: STEREOCHEMISTRY_SECTION,
    syntaxWidth: 80
  }
}`,...g.parameters?.docs?.source},description:{story:`A narrow syntax column, for a block whose constructs are one character.`,...g.parameters?.docs?.description}}},_=[`Default`,`Sparse`,`AnotherColour`,`ScreenOnly`,`NarrowSyntaxColumn`]})))()}v();export{m as AnotherColour,f as Default,g as NarrowSyntaxColumn,h as ScreenOnly,p as Sparse,_ as __namedExportsOrder,d as default};