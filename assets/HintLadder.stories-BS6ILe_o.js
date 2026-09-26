import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-DzkT2GF_.js";import{n as r,t as i}from"./useT-SaARZZCl.js";import{n as a,t as o}from"./callout-BQAlT1ts.js";import{n as s,r as c}from"./buttons-Di_tSBMT.js";import{t as l}from"./clamp-M7_x50VL.js";import{d as u,t as d,v as f}from"./pedagogyFixtures-CJW_gw23.js";import{i as p,n as m,r as h,t as g}from"./GlossaryText-Br51uPT7.js";function _(e){let{className:t,hints:n,revealed:i,onReveal:a,revealLabel:c,title:l}=e,u=r(),d=v(i,n.length),f=d>=n.length;return d===0&&(a===void 0||n.length===0)?null:(0,y.jsxs)(`div`,{className:t,style:b,children:[a!==void 0&&n.length>0&&(0,y.jsx)(`div`,{children:(0,y.jsx)(s,{icon:`lightbulb`,text:u(`pedagogy.revealHintLadder`,{label:c??u(`pedagogy.revealHint`),open:d,total:n.length}),disabled:f,onClick:a})}),d>0&&(0,y.jsx)(o,{intent:`primary`,icon:`lightbulb`,title:l??u(`pedagogy.hints`),children:(0,y.jsx)(`ol`,{style:x,children:n.slice(0,d).map(e=>(0,y.jsx)(`li`,{style:S,children:(0,y.jsx)(g,{text:e})},e))})})]})}function v(e,t){return Math.floor(l(e,0,t))}var y,b,x,S;function C(){return(C=e((()=>{c(),a(),i(),m(),y=n(),b={display:`flex`,flexDirection:`column`,gap:8},x={margin:0,paddingLeft:18},S={lineHeight:1.45},_.__docgenInfo={description:`The hints asked for so far, and the button that opens the next one.

One at a time, in order: a ladder that dumped all four at once is a solution
with extra steps. The prose goes through the glossary, so a hint may link its
jargon exactly like the statement above it.
@param props - The ladder, how much of it is open, and how to open more.
@returns The hints, or nothing while none is open and none can be.`,methods:[],displayName:`HintLadder`,props:{hints:{required:!0,tsType:{name:`unknown`},description:`Every hint of the exercise, ordered from a nudge to almost the answer.`},revealed:{required:!0,tsType:{name:`number`},description:`How many the student has asked for. A count outside the ladder is read as
one of its ends, so a stored value from a shorter or longer ladder still
opens the page.`},onReveal:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Opens the next hint. Leave it out where the button lives elsewhere — in
\`ExerciseActions\`, say — and the ladder only shows what is already open.
@default undefined — no button`},revealLabel:{required:!1,tsType:{name:`string`},description:`Text of the button, before its count.
@default the chrome's own words for it, in the language of the page`},title:{required:!1,tsType:{name:`string`},description:`Heading over the hints.
@default the chrome's own words for it, in the language of the page`},className:{required:!1,tsType:{name:`string`},description:`Class names added to the root element.
@default undefined`}}}})))()}function w(e){let[t,n]=(0,T.useState)(e.revealed);return(0,E.jsx)(_,{...e,revealed:t,onReveal:()=>{n(e=>e+1)}})}var T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{T=t(),p(),C(),f(),E=n(),D=e=>(0,E.jsx)(h,{glossary:u,children:(0,E.jsx)(`div`,{style:{width:`min(36rem, 90vw)`},children:(0,E.jsx)(e,{})})}),O={title:`Pedagogy/HintLadder`,component:_,decorators:[D],args:{hints:d,revealed:0},argTypes:{revealLabel:{control:`text`},title:{control:`text`}},parameters:{layout:`padded`,docs:{description:{component:`The hints a student has asked for, and the button that opens the next one — the L-alanine exercise of a SMILES course.`}}},render:e=>(0,E.jsx)(w,{...e},e.revealed)},k={},A={args:{revealed:1}},j={args:{revealed:d.length}},M={args:{revealed:2},render:e=>(0,E.jsx)(_,{...e})},N={args:{revealed:1,title:`Nudges`,revealLabel:`Nudge me`}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{}`,...k.parameters?.docs?.source},description:{story:`Click through the three rungs: a nudge, then the construct, then almost the
answer. Opening all three at once would just be the solution.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: 1
  }
}`,...A.parameters?.docs?.source},description:{story:`Coming back to an exercise reopens the rungs that were already read.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: ALANINE_HINTS.length
  }
}`,...j.parameters?.docs?.source},description:{story:`Nothing left to give: the button goes dead rather than disappearing.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: 2
  },
  render: args => <HintLadder {...args} />
}`,...M.parameters?.docs?.source},description:{story:"No `onReveal`: the ladder only reports, because the button lives in `ExerciseActions`.",...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    revealed: 1,
    title: 'Nudges',
    revealLabel: 'Nudge me'
  }
}`,...N.parameters?.docs?.source},description:{story:`Both words are the tool's: a course may nudge rather than hint.`,...N.parameters?.docs?.description}}},P=[`Default`,`PartlyOpen`,`Exhausted`,`WithoutTheButton`,`RenamedForTheTool`]})))()}F();export{k as Default,j as Exhausted,A as PartlyOpen,N as RenamedForTheTool,M as WithoutTheButton,P as __namedExportsOrder,O as default};