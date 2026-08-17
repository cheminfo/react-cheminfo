import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-DqsyC3lB.js";import{n as r,t as i}from"./callout-KnrsBc4c.js";import{n as a,r as o}from"./buttons-Cer5GlUI.js";import{d as s,t as c,v as l}from"./pedagogyFixtures-SRQjvSWn.js";import{i as u,n as d,r as f,t as p}from"./GlossaryText-BSjzSE6F.js";function m(e){let{hints:t,revealed:n,onReveal:r,revealLabel:o=`Reveal hint`,title:s=`Hints`}=e,c=h(n,t.length),l=c>=t.length;return c===0&&(r===void 0||t.length===0)?null:(0,g.jsxs)(`div`,{style:_,children:[r!==void 0&&t.length>0&&(0,g.jsx)(`div`,{children:(0,g.jsx)(a,{icon:`lightbulb`,text:`${o} (${c}/${t.length})`,disabled:l,onClick:r})}),c>0&&(0,g.jsx)(i,{intent:`primary`,icon:`lightbulb`,title:s,children:(0,g.jsx)(`ol`,{style:v,children:t.slice(0,c).map(e=>(0,g.jsx)(`li`,{style:y,children:(0,g.jsx)(p,{text:e})},e))})})]})}function h(e,t){return!Number.isFinite(e)||e<=0?0:Math.min(Math.floor(e),t)}var g,_,v,y;function b(){return(b=e((()=>{o(),r(),d(),g=n(),_={display:`flex`,flexDirection:`column`,gap:8},v={margin:0,paddingLeft:18},y={lineHeight:1.45},m.__docgenInfo={description:`The hints asked for so far, and the button that opens the next one.

One at a time, in order: a ladder that dumped all four at once is a solution
with extra steps. The prose goes through the glossary, so a hint may link its
jargon exactly like the statement above it.
@param props - The ladder, how much of it is open, and how to open more.
@returns The hints, or nothing while none is open and none can be.`,methods:[],displayName:`HintLadder`,props:{hints:{required:!0,tsType:{name:`unknown`},description:`Every hint of the exercise, ordered from a nudge to almost the answer.`},revealed:{required:!0,tsType:{name:`number`},description:`How many the student has asked for. A count outside the ladder is read as
one of its ends, so a stored value from a shorter or longer ladder still
opens the page.`},onReveal:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Opens the next hint. Leave it out where the button lives elsewhere — in
\`ExerciseActions\`, say — and the ladder only shows what is already open.
@default undefined — no button`},revealLabel:{required:!1,tsType:{name:`string`},description:`Text of the button, before its count.
@default 'Reveal hint'`},title:{required:!1,tsType:{name:`string`},description:`Heading over the hints.
@default 'Hints'`}}}})))()}function x(e){let[t,n]=(0,S.useState)(e.revealed);return(0,C.jsx)(m,{...e,revealed:t,onReveal:()=>{n(e=>e+1)}})}var S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{S=t(),u(),b(),l(),C=n(),w=e=>(0,C.jsx)(f,{glossary:s,children:(0,C.jsx)(`div`,{style:{width:`min(36rem, 90vw)`},children:(0,C.jsx)(e,{})})}),T={title:`Pedagogy/HintLadder`,component:m,decorators:[w],args:{hints:c,revealed:0},argTypes:{revealLabel:{control:`text`},title:{control:`text`}},parameters:{layout:`padded`,docs:{description:{component:`The hints a student has asked for, and the button that opens the next one — the L-alanine exercise of a SMILES course.`}}},render:e=>(0,C.jsx)(x,{...e},e.revealed)},E={},D={args:{revealed:1}},O={args:{revealed:c.length}},k={args:{revealed:2},render:e=>(0,C.jsx)(m,{...e})},A={args:{revealed:1,title:`Nudges`,revealLabel:`Nudge me`}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{}`,...E.parameters?.docs?.source},description:{story:`Click through the three rungs: a nudge, then the construct, then almost the
answer. Opening all three at once would just be the solution.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: 1
  }
}`,...D.parameters?.docs?.source},description:{story:`Coming back to an exercise reopens the rungs that were already read.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: ALANINE_HINTS.length
  }
}`,...O.parameters?.docs?.source},description:{story:`Nothing left to give: the button goes dead rather than disappearing.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: 2
  },
  render: args => <HintLadder {...args} />
}`,...k.parameters?.docs?.source},description:{story:"No `onReveal`: the ladder only reports, because the button lives in `ExerciseActions`.",...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: 1,
    title: 'Nudges',
    revealLabel: 'Nudge me'
  }
}`,...A.parameters?.docs?.source},description:{story:`Both words are the tool's: a course may nudge rather than hint.`,...A.parameters?.docs?.description}}},j=[`Default`,`PartlyOpen`,`Exhausted`,`WithoutTheButton`,`RenamedForTheTool`]})))()}M();export{E as Default,O as Exhausted,D as PartlyOpen,A as RenamedForTheTool,k as WithoutTheButton,j as __namedExportsOrder,T as default};