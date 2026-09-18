import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-DPa5Aqe_.js";import{f as n,l as r,m as i,n as a,p as o,r as s,u as c}from"./scaleText-DOC0oXgz.js";import{n as l,t as u}from"./scale-OQFTUI9T.js";import{n as d,t as f}from"./ColorScaleLegend-USfx9QJs.js";function p(e){return`stops`in e?e:r(e)}var m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{i(),c(),u(),a(),d(),m=t(),h=s(`viridis`).scale,g=[`#b91c1c`,`#ea580c`,`#f59e0b`,`#16a34a`,`#0891b2`,`#1d4ed8`,`#5b21b6`],_=[{id:`trichloroacetic`,name:`trichloroacetic acid`,pKa:.7},{id:`formic`,name:`formic acid`,pKa:3.75},{id:`acetic`,name:`acetic acid`,pKa:4.76},{id:`carbonic`,name:`carbonic acid`,pKa:6.35},{id:`dihydrogen-phosphate`,name:`dihydrogen phosphate`,pKa:7.2},{id:`ammonium`,name:`ammonium`,pKa:9.25},{id:`bicarbonate`,name:`bicarbonate`,pKa:10.33},{id:`hydrogen-phosphate`,name:`hydrogen phosphate`,pKa:12.35}],v={title:`Color/ColorScaleLegend`,component:f,args:{scale:h,min:-12.4,max:-3.1,unit:`eV`,label:`Orbital energy`},argTypes:{min:{control:`number`},max:{control:`number`},unit:{control:`text`},label:{control:`text`},scale:{control:`object`}},parameters:{layout:`padded`,docs:{description:{component:`The key to a sequential colour scale: the value each end stands for, and the real gradient between them.`}}},render:e=>(0,m.jsx)(`div`,{style:{width:`min(34rem, 92vw)`},children:(0,m.jsx)(f,{...e})})},y={},b={args:{scale:g,min:1,max:14,unit:``,label:`pH`,formatValue:e=>e.toFixed(0)}},x={args:{scale:h,min:0,max:14,unit:``,label:`pKa`},render:e=>{let t=p(e.scale);return(0,m.jsxs)(`div`,{style:{display:`grid`,gap:12,width:`min(46rem, 92vw)`},children:[(0,m.jsx)(f,{...e}),(0,m.jsx)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:8},children:_.map(r=>{let i=n(t,l(r.pKa,e.min,e.max)),a=o(i.background,i.foreground);return(0,m.jsxs)(`div`,{style:{padding:`6px 10px`,borderRadius:8,background:i.background,color:i.foreground,fontSize:12},children:[(0,m.jsx)(`div`,{style:{fontWeight:600},children:r.name}),(0,m.jsx)(`div`,{style:{fontVariantNumeric:`tabular-nums`},children:`pKa ${r.pKa.toFixed(2)} · ${a.toFixed(1)}:1`})]},r.id)})})]})}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{}`,...y.parameters?.docs?.source},description:{story:`The orbital energies of a Hückel calculation, in electronvolts.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    scale: UNIVERSAL_INDICATOR,
    min: 1,
    max: 14,
    unit: '',
    label: 'pH',
    formatValue: value => value.toFixed(0)
  }
}`,...b.parameters?.docs?.source},description:{story:`A scale whose colours already mean something: universal indicator over pH, as a plain list.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    scale: VIRIDIS,
    min: 0,
    max: 14,
    unit: '',
    label: 'pKa'
  },
  render: args => {
    const scale = asScale(args.scale);
    return <div style={{
      display: 'grid',
      gap: 12,
      width: 'min(46rem, 92vw)'
    }}>
        <ColorScaleLegend {...args} />
        <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8
      }}>
          {ACIDS.map(acid => {
          const swatch = swatchAt(scale, positionInRange(acid.pKa, args.min, args.max));
          const ratio = contrastRatio(swatch.background, swatch.foreground);
          return <div key={acid.id} style={{
            padding: '6px 10px',
            borderRadius: 8,
            background: swatch.background,
            color: swatch.foreground,
            fontSize: 12
          }}>
                <div style={{
              fontWeight: 600
            }}>{acid.name}</div>
                <div style={{
              fontVariantNumeric: 'tabular-nums'
            }}>
                  {\`pKa \${acid.pKa.toFixed(2)} · \${ratio.toFixed(1)}:1\`}
                </div>
              </div>;
        })}
        </div>
      </div>;
  }
}`,...x.parameters?.docs?.source},description:{story:`Eight acids placed on the scale by their pKa, each written in the ink
\`readableInk\` picks — light on the dark bottom of viridis, dark on its pale
top — with the contrast ratio it reaches beside it. The mid teal is the hard
case, and is why the two inks are compared rather than thresholded.`,...x.parameters?.docs?.description}}},S=[`Default`,`UniversalIndicator`,`ReadableSwatches`]})))()}C();export{y as Default,x as ReadableSwatches,b as UniversalIndicator,S as __namedExportsOrder,v as default};