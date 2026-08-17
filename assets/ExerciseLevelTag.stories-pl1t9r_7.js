import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-BDQJEmVY.js";import{a as r,n as i}from"./exerciseMeta-BPNmSuWi.js";import{r as a,t as o}from"./ExerciseTags-BxtVICbI.js";function s(){let[e,t]=(0,c.useState)(`intermediate`);return(0,l.jsx)(`div`,{style:g,children:i.map(n=>(0,l.jsx)(o,{level:n,active:n===e,onClick:()=>{t(n)}},n))})}var c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{c=t(),a(),r(),l=n(),u={title:`Pedagogy/ExerciseLevelTag`,component:o,args:{level:`beginner`},argTypes:{level:{control:`select`,options:i},label:{control:`text`},active:{control:`boolean`}},parameters:{docs:{description:{component:`How hard an exercise or a tutorial step is: green, amber, pink — the same three colours the tutorial strips are painted in.`}}}},d={},f={render:e=>(0,l.jsx)(`div`,{style:g,children:i.map(t=>(0,l.jsx)(o,{level:t,active:e.active},t))})},p={args:{active:!0}},m={render:()=>(0,l.jsx)(s,{})},h={render:()=>(0,l.jsxs)(`div`,{style:g,children:[(0,l.jsx)(o,{level:`beginner`,label:`First year`}),(0,l.jsx)(o,{level:`intermediate`,label:`Second year`}),(0,l.jsx)(o,{level:`advanced`,label:`Master`})]})},g={alignItems:`center`,display:`flex`,gap:6},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => <div style={ROW_STYLE}>
      {LEVEL_ORDER.map(level => <ExerciseLevelTag key={level} level={level} active={args.active} />)}
    </div>
}`,...f.parameters?.docs?.source},description:{story:`The three, in teaching order.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    active: true
  }
}`,...p.parameters?.docs?.source},description:{story:`The selected filter is filled in rather than minimal.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <LevelFilters />
}`,...m.parameters?.docs?.source},description:{story:`As the filter row of an exercise list: a level that is switched off keeps its
own colour, because it is still that level — dropping it to grey would say
the difficulty had changed.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div style={ROW_STYLE}>
      <ExerciseLevelTag level="beginner" label="First year" />
      <ExerciseLevelTag level="intermediate" label="Second year" />
      <ExerciseLevelTag level="advanced" label="Master" />
    </div>
}`,...h.parameters?.docs?.source},description:{story:`A course that names its levels rather than numbering them.`,...h.parameters?.docs?.description}}},_=[`Default`,`EveryLevel`,`Selected`,`AsFilters`,`RenamedForTheCourse`]})))()}v();export{m as AsFilters,d as Default,f as EveryLevel,h as RenamedForTheCourse,p as Selected,_ as __namedExportsOrder,u as default};