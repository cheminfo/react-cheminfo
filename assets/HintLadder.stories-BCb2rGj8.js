import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-q9lSOsQA.js";import{n as r,t as i}from"./callout-gmjXJe7p.js";import{n as a,r as o}from"./buttons-cHXKETvV.js";import{t as s}from"./clamp-M7_x50VL.js";import{d as c,t as l,v as u}from"./pedagogyFixtures-CJW_gw23.js";import{i as d,n as f,r as p,t as m}from"./GlossaryText-Jgu0wxac.js";function h(e){let{className:t,hints:n,revealed:r,onReveal:o,revealLabel:s=`Reveal hint`,title:c=`Hints`}=e,l=g(r,n.length),u=l>=n.length;return l===0&&(o===void 0||n.length===0)?null:(0,_.jsxs)(`div`,{className:t,style:v,children:[o!==void 0&&n.length>0&&(0,_.jsx)(`div`,{children:(0,_.jsx)(a,{icon:`lightbulb`,text:`${s} (${l}/${n.length})`,disabled:u,onClick:o})}),l>0&&(0,_.jsx)(i,{intent:`primary`,icon:`lightbulb`,title:c,children:(0,_.jsx)(`ol`,{style:y,children:n.slice(0,l).map(e=>(0,_.jsx)(`li`,{style:b,children:(0,_.jsx)(m,{text:e})},e))})})]})}function g(e,t){return Math.floor(s(e,0,t))}var _,v,y,b;function x(){return(x=e((()=>{o(),r(),f(),_=n(),v={display:`flex`,flexDirection:`column`,gap:8},y={margin:0,paddingLeft:18},b={lineHeight:1.45},h.__docgenInfo={description:`The hints asked for so far, and the button that opens the next one.

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
@default 'Hints'`},className:{required:!1,tsType:{name:`string`},description:`Class names added to the root element.
@default undefined`}}}})))()}function S(e){let[t,n]=(0,C.useState)(e.revealed);return(0,w.jsx)(h,{...e,revealed:t,onReveal:()=>{n(e=>e+1)}})}var C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{C=t(),d(),x(),u(),w=n(),T=e=>(0,w.jsx)(p,{glossary:c,children:(0,w.jsx)(`div`,{style:{width:`min(36rem, 90vw)`},children:(0,w.jsx)(e,{})})}),E={title:`Pedagogy/HintLadder`,component:h,decorators:[T],args:{hints:l,revealed:0},argTypes:{revealLabel:{control:`text`},title:{control:`text`}},parameters:{layout:`padded`,docs:{description:{component:`The hints a student has asked for, and the button that opens the next one — the L-alanine exercise of a SMILES course.`}}},render:e=>(0,w.jsx)(S,{...e},e.revealed)},D={},O={args:{revealed:1}},k={args:{revealed:l.length}},A={args:{revealed:2},render:e=>(0,w.jsx)(h,{...e})},j={args:{revealed:1,title:`Nudges`,revealLabel:`Nudge me`}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{}`,...D.parameters?.docs?.source},description:{story:`Click through the three rungs: a nudge, then the construct, then almost the
answer. Opening all three at once would just be the solution.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: 1
  }
}`,...O.parameters?.docs?.source},description:{story:`Coming back to an exercise reopens the rungs that were already read.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: ALANINE_HINTS.length
  }
}`,...k.parameters?.docs?.source},description:{story:`Nothing left to give: the button goes dead rather than disappearing.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: 2
  },
  render: args => <HintLadder {...args} />
}`,...A.parameters?.docs?.source},description:{story:"No `onReveal`: the ladder only reports, because the button lives in `ExerciseActions`.",...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: 1,
    title: 'Nudges',
    revealLabel: 'Nudge me'
  }
}`,...j.parameters?.docs?.source},description:{story:`Both words are the tool's: a course may nudge rather than hint.`,...j.parameters?.docs?.description}}},M=[`Default`,`PartlyOpen`,`Exhausted`,`WithoutTheButton`,`RenamedForTheTool`]})))()}N();export{D as Default,k as Exhausted,O as PartlyOpen,j as RenamedForTheTool,A as WithoutTheButton,M as __namedExportsOrder,E as default};