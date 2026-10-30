import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-CtxtnG3J.js";import{n,t as r}from"./ExerciseProgressHeader-af5WoEJu.js";import{a as i,i as a,s as o,v as s}from"./pedagogyFixtures-CJW_gw23.js";function c(){}var l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{n(),s(),l=t(),u=e=>(0,l.jsx)(`div`,{style:{width:`min(34rem, 90vw)`},children:(0,l.jsx)(e,{})}),d={title:`Pedagogy/ExerciseProgressHeader`,component:r,decorators:[u],args:{summary:o,onClearAll:c},argTypes:{clearLabel:{control:`text`},clearDisabled:{control:`boolean`}},parameters:{layout:`padded`,docs:{description:{component:`How much of a set is solved, its bar, and the one way to throw the work away — behind a real dialog, because the button costs somebody a week.`}}}},f={},p={render:e=>(0,l.jsx)(r,{summary:e.summary})},m={play:({canvasElement:e})=>{e.querySelector(`button`)?.click()}},h={args:{summary:i,clearDisabled:!0}},g={args:{summary:a}},_={args:{clearLabel:`Start the series over`,clearWarning:`Every answer, hint and solved exercise of this series is forgotten on this browser. There is no undo.`}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source},description:{story:`Four of twelve solved, with the wipe offered.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => <ExerciseProgressHeader summary={args.summary} />
}`,...p.parameters?.docs?.source},description:{story:"No `onClearAll`: the header reports, and the work cannot be lost from here.",...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: ({
    canvasElement
  }) => {
    canvasElement.querySelector('button')?.click();
  }
}`,...m.parameters?.docs?.source},description:{story:"The dialog the button opens, clicked open on load: a native `confirm()` is\nunstyled and dismissed by reflex, which is why this one is a real alert.",...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    summary: FRESH_PROGRESS,
    clearDisabled: true
  }
}`,...h.parameters?.docs?.source},description:{story:`Nothing stored yet, so the wipe is dead rather than merely useless.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    summary: COMPLETE_PROGRESS
  }
}`,...g.parameters?.docs?.source},description:{story:`A finished set is the one thing that turns the bar green.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    clearLabel: 'Start the series over',
    clearWarning: 'Every answer, hint and solved exercise of this series is forgotten on this browser. There is no undo.'
  }
}`,..._.parameters?.docs?.source},description:{story:`Both words belong to the course, not to the component.`,..._.parameters?.docs?.description}}},v=[`Default`,`ReportOnly`,`ConfirmationOpen`,`NothingSolvedYet`,`Finished`,`RenamedForTheCourse`]})))()}y();export{m as ConfirmationOpen,f as Default,g as Finished,h as NothingSolvedYet,_ as RenamedForTheCourse,p as ReportOnly,v as __namedExportsOrder,d as default};