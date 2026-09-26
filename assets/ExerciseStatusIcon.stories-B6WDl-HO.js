import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-BOZq8J-5.js";import{n,r}from"./familyTokens-DsQXXJV4.js";import{n as i,r as a,t as o}from"./ExerciseTags-B_44M3xX.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{a(),r(),s=t(),c=[`idle`,`attempted`,`solved`],l=[{title:`Ethanol`,level:`beginner`,status:`solved`},{title:`Propan-2-ol`,level:`beginner`,status:`attempted`},{title:`Methane`,level:`beginner`,status:`idle`},{title:`Acetic acid`,level:`intermediate`,status:`solved`},{title:`Benzene`,level:`intermediate`,status:`attempted`},{title:`Cyclohexane`,level:`intermediate`,status:`idle`},{title:`L-alanine`,level:`advanced`,status:`solved`},{title:`Paracetamol`,level:`advanced`,status:`attempted`},{title:`Naphthalene`,level:`advanced`,status:`idle`}],u={title:`Pedagogy/ExerciseStatusIcon`,component:i,args:{status:`solved`},argTypes:{status:{control:`select`,options:c},title:{control:`text`},size:{control:{type:`range`,min:12,max:48,step:2}}},parameters:{docs:{description:{component:"The glyph in front of an exercise title: an empty circle, a warning sign, a tick. `idle` is the one uncoloured value in the package — a list nobody has opened must not read as a list of mistakes."}}}},d={},f={render:e=>(0,s.jsx)(`div`,{style:g,children:c.map(t=>(0,s.jsxs)(`span`,{style:_,children:[(0,s.jsx)(i,{status:t,size:e.size}),t]},t))})},p={parameters:{layout:`padded`},render:()=>(0,s.jsx)(`ul`,{style:v,children:l.map(e=>(0,s.jsxs)(`li`,{style:y,children:[(0,s.jsx)(i,{status:e.status}),(0,s.jsx)(`span`,{style:{flex:`1 1 auto`},children:e.title}),(0,s.jsx)(o,{level:e.level})]},e.title))})},m={args:{size:32}},h={args:{status:`attempted`,title:`Handed in, not right yet`}},g={alignItems:`center`,display:`flex`,gap:16},_={alignItems:`center`,color:n.textMuted,display:`flex`,fontSize:13,gap:6},v={display:`flex`,flexDirection:`column`,gap:2,listStyle:`none`,margin:0,padding:0,width:`min(28rem, 92vw)`},y={alignItems:`center`,borderTop:`1px solid ${n.border}`,display:`flex`,gap:8,padding:`5px 2px`},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => <div style={ROW_STYLE}>
      {STATUSES.map(status => <span key={status} style={PAIR_STYLE}>
          <ExerciseStatusIcon status={status} size={args.size} />
          {status}
        </span>)}
    </div>
}`,...f.parameters?.docs?.source},description:{story:`The three, with the words they stand for.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source},description:{story:`Every level against every status, as the exercise list of a set draws them.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    size: 32
  }
}`,...m.parameters?.docs?.source},description:{story:`Big enough for a summary card, rather than for a line of a list.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'attempted',
    title: 'Handed in, not right yet'
  }
}`,...h.parameters?.docs?.source},description:{story:`What the pointer and a screen reader are told, in the course's words.`,...h.parameters?.docs?.description}}},b=[`Default`,`EveryStatus`,`TheExerciseList`,`Large`,`Announced`]})))()}x();export{h as Announced,d as Default,f as EveryStatus,m as Large,p as TheExerciseList,b as __namedExportsOrder,u as default};