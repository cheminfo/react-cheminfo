import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-D72pBctd.js";import{l as r,t as i}from"./spectraFixtures-CXtafxo-.js";import{n as a,t as o}from"./PrincipalComponentSelect-D5sw8flR.js";function s(e){let[t,n]=(0,l.useState)(e.value),[r,i]=(0,l.useState)(void 0),[a,s]=(0,l.useState)(e.settings??{});return(0,u.jsxs)(`div`,{style:g,children:[(0,u.jsx)(o,{...e,value:t,settings:e.onSettingsChange===void 0?void 0:a,onChange:t=>{n(t),i(t),e.onChange(t)},onSettingsChange:e.onSettingsChange===void 0?void 0:s}),(0,u.jsx)(`code`,{style:_,children:r===void 0?`Pick an axis to see what the callback receives.`:`onChange({ x: ${String(r.x)}, y: ${String(r.y)} })`})]})}function c(){}var l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{l=t(),a(),r(),u=n(),d={title:`Spectra/PrincipalComponentSelect`,component:o,args:{value:{x:0,y:1},count:6,explainedVariance:i,onChange:c},argTypes:{count:{control:{type:`range`,min:1,max:8,step:1}}},parameters:{layout:`padded`,docs:{description:{component:`Which two components a score plot is drawn against. The labels read PC1 because that is what a chemist writes; the numbers handed back are zero-based columns of the score matrix, because that is what indexes it — the line below is exactly what the callback receives.`}}},render:e=>(0,u.jsx)(`div`,{style:{width:`min(32rem, 92vw)`},children:(0,u.jsx)(s,{...e},String(e.count))})},f={},p={args:{explainedVariance:void 0}},m={args:{settings:{method:`SVD`,center:!0},onSettingsChange:c}},h={args:{count:2,value:{x:3,y:5}}},g={display:`flex`,flexDirection:`column`,gap:10},_={fontSize:12,color:`var(--text-muted, #5b6875)`},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source},description:{story:`Six components, each named with the share of the variance it carries.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    explainedVariance: undefined
  }
}`,...p.parameters?.docs?.source},description:{story:`No decomposition to read from, so the components are named and nothing more.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      method: 'SVD',
      center: true
    },
    onSettingsChange: noop
  }
}`,...m.parameters?.docs?.source},description:{story:`The decomposition's own options, offered under the two axes.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    count: 2,
    value: {
      x: 3,
      y: 5
    }
  }
}`,...h.parameters?.docs?.source},description:{story:`Two spectra give two components, and the picker cannot be made to ask for a
third. Drag the count down to one and both axes fall onto it.`,...h.parameters?.docs?.description}}},v=[`Default`,`WithoutVariance`,`WithTheDecomposition`,`OnlyTwoComponents`]})))()}y();export{f as Default,h as OnlyTwoComponents,m as WithTheDecomposition,p as WithoutVariance,v as __namedExportsOrder,d as default};