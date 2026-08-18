import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-NhtRTM8t.js";import{a as r,i,n as a,o,r as s,t as c}from"./scale-BhSAYWKe.js";function l(e,t=f){return Number.isFinite(e)?Number.parseFloat(e.toFixed(u(t))).toString():`–`}function u(e){return Number.isFinite(e)?Math.min(d,Math.max(0,Math.trunc(e))):f}var d,f;function p(){return(p=e((()=>{new Intl.NumberFormat(`en-US`,{maximumFractionDigits:0}),new Intl.NumberFormat(`en-US`,{notation:`compact`,maximumFractionDigits:1}),d=20,f=2})))()}function m(e){let{stops:t,min:n,max:r,unit:i=``,label:a=``,formatValue:o=g}=e,s=(0,v.useId)(),c=t.length===0?b:t,l=_(o(n),i),u=_(o(r),i);return(0,y.jsxs)(`div`,{style:C,children:[a===``?null:(0,y.jsx)(`span`,{style:w,children:a}),(0,y.jsx)(`span`,{style:T,children:l}),(0,y.jsxs)(`svg`,{style:E,viewBox:`0 0 ${S} ${x}`,preserveAspectRatio:`none`,role:`img`,"aria-label":`${a===``?`Colour scale`:a} from ${l} to ${u}`,children:[(0,y.jsx)(`defs`,{children:(0,y.jsx)(`linearGradient`,{id:s,x1:`0`,y1:`0`,x2:`1`,y2:`0`,children:h(c).map(e=>(0,y.jsx)(`stop`,{offset:e.offset,stopColor:e.color},e.offset))})}),(0,y.jsx)(`rect`,{x:`0`,y:`0`,width:S,height:x,rx:`2`,fill:`url(#${s})`})]}),(0,y.jsx)(`span`,{style:T,children:u})]})}function h(e){let t=e.length-1,n=[];for(let r=0;r<e.length;r++){let i=e[r];i!==void 0&&n.push({offset:t===0?r:r/t,color:i})}if(n.length===1){let e=n[0];e!==void 0&&n.push({offset:1,color:e.color})}return n}function g(e){return l(e,3)}function _(e,t){return t===``?e:`${e} ${t}`}var v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{v=t(),p(),y=n(),b=[`#e4e8ee`],x=12,S=100,C={display:`flex`,flexWrap:`wrap`,alignItems:`center`,gap:8},w={color:`rgb(95 107 124)`,fontSize:12},T={fontSize:12,fontVariantNumeric:`tabular-nums`},E={display:`inline-block`,flex:`1 1 160px`,maxWidth:320,height:x},m.__docgenInfo={description:`The key to a sequential colour scale: its two end values, and the ramp
between them.

The ramp is a real gradient rather than a row of buckets, and both ends
carry their value, so a figure lifted out of the page still says what it is
measuring. It is drawn as an SVG, which keeps it crisp in a print and in an
exported image.
@param props - See {@link ColorScaleLegendProps}.
@returns The labelled gradient strip.`,methods:[],displayName:`ColorScaleLegend`,props:{stops:{required:!0,tsType:{name:`unknown`},description:`The scale's colours, from its low end to its high end.`},min:{required:!0,tsType:{name:`number`},description:`The value the low end stands for.`},max:{required:!0,tsType:{name:`number`},description:`The value the high end stands for.`},unit:{required:!1,tsType:{name:`string`},description:"Unit written after each end value, e.g. `g/mol`.\n@default '' — no unit is written"},label:{required:!1,tsType:{name:`string`},description:`What the scale measures, written before it.
@default '' — no label is written`},formatValue:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: number) => string`,signature:{arguments:[{type:{name:`number`},name:`value`}],return:{name:`string`}}},description:`How an end value is written.
@default a rounding to three decimals with the trailing zeros dropped`}}}})))()}var O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{o(),a(),D(),O=n(),k=[`#b91c1c`,`#ea580c`,`#f59e0b`,`#16a34a`,`#0891b2`,`#1d4ed8`,`#5b21b6`],A=[{id:`trichloroacetic`,name:`trichloroacetic acid`,pKa:.7},{id:`formic`,name:`formic acid`,pKa:3.75},{id:`acetic`,name:`acetic acid`,pKa:4.76},{id:`carbonic`,name:`carbonic acid`,pKa:6.35},{id:`dihydrogen-phosphate`,name:`dihydrogen phosphate`,pKa:7.2},{id:`ammonium`,name:`ammonium`,pKa:9.25},{id:`bicarbonate`,name:`bicarbonate`,pKa:10.33},{id:`hydrogen-phosphate`,name:`hydrogen phosphate`,pKa:12.35}],j={title:`Color/ColorScaleLegend`,component:m,args:{stops:c,min:-12.4,max:-3.1,unit:`eV`,label:`Orbital energy`},argTypes:{min:{control:`number`},max:{control:`number`},unit:{control:`text`},label:{control:`text`},stops:{control:`object`}},parameters:{layout:`padded`,docs:{description:{component:`The key to a sequential colour scale: the value each end stands for, and the real gradient between them.`}}},render:e=>(0,O.jsx)(`div`,{style:{width:`min(34rem, 92vw)`},children:(0,O.jsx)(m,{...e})})},M={},N={args:{stops:k,min:1,max:14,unit:``,label:`pH`,formatValue:e=>e.toFixed(0)}},P={args:{stops:c,min:0,max:14,unit:``,label:`pKa`},render:e=>(0,O.jsxs)(`div`,{style:{display:`grid`,gap:12,width:`min(46rem, 92vw)`},children:[(0,O.jsx)(m,{...e}),(0,O.jsx)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:8},children:A.map(t=>{let n=i(e.stops,s(t.pKa,e.min,e.max)),a=r(n.background,n.foreground);return(0,O.jsxs)(`div`,{style:{padding:`6px 10px`,borderRadius:8,background:n.background,color:n.foreground,fontSize:12},children:[(0,O.jsx)(`div`,{style:{fontWeight:600},children:t.name}),(0,O.jsx)(`div`,{style:{fontVariantNumeric:`tabular-nums`},children:`pKa ${t.pKa.toFixed(2)} · ${a.toFixed(1)}:1`})]},t.id)})})]})},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{}`,...M.parameters?.docs?.source},description:{story:`The orbital energies of a Hückel calculation, in electronvolts.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    stops: UNIVERSAL_INDICATOR,
    min: 1,
    max: 14,
    unit: '',
    label: 'pH',
    formatValue: value => value.toFixed(0)
  }
}`,...N.parameters?.docs?.source},description:{story:`A scale whose colours already mean something: universal indicator over pH.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source},description:{story:`Eight acids placed on the scale by their pKa, each written in the ink
\`readableInk\` picks — light on the dark bottom of viridis, dark on its pale
top — with the contrast ratio it reaches beside it. The mid teal is the hard
case, and is why the two inks are compared rather than thresholded.`,...P.parameters?.docs?.description}}},F=[`Default`,`UniversalIndicator`,`ReadableSwatches`]})))()}I();export{M as Default,P as ReadableSwatches,N as UniversalIndicator,F as __namedExportsOrder,j as default};