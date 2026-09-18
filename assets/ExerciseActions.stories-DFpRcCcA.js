import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-CsHOwSWu.js";import{n as r,r as i}from"./buttons-BTpGwZ-U.js";import{n as a,r as o}from"./familyTokens-DsQXXJV4.js";import{t as s,v as c}from"./pedagogyFixtures-CJW_gw23.js";function l(e){let{onCheck:t,checkLabel:n=`Check`,checkDisabled:i=!1,onRevealHint:a,hintsRevealed:o=0,hintCount:s=0,onToggleSolution:c,showSolution:l=!1,onReset:f,children:p,className:m}=e;return(0,u.jsxs)(`div`,{className:m,style:d,children:[t!==void 0&&(0,u.jsx)(r,{intent:`primary`,icon:`tick`,text:n,disabled:i,onClick:t}),a!==void 0&&(0,u.jsx)(r,{icon:`lightbulb`,text:`Reveal hint (${Math.min(o,s)}/${s})`,disabled:o>=s,onClick:a}),c!==void 0&&(0,u.jsx)(r,{icon:l?`eye-off`:`key`,text:l?`Hide solution`:`Reveal solution`,onClick:c}),f!==void 0&&(0,u.jsx)(r,{icon:`reset`,text:`Reset`,onClick:f}),p]})}var u,d;function f(){return(f=e((()=>{i(),u=n(),d={display:`flex`,flexWrap:`wrap`,gap:6},l.__docgenInfo={description:`The row of controls under an exercise: Check, Reveal hint, the solution, and
Reset.

Every one of them is optional, because a tool that grades live has no Check
and a tool with a single-field answer has no Reset — what matters is that the
ones a tool does offer read the same and sit in the same order everywhere.
@param props - The actions the exercise offers.
@returns The row.`,methods:[],displayName:`ExerciseActions`,props:{onCheck:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Records the attempt. Grading itself runs on every keystroke, so this
button commits the verdict rather than producing it.
@default undefined — no Check button`},checkLabel:{required:!1,tsType:{name:`string`},description:`Text of the Check button.
@default 'Check'`},checkDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether checking is impossible yet — nothing typed, nothing drawn.
@default false`},onRevealHint:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Opens the next hint.
@default undefined — no hint button; the ladder may carry its own`},hintsRevealed:{required:!1,tsType:{name:`number`},description:`How many hints are already open, for the button's count.
@default 0`},hintCount:{required:!1,tsType:{name:`number`},description:`How many hints the exercise has, for the button's count.
@default 0`},onToggleSolution:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Shows or hides the sample answer. Never gated behind anything: getting
stuck and reading the answer is part of how the intuition is built.
@default undefined — no solution button`},showSolution:{required:!1,tsType:{name:`boolean`},description:`Whether the sample answer is on screen, which is what the button offers to
undo.
@default false`},onReset:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Puts the exercise back to a blank answer, no hints and no solution.
@default undefined — no Reset button`},children:{required:!1,tsType:{name:`ReactNode`},description:`The buttons this tool adds — show the diagram, show the 3D view — rendered
after the four standard ones.
@default undefined`},className:{required:!1,tsType:{name:`string`},description:`Class the row carries, so a site can reach it from its stylesheet.
@default undefined`}}}})))()}function p(e){let[t,n]=(0,h.useState)(e.hintsRevealed??0),[r,i]=(0,h.useState)(e.showSolution??!1),[a,o]=(0,h.useState)(!1);return(0,g.jsxs)(`div`,{style:E,children:[(0,g.jsx)(l,{...e,hintsRevealed:t,showSolution:r,onCheck:()=>{o(!0)},onRevealHint:()=>{n(e=>e+1)},onToggleSolution:()=>{i(e=>!e)},onReset:()=>{o(!1),n(0),i(!1)}}),a&&(0,g.jsx)(`span`,{style:D,children:`Attempt recorded.`}),r&&(0,g.jsx)(`code`,{style:O,children:_})]})}function m(){}var h,g,_,v,y,b,x,S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{i(),h=t(),f(),o(),c(),g=n(),_=`N[C@@H](C)C(=O)O`,v=e=>(0,g.jsx)(`div`,{style:{width:`min(38rem, 90vw)`},children:(0,g.jsx)(e,{})}),y={title:`Pedagogy/ExerciseActions`,component:l,decorators:[v],args:{hintsRevealed:0,hintCount:s.length},argTypes:{checkLabel:{control:`text`},checkDisabled:{control:`boolean`},showSolution:{control:`boolean`}},parameters:{layout:`padded`,docs:{description:{component:`The row under an exercise — Check, Reveal hint, the solution, Reset — always in that order, so a student moving between two of our tools does not have to look for them.`}}},render:e=>(0,g.jsx)(p,{...e},`${e.hintsRevealed}-${String(e.showSolution)}`)},b={},x={render:()=>(0,g.jsx)(l,{onRevealHint:m,hintsRevealed:1,hintCount:s.length,onToggleSolution:m})},S={args:{checkDisabled:!0}},C={args:{hintsRevealed:s.length}},w={args:{showSolution:!0}},T={args:{children:(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(r,{icon:`diagram-tree`,text:`Show diagram`,onClick:m}),(0,g.jsx)(r,{icon:`cube`,text:`3D view`,onClick:m})]})}},E={alignItems:`flex-start`,display:`flex`,flexDirection:`column`,gap:8},D={color:a.textMuted,fontSize:12},O={background:a.surfaceSunken,border:`1px solid ${a.border}`,borderRadius:4,fontFamily:`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`,padding:`4px 8px`},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{}`,...b.parameters?.docs?.source},description:{story:`All four, wired: the hint count climbs and the sample answer appears.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <ExerciseActions onRevealHint={noop} hintsRevealed={1} hintCount={ALANINE_HINTS.length} onToggleSolution={noop} />
}`,...x.parameters?.docs?.source},description:{story:`Leaving a callback out removes its button: a tool that grades on every
keystroke has no Check, and a one-field answer has nothing to reset.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    checkDisabled: true
  }
}`,...S.parameters?.docs?.source},description:{story:`Nothing typed yet, so there is nothing to check.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    hintsRevealed: ALANINE_HINTS.length
  }
}`,...C.parameters?.docs?.source},description:{story:`Every hint read: the button stays, dead, rather than vanishing mid-exercise.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    showSolution: true
  }
}`,...w.parameters?.docs?.source},description:{story:`With the answer on screen, the button offers to put it away again.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    children: <>
        <Button icon="diagram-tree" text="Show diagram" onClick={noop} />
        <Button icon="cube" text="3D view" onClick={noop} />
      </>
  }
}`,...T.parameters?.docs?.source},description:{story:`A tool adds its own buttons after the four standard ones, never before.`,...T.parameters?.docs?.description}}},k=[`Default`,`TwoActions`,`NothingToCheckYet`,`HintsExhausted`,`SolutionShowing`,`WithToolButtons`]})))()}A();export{b as Default,C as HintsExhausted,S as NothingToCheckYet,w as SolutionShowing,x as TwoActions,T as WithToolButtons,k as __namedExportsOrder,y as default};