import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-sQLul146.js";import{n,r,t as i}from"./ExerciseTags-PYk_iOM8.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{r(),a=t(),o=[`idle`,`attempted`,`solved`],s=[{title:`Ethanol`,level:`beginner`,status:`solved`},{title:`Propan-2-ol`,level:`beginner`,status:`attempted`},{title:`Methane`,level:`beginner`,status:`idle`},{title:`Acetic acid`,level:`intermediate`,status:`solved`},{title:`Benzene`,level:`intermediate`,status:`attempted`},{title:`Cyclohexane`,level:`intermediate`,status:`idle`},{title:`L-alanine`,level:`advanced`,status:`solved`},{title:`Paracetamol`,level:`advanced`,status:`attempted`},{title:`Naphthalene`,level:`advanced`,status:`idle`}],c={title:`Pedagogy/ExerciseStatusIcon`,component:n,args:{status:`solved`},argTypes:{status:{control:`select`,options:o},title:{control:`text`},size:{control:{type:`range`,min:12,max:48,step:2}}},parameters:{docs:{description:{component:"The glyph in front of an exercise title: an empty circle, a warning sign, a tick. `idle` is the one uncoloured value in the package — a list nobody has opened must not read as a list of mistakes."}}}},l={},u={render:e=>(0,a.jsx)(`div`,{style:m,children:o.map(t=>(0,a.jsxs)(`span`,{style:h,children:[(0,a.jsx)(n,{status:t,size:e.size}),t]},t))})},d={parameters:{layout:`padded`},render:()=>(0,a.jsx)(`ul`,{style:g,children:s.map(e=>(0,a.jsxs)(`li`,{style:_,children:[(0,a.jsx)(n,{status:e.status}),(0,a.jsx)(`span`,{style:{flex:`1 1 auto`},children:e.title}),(0,a.jsx)(i,{level:e.level})]},e.title))})},f={args:{size:32}},p={args:{status:`attempted`,title:`Handed in, not right yet`}},m={alignItems:`center`,display:`flex`,gap:16},h={alignItems:`center`,color:`#5b6875`,display:`flex`,fontSize:13,gap:6},g={display:`flex`,flexDirection:`column`,gap:2,listStyle:`none`,margin:0,padding:0,width:`min(28rem, 92vw)`},_={alignItems:`center`,borderTop:`1px solid var(--border, #dfe3e8)`,display:`flex`,gap:8,padding:`5px 2px`},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: args => <div style={ROW_STYLE}>
      {STATUSES.map(status => <span key={status} style={PAIR_STYLE}>
          <ExerciseStatusIcon status={status} size={args.size} />
          {status}
        </span>)}
    </div>
}`,...u.parameters?.docs?.source},description:{story:`The three, with the words they stand for.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: () => <ul style={LIST_STYLE}>
      {LIST.map(entry => <li key={entry.title} style={ITEM_STYLE}>
          <ExerciseStatusIcon status={entry.status} />
          <span style={{
        flex: '1 1 auto'
      }}>{entry.title}</span>
          <ExerciseLevelTag level={entry.level} />
        </li>)}
    </ul>
}`,...d.parameters?.docs?.source},description:{story:`Every level against every status, as the exercise list of a set draws them.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    size: 32
  }
}`,...f.parameters?.docs?.source},description:{story:`Big enough for a summary card, rather than for a line of a list.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'attempted',
    title: 'Handed in, not right yet'
  }
}`,...p.parameters?.docs?.source},description:{story:`What the pointer and a screen reader are told, in the course's words.`,...p.parameters?.docs?.description}}},v=[`Default`,`EveryStatus`,`TheExerciseList`,`Large`,`Announced`]})))()}y();export{p as Announced,l as Default,u as EveryStatus,f as Large,d as TheExerciseList,v as __namedExportsOrder,c as default};