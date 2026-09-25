import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe--hbB6fy5.js";import{n as r,r as i}from"./familyTokens-DsQXXJV4.js";import{l as a,t as o}from"./spectraFixtures-BpAqNQSa.js";import{n as s,t as c}from"./PrincipalComponentSelect-BNc0zTBY.js";function l(e){let[t,n]=(0,d.useState)(e.value),[r,i]=(0,d.useState)(void 0),[a,o]=(0,d.useState)(e.settings??{});return(0,f.jsxs)(`div`,{style:v,children:[(0,f.jsx)(c,{...e,value:t,settings:e.onSettingsChange===void 0?void 0:a,onChange:t=>{n(t),i(t),e.onChange(t)},onSettingsChange:e.onSettingsChange===void 0?void 0:o}),(0,f.jsx)(`code`,{style:y,children:r===void 0?`Pick an axis to see what the callback receives.`:`onChange({ x: ${String(r.x)}, y: ${String(r.y)} })`})]})}function u(){}var d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{d=t(),s(),i(),a(),f=n(),p={title:`Spectra/PrincipalComponentSelect`,component:c,args:{value:{x:0,y:1},count:6,explainedVariance:o,onChange:u},argTypes:{count:{control:{type:`range`,min:1,max:8,step:1}}},parameters:{layout:`padded`,docs:{description:{component:`Which two components a score plot is drawn against. The labels read PC1 because that is what a chemist writes; the numbers handed back are zero-based columns of the score matrix, because that is what indexes it — the line below is exactly what the callback receives.`}}},render:e=>(0,f.jsx)(`div`,{style:{width:`min(32rem, 92vw)`},children:(0,f.jsx)(l,{...e},String(e.count))})},m={},h={args:{explainedVariance:void 0}},g={args:{settings:{method:`SVD`,center:!0},onSettingsChange:u}},_={args:{count:2,value:{x:3,y:5}}},v={display:`flex`,flexDirection:`column`,gap:10},y={fontSize:12,color:r.textMuted},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source},description:{story:`Six components, each named with the share of the variance it carries.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    explainedVariance: undefined
  }
}`,...h.parameters?.docs?.source},description:{story:`No decomposition to read from, so the components are named and nothing more.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      method: 'SVD',
      center: true
    },
    onSettingsChange: noop
  }
}`,...g.parameters?.docs?.source},description:{story:`The decomposition's own options, offered under the two axes.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    count: 2,
    value: {
      x: 3,
      y: 5
    }
  }
}`,..._.parameters?.docs?.source},description:{story:`Two spectra give two components, and the picker cannot be made to ask for a
third. Drag the count down to one and both axes fall onto it.`,..._.parameters?.docs?.description}}},b=[`Default`,`WithoutVariance`,`WithTheDecomposition`,`OnlyTwoComponents`]})))()}x();export{m as Default,_ as OnlyTwoComponents,g as WithTheDecomposition,h as WithoutVariance,b as __namedExportsOrder,p as default};