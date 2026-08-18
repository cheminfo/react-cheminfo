import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-NhtRTM8t.js";import{n as r,r as i}from"./buttons-IE2sMQRv.js";import{t as a,v as o}from"./pedagogyFixtures-SRQjvSWn.js";function s(e){let{onCheck:t,checkLabel:n=`Check`,checkDisabled:i=!1,onRevealHint:a,hintsRevealed:o=0,hintCount:s=0,onToggleSolution:u,showSolution:d=!1,onReset:f,children:p,className:m}=e;return(0,c.jsxs)(`div`,{className:m,style:l,children:[t!==void 0&&(0,c.jsx)(r,{intent:`primary`,icon:`tick`,text:n,disabled:i,onClick:t}),a!==void 0&&(0,c.jsx)(r,{icon:`lightbulb`,text:`Reveal hint (${Math.min(o,s)}/${s})`,disabled:o>=s,onClick:a}),u!==void 0&&(0,c.jsx)(r,{icon:d?`eye-off`:`key`,text:d?`Hide solution`:`Reveal solution`,onClick:u}),f!==void 0&&(0,c.jsx)(r,{icon:`reset`,text:`Reset`,onClick:f}),p]})}var c,l;function u(){return(u=e((()=>{i(),c=n(),l={display:`flex`,flexWrap:`wrap`,gap:6},s.__docgenInfo={description:`The row of controls under an exercise: Check, Reveal hint, the solution, and
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
@default undefined`}}}})))()}function d(e){let[t,n]=(0,p.useState)(e.hintsRevealed??0),[r,i]=(0,p.useState)(e.showSolution??!1),[a,o]=(0,p.useState)(!1);return(0,m.jsxs)(`div`,{style:w,children:[(0,m.jsx)(s,{...e,hintsRevealed:t,showSolution:r,onCheck:()=>{o(!0)},onRevealHint:()=>{n(e=>e+1)},onToggleSolution:()=>{i(e=>!e)},onReset:()=>{o(!1),n(0),i(!1)}}),a&&(0,m.jsx)(`span`,{style:T,children:`Attempt recorded.`}),r&&(0,m.jsx)(`code`,{style:E,children:h})]})}function f(){}var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{i(),p=t(),u(),o(),m=n(),h=`N[C@@H](C)C(=O)O`,g=e=>(0,m.jsx)(`div`,{style:{width:`min(38rem, 90vw)`},children:(0,m.jsx)(e,{})}),_={title:`Pedagogy/ExerciseActions`,component:s,decorators:[g],args:{hintsRevealed:0,hintCount:a.length},argTypes:{checkLabel:{control:`text`},checkDisabled:{control:`boolean`},showSolution:{control:`boolean`}},parameters:{layout:`padded`,docs:{description:{component:`The row under an exercise — Check, Reveal hint, the solution, Reset — always in that order, so a student moving between two of our tools does not have to look for them.`}}},render:e=>(0,m.jsx)(d,{...e},`${e.hintsRevealed}-${String(e.showSolution)}`)},v={},y={render:()=>(0,m.jsx)(s,{onRevealHint:f,hintsRevealed:1,hintCount:a.length,onToggleSolution:f})},b={args:{checkDisabled:!0}},x={args:{hintsRevealed:a.length}},S={args:{showSolution:!0}},C={args:{children:(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{icon:`diagram-tree`,text:`Show diagram`,onClick:f}),(0,m.jsx)(r,{icon:`cube`,text:`3D view`,onClick:f})]})}},w={alignItems:`flex-start`,display:`flex`,flexDirection:`column`,gap:8},T={color:`#5b6875`,fontSize:12},E={background:`#f5f7fa`,border:`1px solid #dfe3e8`,borderRadius:4,fontFamily:`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`,padding:`4px 8px`},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{}`,...v.parameters?.docs?.source},description:{story:`All four, wired: the hint count climbs and the sample answer appears.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <ExerciseActions onRevealHint={noop} hintsRevealed={1} hintCount={ALANINE_HINTS.length} onToggleSolution={noop} />
}`,...y.parameters?.docs?.source},description:{story:`Leaving a callback out removes its button: a tool that grades on every
keystroke has no Check, and a one-field answer has nothing to reset.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    checkDisabled: true
  }
}`,...b.parameters?.docs?.source},description:{story:`Nothing typed yet, so there is nothing to check.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    hintsRevealed: ALANINE_HINTS.length
  }
}`,...x.parameters?.docs?.source},description:{story:`Every hint read: the button stays, dead, rather than vanishing mid-exercise.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    showSolution: true
  }
}`,...S.parameters?.docs?.source},description:{story:`With the answer on screen, the button offers to put it away again.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    children: <>
        <Button icon="diagram-tree" text="Show diagram" onClick={noop} />
        <Button icon="cube" text="3D view" onClick={noop} />
      </>
  }
}`,...C.parameters?.docs?.source},description:{story:`A tool adds its own buttons after the four standard ones, never before.`,...C.parameters?.docs?.description}}},D=[`Default`,`TwoActions`,`NothingToCheckYet`,`HintsExhausted`,`SolutionShowing`,`WithToolButtons`]})))()}O();export{v as Default,x as HintsExhausted,b as NothingToCheckYet,S as SolutionShowing,y as TwoActions,C as WithToolButtons,D as __namedExportsOrder,_ as default};