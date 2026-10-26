import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-HpGsPPW3.js";import{n as r,r as i}from"./buttons-DFHnQKDU.js";import{n as a,r as o}from"./familyTokens-DsQXXJV4.js";import{n as s,t as c}from"./ExerciseActions-CSYOQtPO.js";import{t as l,v as u}from"./pedagogyFixtures-CJW_gw23.js";function d(e){let[t,n]=(0,p.useState)(e.hintsRevealed??0),[r,i]=(0,p.useState)(e.showSolution??!1),[a,o]=(0,p.useState)(!1);return(0,m.jsxs)(`div`,{style:w,children:[(0,m.jsx)(c,{...e,hintsRevealed:t,showSolution:r,onCheck:()=>{o(!0)},onRevealHint:()=>{n(e=>e+1)},onToggleSolution:()=>{i(e=>!e)},onReset:()=>{o(!1),n(0),i(!1)}}),a&&(0,m.jsx)(`span`,{style:T,children:`Attempt recorded.`}),r&&(0,m.jsx)(`code`,{style:E,children:h})]})}function f(){}var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{i(),p=t(),s(),o(),u(),m=n(),h=`N[C@@H](C)C(=O)O`,g=e=>(0,m.jsx)(`div`,{style:{width:`min(38rem, 90vw)`},children:(0,m.jsx)(e,{})}),_={title:`Pedagogy/ExerciseActions`,component:c,decorators:[g],args:{hintsRevealed:0,hintCount:l.length},argTypes:{checkLabel:{control:`text`},checkDisabled:{control:`boolean`},showSolution:{control:`boolean`}},parameters:{layout:`padded`,docs:{description:{component:`The row under an exercise — Check, Reveal hint, the solution, Reset — always in that order, so a student moving between two of our tools does not have to look for them.`}}},render:e=>(0,m.jsx)(d,{...e},`${e.hintsRevealed}-${String(e.showSolution)}`)},v={},y={render:()=>(0,m.jsx)(c,{onRevealHint:f,hintsRevealed:1,hintCount:l.length,onToggleSolution:f})},b={args:{checkDisabled:!0}},x={args:{hintsRevealed:l.length}},S={args:{showSolution:!0}},C={args:{children:(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(r,{icon:`diagram-tree`,text:`Show diagram`,onClick:f}),(0,m.jsx)(r,{icon:`cube`,text:`3D view`,onClick:f})]})}},w={alignItems:`flex-start`,display:`flex`,flexDirection:`column`,gap:8},T={color:a.textMuted,fontSize:12},E={background:a.surfaceSunken,border:`1px solid ${a.border}`,borderRadius:4,fontFamily:`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`,padding:`4px 8px`},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{}`,...v.parameters?.docs?.source},description:{story:`All four, wired: the hint count climbs and the sample answer appears.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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