import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-DzkT2GF_.js";import{n as r,t as i}from"./useT-SaARZZCl.js";import{n as a,r as o}from"./buttons-Di_tSBMT.js";import{n as s,r as c}from"./familyTokens-DsQXXJV4.js";import{t as l,v as u}from"./pedagogyFixtures-CJW_gw23.js";function d(e){let{onCheck:t,checkLabel:n,checkDisabled:i=!1,onRevealHint:o,hintsRevealed:s=0,hintCount:c=0,onToggleSolution:l,showSolution:u=!1,onReset:d,children:m,className:h}=e,g=r();return(0,f.jsxs)(`div`,{className:h,style:p,children:[t!==void 0&&(0,f.jsx)(a,{intent:`primary`,icon:`tick`,text:n??g(`pedagogy.check`),disabled:i,onClick:t}),o!==void 0&&(0,f.jsx)(a,{icon:`lightbulb`,text:g(`pedagogy.revealHintCount`,{revealed:Math.min(s,c),total:c}),disabled:s>=c,onClick:o}),l!==void 0&&(0,f.jsx)(a,{icon:u?`eye-off`:`key`,text:g(u?`pedagogy.hideSolution`:`pedagogy.revealSolution`),onClick:l}),d!==void 0&&(0,f.jsx)(a,{icon:`reset`,text:g(`pedagogy.reset`),onClick:d}),m]})}var f,p;function m(){return(m=e((()=>{o(),i(),f=n(),p={display:`flex`,flexWrap:`wrap`,gap:6},d.__docgenInfo={description:`The row of controls under an exercise: Check, Reveal hint, the solution, and
Reset.

Every one of them is optional, because a tool that grades live has no Check
and a tool with a single-field answer has no Reset — what matters is that the
ones a tool does offer read the same and sit in the same order everywhere.
@param props - The actions the exercise offers.
@returns The row.`,methods:[],displayName:`ExerciseActions`,props:{onCheck:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Records the attempt. Grading itself runs on every keystroke, so this
button commits the verdict rather than producing it.
@default undefined — no Check button`},checkLabel:{required:!1,tsType:{name:`string`},description:`Text of the Check button.
@default the chrome's own words for it, in the language of the page`},checkDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether checking is impossible yet — nothing typed, nothing drawn.
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
@default undefined`}}}})))()}function h(e){let[t,n]=(0,_.useState)(e.hintsRevealed??0),[r,i]=(0,_.useState)(e.showSolution??!1),[a,o]=(0,_.useState)(!1);return(0,v.jsxs)(`div`,{style:O,children:[(0,v.jsx)(d,{...e,hintsRevealed:t,showSolution:r,onCheck:()=>{o(!0)},onRevealHint:()=>{n(e=>e+1)},onToggleSolution:()=>{i(e=>!e)},onReset:()=>{o(!1),n(0),i(!1)}}),a&&(0,v.jsx)(`span`,{style:k,children:`Attempt recorded.`}),r&&(0,v.jsx)(`code`,{style:A,children:y})]})}function g(){}var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{o(),_=t(),m(),c(),u(),v=n(),y=`N[C@@H](C)C(=O)O`,b=e=>(0,v.jsx)(`div`,{style:{width:`min(38rem, 90vw)`},children:(0,v.jsx)(e,{})}),x={title:`Pedagogy/ExerciseActions`,component:d,decorators:[b],args:{hintsRevealed:0,hintCount:l.length},argTypes:{checkLabel:{control:`text`},checkDisabled:{control:`boolean`},showSolution:{control:`boolean`}},parameters:{layout:`padded`,docs:{description:{component:`The row under an exercise — Check, Reveal hint, the solution, Reset — always in that order, so a student moving between two of our tools does not have to look for them.`}}},render:e=>(0,v.jsx)(h,{...e},`${e.hintsRevealed}-${String(e.showSolution)}`)},S={},C={render:()=>(0,v.jsx)(d,{onRevealHint:g,hintsRevealed:1,hintCount:l.length,onToggleSolution:g})},w={args:{checkDisabled:!0}},T={args:{hintsRevealed:l.length}},E={args:{showSolution:!0}},D={args:{children:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(a,{icon:`diagram-tree`,text:`Show diagram`,onClick:g}),(0,v.jsx)(a,{icon:`cube`,text:`3D view`,onClick:g})]})}},O={alignItems:`flex-start`,display:`flex`,flexDirection:`column`,gap:8},k={color:s.textMuted,fontSize:12},A={background:s.surfaceSunken,border:`1px solid ${s.border}`,borderRadius:4,fontFamily:`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`,padding:`4px 8px`},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{}`,...S.parameters?.docs?.source},description:{story:`All four, wired: the hint count climbs and the sample answer appears.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <ExerciseActions onRevealHint={noop} hintsRevealed={1} hintCount={ALANINE_HINTS.length} onToggleSolution={noop} />
}`,...C.parameters?.docs?.source},description:{story:`Leaving a callback out removes its button: a tool that grades on every
keystroke has no Check, and a one-field answer has nothing to reset.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    checkDisabled: true
  }
}`,...w.parameters?.docs?.source},description:{story:`Nothing typed yet, so there is nothing to check.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    hintsRevealed: ALANINE_HINTS.length
  }
}`,...T.parameters?.docs?.source},description:{story:`Every hint read: the button stays, dead, rather than vanishing mid-exercise.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    showSolution: true
  }
}`,...E.parameters?.docs?.source},description:{story:`With the answer on screen, the button offers to put it away again.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    children: <>
        <Button icon="diagram-tree" text="Show diagram" onClick={noop} />
        <Button icon="cube" text="3D view" onClick={noop} />
      </>
  }
}`,...D.parameters?.docs?.source},description:{story:`A tool adds its own buttons after the four standard ones, never before.`,...D.parameters?.docs?.description}}},j=[`Default`,`TwoActions`,`NothingToCheckYet`,`HintsExhausted`,`SolutionShowing`,`WithToolButtons`]})))()}M();export{S as Default,T as HintsExhausted,w as NothingToCheckYet,E as SolutionShowing,C as TwoActions,D as WithToolButtons,j as __namedExportsOrder,x as default};