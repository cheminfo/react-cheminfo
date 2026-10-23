import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-D4120jJg.js";import{d as r,t as i,v as a}from"./pedagogyFixtures-CJW_gw23.js";import{n as o,t as s}from"./HintLadder-BJPsMXKJ.js";import{n as c,t as l}from"./GlossaryProvider-BGNmlJoN.js";function u(e){let[t,n]=(0,d.useState)(e.revealed);return(0,f.jsx)(s,{...e,revealed:t,onReveal:()=>{n(e=>e+1)}})}var d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{d=t(),c(),o(),a(),f=n(),p=e=>(0,f.jsx)(l,{glossary:r,children:(0,f.jsx)(`div`,{style:{width:`min(36rem, 90vw)`},children:(0,f.jsx)(e,{})})}),m={title:`Pedagogy/HintLadder`,component:s,decorators:[p],args:{hints:i,revealed:0},argTypes:{revealLabel:{control:`text`},title:{control:`text`}},parameters:{layout:`padded`,docs:{description:{component:`The hints a student has asked for, and the button that opens the next one — the L-alanine exercise of a SMILES course.`}}},render:e=>(0,f.jsx)(u,{...e},e.revealed)},h={},g={args:{revealed:1}},_={args:{revealed:i.length}},v={args:{revealed:2},render:e=>(0,f.jsx)(s,{...e})},y={args:{revealed:1,title:`Nudges`,revealLabel:`Nudge me`}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source},description:{story:`Click through the three rungs: a nudge, then the construct, then almost the
answer. Opening all three at once would just be the solution.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: 1
  }
}`,...g.parameters?.docs?.source},description:{story:`Coming back to an exercise reopens the rungs that were already read.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: ALANINE_HINTS.length
  }
}`,..._.parameters?.docs?.source},description:{story:`Nothing left to give: the button goes dead rather than disappearing.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: 2
  },
  render: args => <HintLadder {...args} />
}`,...v.parameters?.docs?.source},description:{story:"No `onReveal`: the ladder only reports, because the button lives in `ExerciseActions`.",...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: 1,
    title: 'Nudges',
    revealLabel: 'Nudge me'
  }
}`,...y.parameters?.docs?.source},description:{story:`Both words are the tool's: a course may nudge rather than hint.`,...y.parameters?.docs?.description}}},b=[`Default`,`PartlyOpen`,`Exhausted`,`WithoutTheButton`,`RenamedForTheTool`]})))()}x();export{h as Default,_ as Exhausted,g as PartlyOpen,y as RenamedForTheTool,v as WithoutTheButton,b as __namedExportsOrder,m as default};