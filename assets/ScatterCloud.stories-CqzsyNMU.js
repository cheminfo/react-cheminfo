import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,f as n,h as r,n as i,o as a,r as o,s}from"./projectionFixtures-C270vcgA.js";import{n as c,t as l}from"./ScatterCloud-CiUnzYiq.js";var u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{c(),r(),u={title:`Scatter/ScatterCloud`,component:l,args:{x:a,y:s,z:t,width:760,height:520,xLabel:`PC1`,yLabel:`PC2`,zLabel:`PC3`,groupOf:o,groups:i,ellipsoid:{kind:`coverage`,probability:.95}},parameters:{layout:`padded`,docs:{description:{component:`The flat scatter with one axis more: drag to turn the box, scroll to zoom it, and switch the drag to Select to lasso a crowd. The three axes share one scale, because a solid seen from an angle has nowhere to write three sets of tick labels — the frame names them instead. It is drawn in SVG, so the figure saves as one.`}}}},d={},f={args:{ellipsoid:null}},p={args:{gesture:`select`}},m={args:{showGroupLabels:!0}},h={args:{pointLabels:n.ids}},g={args:{camera:{yaw:0,pitch:0}}},_={args:{outlinedFrom:120}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source},description:{story:`Three species of iris, each inside the shell that holds 95% of it.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ellipsoid: null
  }
}`,...f.parameters?.docs?.source},description:{story:`With the shells off, which is how a reader looks for a group nobody named.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    gesture: 'select'
  }
}`,...p.parameters?.docs?.source},description:{story:`A drag draws a lasso instead of turning the box, exactly as on the map.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    showGroupLabels: true
  }
}`,...m.parameters?.docs?.source},description:{story:`Each species named once, over the middle of its own crowd.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    pointLabels: IRIS_SAMPLES.ids
  }
}`,...h.parameters?.docs?.source},description:{story:`Every flower named, which is what a reader does with forty samples and not
a hundred and fifty — the labels that cannot be fitted are dropped rather
than written over each other.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    camera: {
      yaw: 0,
      pitch: 0
    }
  }
}`,...g.parameters?.docs?.source},description:{story:`Seen square on, which is the one viewpoint the cloud never opens at: two of
the three axes lie along the screen's own and the third collapses, so a whole
component is hidden until the box is turned.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    outlinedFrom: 120
  }
}`,..._.parameters?.docs?.source},description:{story:`The last thirty flowers placed on a finished model, drawn hollow. It is the
same distinction the map draws, and it matters more here: a hollow dot
landing outside every shell is the finding.`,..._.parameters?.docs?.description}}},v=[`Default`,`NoShells`,`Lasso`,`NamedGroups`,`NamedSamples`,`SquareOn`,`ProjectedSamples`]})))()}y();export{d as Default,p as Lasso,m as NamedGroups,h as NamedSamples,f as NoShells,_ as ProjectedSamples,g as SquareOn,v as __namedExportsOrder,u as default};