import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-CsLeyY0n.js";import{n as r,t as i}from"./FilterChainEditor-BZ7O6MAU.js";import{a,l as o,n as s,s as c}from"./spectraFixtures-BWWY7JJE.js";function l(e){let[t,n]=(0,d.useState)(e.value);return(0,f.jsx)(i,{...e,value:t,onChange:t=>{n(t),e.onChange(t)}})}function u(){}var d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{d=t(),r(),o(),f=n(),p={title:`Spectra/FilterChainEditor`,component:i,args:{value:s,onChange:u},argTypes:{resampleFirst:{control:`boolean`}},parameters:{layout:`padded`,docs:{description:{component:`The ordered pipeline every spectrum goes through, one step at a time. The order is the meaning: scaling measured before a baseline is levelled measures an offset that is about to change, and the editor says so.`}}},render:e=>(0,f.jsx)(`div`,{style:{width:`min(46rem, 94vw)`},children:(0,f.jsx)(l,{...e},String(e.resampleFirst))})},m={},h={args:{value:c}},g={args:{value:[]}},_={args:{value:a}},v={args:{value:s,resampleFirst:!0}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source},description:{story:`A worked-up infrared run: level the baseline, smooth, normalize to 100.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    value: SNV_CHAIN
  }
}`,...h.parameters?.docs?.source},description:{story:`Standard normal variate, the two steps that carry most near-infrared work.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    value: []
  }
}`,...g.parameters?.docs?.source},description:{story:`Nothing yet — the spectra are only put on a common grid.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    value: MUDDLED_CHAIN
  }
}`,..._.parameters?.docs?.source},description:{story:`The same three steps in the wrong order. Scaling runs before the baseline it
depends on, and a step that does nothing sits at the end; move the first one
down with its arrow and the advice goes away.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    value: IR_CHAIN,
    resampleFirst: true
  }
}`,...v.parameters?.docs?.source},description:{story:`Resampling first. Every range in the chain is then read on the new grid, and
a crop here would leave the spectra on grids that no longer line up.`,...v.parameters?.docs?.description}}},y=[`Default`,`StandardNormalVariate`,`Empty`,`AdviceOnTheOrder`,`ResampleFirst`]})))()}b();export{_ as AdviceOnTheOrder,m as Default,g as Empty,v as ResampleFirst,h as StandardNormalVariate,y as __namedExportsOrder,p as default};