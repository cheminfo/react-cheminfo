import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-DqpBrNIF.js";import{_ as r,g as i}from"./scaleData-rd41br9i.js";import{i as a,n as o,r as s,t as c}from"./scale-D8U2sdnW.js";import{n as l,t as u}from"./numbers-B_szyetp.js";function d(e){let{stops:t,min:n,max:r,unit:i=``,label:a=``,formatValue:o=p}=e,s=(0,h.useId)(),c=t.length===0?_:t,l=m(o(n),i),u=m(o(r),i);return(0,g.jsxs)(`div`,{style:b,children:[a===``?null:(0,g.jsx)(`span`,{style:x,children:a}),(0,g.jsx)(`span`,{style:S,children:l}),(0,g.jsxs)(`svg`,{style:C,viewBox:`0 0 ${y} ${v}`,preserveAspectRatio:`none`,role:`img`,"aria-label":`${a===``?`Colour scale`:a} from ${l} to ${u}`,children:[(0,g.jsx)(`defs`,{children:(0,g.jsx)(`linearGradient`,{id:s,x1:`0`,y1:`0`,x2:`1`,y2:`0`,children:f(c).map(e=>(0,g.jsx)(`stop`,{offset:e.offset,stopColor:e.color},e.offset))})}),(0,g.jsx)(`rect`,{x:`0`,y:`0`,width:y,height:v,rx:`2`,fill:`url(#${s})`})]}),(0,g.jsx)(`span`,{style:S,children:u})]})}function f(e){let t=e.length-1,n=[];for(let r=0;r<e.length;r++){let i=e[r];i!==void 0&&n.push({offset:t===0?r:r/t,color:i})}if(n.length===1){let e=n[0];e!==void 0&&n.push({offset:1,color:e.color})}return n}function p(e){return u(e,3)}function m(e,t){return t===``?e:`${e} ${t}`}var h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{h=t(),l(),g=n(),_=[`#e4e8ee`],v=12,y=100,b={display:`flex`,flexWrap:`wrap`,alignItems:`center`,gap:8},x={color:`var(--text-muted, rgb(95 107 124))`,fontSize:12},S={fontSize:12,fontVariantNumeric:`tabular-nums`},C={display:`inline-block`,flex:`1 1 160px`,maxWidth:320,height:v},d.__docgenInfo={description:`The key to a sequential colour scale: its two end values, and the ramp
between them.

The ramp is a real gradient rather than a row of buckets, and both ends
carry their value, so a figure lifted out of the page still says what it is
measuring. It is drawn as an SVG, which keeps it crisp in a print and in an
exported image.
@param props - See {@link ColorScaleLegendProps}.
@returns The labelled gradient strip.`,methods:[],displayName:`ColorScaleLegend`,props:{stops:{required:!0,tsType:{name:`unknown`},description:`The scale's colours, from its low end to its high end.`},min:{required:!0,tsType:{name:`number`},description:`The value the low end stands for.`},max:{required:!0,tsType:{name:`number`},description:`The value the high end stands for.`},unit:{required:!1,tsType:{name:`string`},description:"Unit written after each end value, e.g. `g/mol`.\n@default '' — no unit is written"},label:{required:!1,tsType:{name:`string`},description:`What the scale measures, written before it.
@default '' — no label is written`},formatValue:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: number) => string`,signature:{arguments:[{type:{name:`number`},name:`value`}],return:{name:`string`}}},description:`How an end value is written.
@default a rounding to three decimals with the trailing zeros dropped`}}}})))()}var T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{r(),o(),w(),T=n(),E=[`#b91c1c`,`#ea580c`,`#f59e0b`,`#16a34a`,`#0891b2`,`#1d4ed8`,`#5b21b6`],D=[{id:`trichloroacetic`,name:`trichloroacetic acid`,pKa:.7},{id:`formic`,name:`formic acid`,pKa:3.75},{id:`acetic`,name:`acetic acid`,pKa:4.76},{id:`carbonic`,name:`carbonic acid`,pKa:6.35},{id:`dihydrogen-phosphate`,name:`dihydrogen phosphate`,pKa:7.2},{id:`ammonium`,name:`ammonium`,pKa:9.25},{id:`bicarbonate`,name:`bicarbonate`,pKa:10.33},{id:`hydrogen-phosphate`,name:`hydrogen phosphate`,pKa:12.35}],O={title:`Color/ColorScaleLegend`,component:d,args:{stops:c,min:-12.4,max:-3.1,unit:`eV`,label:`Orbital energy`},argTypes:{min:{control:`number`},max:{control:`number`},unit:{control:`text`},label:{control:`text`},stops:{control:`object`}},parameters:{layout:`padded`,docs:{description:{component:`The key to a sequential colour scale: the value each end stands for, and the real gradient between them.`}}},render:e=>(0,T.jsx)(`div`,{style:{width:`min(34rem, 92vw)`},children:(0,T.jsx)(d,{...e})})},k={},A={args:{stops:E,min:1,max:14,unit:``,label:`pH`,formatValue:e=>e.toFixed(0)}},j={args:{stops:c,min:0,max:14,unit:``,label:`pKa`},render:e=>(0,T.jsxs)(`div`,{style:{display:`grid`,gap:12,width:`min(46rem, 92vw)`},children:[(0,T.jsx)(d,{...e}),(0,T.jsx)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:8},children:D.map(t=>{let n=a(e.stops,s(t.pKa,e.min,e.max)),r=i(n.background,n.foreground);return(0,T.jsxs)(`div`,{style:{padding:`6px 10px`,borderRadius:8,background:n.background,color:n.foreground,fontSize:12},children:[(0,T.jsx)(`div`,{style:{fontWeight:600},children:t.name}),(0,T.jsx)(`div`,{style:{fontVariantNumeric:`tabular-nums`},children:`pKa ${t.pKa.toFixed(2)} · ${r.toFixed(1)}:1`})]},t.id)})})]})},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{}`,...k.parameters?.docs?.source},description:{story:`The orbital energies of a Hückel calculation, in electronvolts.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    stops: UNIVERSAL_INDICATOR,
    min: 1,
    max: 14,
    unit: '',
    label: 'pH',
    formatValue: value => value.toFixed(0)
  }
}`,...A.parameters?.docs?.source},description:{story:`A scale whose colours already mean something: universal indicator over pH.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    stops: VIRIDIS_SCALE,
    min: 0,
    max: 14,
    unit: '',
    label: 'pKa'
  },
  render: args => <div style={{
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
        const swatch = swatchFromScale(args.stops, positionInRange(acid.pKa, args.min, args.max));
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
    </div>
}`,...j.parameters?.docs?.source},description:{story:`Eight acids placed on the scale by their pKa, each written in the ink
\`readableInk\` picks — light on the dark bottom of viridis, dark on its pale
top — with the contrast ratio it reaches beside it. The mid teal is the hard
case, and is why the two inks are compared rather than thresholded.`,...j.parameters?.docs?.description}}},M=[`Default`,`UniversalIndicator`,`ReadableSwatches`]})))()}N();export{k as Default,j as ReadableSwatches,A as UniversalIndicator,M as __namedExportsOrder,O as default};