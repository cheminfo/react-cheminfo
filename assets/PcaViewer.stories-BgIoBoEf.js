import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-D72pBctd.js";import{a as r,b as i,c as a,d as o,f as s,i as c,m as l,t as u,u as d,x as f}from"./projectionFixtures-DkPtYRxh.js";import{n as p,t as m}from"./ProjectionViewer-CRcO2uNB.js";function h(e){let{pca:t,rows:n,projected:r,variables:i,scores:a,scaled:o,count:s,valueLabel:c,signConvention:l,...u}=e,d=(0,g.useMemo)(()=>f(t,{rows:n,projected:r,variables:i,scores:a,scaled:o,count:s,valueLabel:c,signConvention:l}),[s,t,r,n,o,a,l,c,i]);return(0,_.jsx)(m,{...u,result:d})}var g,_;function v(){return(v=e((()=>{g=t(),i(),p(),_=n(),h.__docgenInfo={description:`A fitted principal component analysis, shown as a map a reader can
interrogate.

It is {@link ProjectionViewer} with one call in front of it: everything the
four tabs draw is built by \`pcaResult\` into the same record a k-means or a
UMAP run fills in by hand, and no tab, no layer and no callback below this
line knows what a principal component is.

\`projected\` is the reason to reach for this rather than call \`pcaResult\`
first: samples handed to it took no part in choosing where the axes point,
so the map draws them hollow and says so, and a reader can see at a glance
which points the model has already accounted for and which it is being asked
about.
@param props - See {@link PcaViewerProps}.
@returns The viewer.`,methods:[],displayName:`PcaViewer`,props:{pca:{required:!0,tsType:{name:`PcaLike`},description:"The fitted model. It is described structurally, so `ml-pca`'s `PCA`\nsatisfies it as it is and this package never imports `ml-pca`."}},composes:[`Omit`]}})))()}var y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{v(),l(),y=n(),b={title:`Projection/PcaViewer`,component:h,args:{pca:a,rows:d,samples:o,variables:s,valueLabel:`Size (cm)`,scaled:!0},parameters:{layout:`padded`,docs:{description:{component:"A fitted principal component model handed to a reader who has never met one: a map of their own samples they can lasso and point at, and three further tabs that answer, in their own words, what the map is made of. Every figure below is Fisher’s 150 iris flowers and a real `ml-pca` model of their four measurements."}}},render:e=>(0,y.jsx)(`div`,{style:D,children:(0,y.jsx)(h,{...e})})},x={},S={args:{defaultTab:`pairs`}},C={args:{defaultTab:`variables`}},w={args:{defaultTab:`shares`}},T={args:{pca:r,rows:u,projected:c}},E={args:{panels:[`map`]}},D={width:`min(64rem, 100%)`},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{}`,...x.parameters?.docs?.source},description:{story:`The map, which is where every reader starts: one dot per flower, the three
species in colour, and an outline around each. Drag a loop around a crowd,
or rest on a dot to see what was measured on that flower.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    defaultTab: 'pairs'
  }
}`,...S.parameters?.docs?.source},description:{story:`The same map drawn for every pair of components. Clicking a cell promotes
that pair onto the map tab, which is how a reader gets from "the third
component seems to separate something" to looking at it.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    defaultTab: 'variables'
  }
}`,...C.parameters?.docs?.source},description:{story:`What each component is made of, drawn as the average flower pushed to each
end of it. The bars are named because the model was handed the names of the
four measurements, so the panel says petal length rather than column 3.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    defaultTab: 'shares'
  }
}`,...w.parameters?.docs?.source},description:{story:`How much of the differences between the flowers each component accounts
for, with the running total over it. On iris the first two carry almost all
of it, which is why the map is worth reading at all.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    pca: IRIS_PARTIAL_PCA,
    rows: IRIS_FITTED_ROWS,
    projected: IRIS_LATER_ROWS
  }
}`,...T.parameters?.docs?.source},description:{story:`A model fitted to 120 flowers with the last 30 placed into it afterwards.

The 30 took no part in choosing where the axes point, so they are drawn
hollow, the legend says what hollow means, and the caption says why it
matters: a hollow dot landing far from everything is the finding, not a
fault. This is the shape of every real use of the pattern — a new batch, a
suspected outlier, this year's measurements against last year's model.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    panels: ['map']
  }
}`,...E.parameters?.docs?.source},description:{story:`The scores plot on its own, which is what a page embedding the viewer in
somebody else's site usually wants.

\`panels={['map']}\` leaves one panel, so the pills disappear and the bar keeps
only the settings and the "?" — the whole component is the chart and one
thirty-six pixel row. Every other panel is still a prop away; this is a site
saying it has no room for them, not the viewer deciding it cannot fill them.`,...E.parameters?.docs?.description}}},O=[`Iris`,`EveryPair`,`WhatDiffers`,`HowMuchEachExplains`,`ProjectedSamples`,`OnlyTheMap`]})))()}k();export{S as EveryPair,w as HowMuchEachExplains,x as Iris,E as OnlyTheMap,T as ProjectedSamples,C as WhatDiffers,O as __namedExportsOrder,b as default};