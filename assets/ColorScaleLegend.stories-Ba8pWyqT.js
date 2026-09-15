import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-Bh_4mKxw.js";import{a as r,i}from"./numbers-BxzU8aH2.js";import{n as a,r as o}from"./familyTokens-DsQXXJV4.js";import{c as s,d as c,f as l,l as u,n as d,p as f,r as p,u as m}from"./scaleText-2dK_v4y_.js";import{n as h,t as g}from"./scale-OQFTUI9T.js";function _(e){let{className:t,scale:n,min:r,max:i,unit:a=``,label:o=``,formatValue:c=x}=e,l=(0,C.useId)(),u=v(`stops`in n?n:s(n)),d=S(c(r),a),f=S(c(i),a);return(0,w.jsxs)(`div`,{className:t,style:O,children:[o===``?null:(0,w.jsx)(`span`,{style:k,children:o}),(0,w.jsx)(`span`,{style:A,children:d}),(0,w.jsxs)(`svg`,{style:j,viewBox:`0 0 ${E} ${T}`,preserveAspectRatio:`none`,role:`img`,"aria-label":`${o===``?`Colour scale`:o} from ${d} to ${f}`,children:[u.length===0?null:(0,w.jsx)(`defs`,{children:(0,w.jsx)(`linearGradient`,{id:l,x1:`0`,y1:`0`,x2:`1`,y2:`0`,children:u.map(e=>(0,w.jsx)(`stop`,{offset:e.offset,stopColor:e.color},e.key))})}),(0,w.jsx)(`rect`,{x:`0`,y:`0`,width:E,height:T,rx:`2`,fill:u.length===0?void 0:`url(#${l})`,style:u.length===0?M:void 0})]}),(0,w.jsx)(`span`,{style:A,children:f})]})}function v(e){if(e.stops.length===0)return[];if(e.interpolation!==`rgb`){let t=b(e);if(t!==null)return t}let t=[],n=0;for(let r of e.stops)t.push(y(n,r.position,r.color)),n+=1;if(t.length===1){let e=t[0]?.color??``;return[y(0,0,e),y(1,1,e)]}return t}function y(e,t,n){return{key:`${e}:${t}:${n}`,offset:t,color:n}}function b(e){let t;try{t=m(e,D)}catch{return null}let n=t.length-1,r=[];for(let e=0;e<t.length;e++)r.push(y(e,e/n,t[e]??``));return r}function x(e){return i(e,3)}function S(e,t){return t===``?e:`${e} ${t}`}var C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{C=t(),r(),o(),u(),w=n(),T=12,E=100,D=24,O={display:`flex`,flexWrap:`wrap`,alignItems:`center`,gap:8},k={color:a.textMuted,fontSize:12},A={fontSize:12,fontVariantNumeric:`tabular-nums`},j={display:`inline-block`,flex:`1 1 160px`,maxWidth:320,height:T},M={fill:a.border},_.__docgenInfo={description:`The key to a sequential colour scale: its two end values, and the ramp
between them.

The ramp is a real gradient rather than a row of buckets, and both ends
carry their value, so a figure lifted out of the page still says what it is
measuring. It is drawn as an SVG, which keeps it crisp in a print and in an
exported image. A scale that turns around the colour wheel is sampled, since
an SVG gradient only mixes the straight line between two colours.
@param props - See {@link ColorScaleLegendProps}.
@returns The labelled gradient strip.`,methods:[],displayName:`ColorScaleLegend`,props:{scale:{required:!0,tsType:{name:`union`,raw:`ColorScale | readonly string[]`,elements:[{name:`ColorScale`},{name:`unknown`}]},description:`The scale: a \`ColorScale\` as the registry, the picker and the editor hand
it over, or a plain list of colours spread evenly from the low end to the
high end.`},min:{required:!0,tsType:{name:`number`},description:`The value the low end stands for.`},max:{required:!0,tsType:{name:`number`},description:`The value the high end stands for.`},unit:{required:!1,tsType:{name:`string`},description:"Unit written after each end value, e.g. `g/mol`.\n@default '' — no unit is written"},label:{required:!1,tsType:{name:`string`},description:`What the scale measures, written before it.
@default '' — no label is written`},formatValue:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: number) => string`,signature:{arguments:[{type:{name:`number`},name:`value`}],return:{name:`string`}}},description:`How an end value is written.
@default a rounding to three decimals with the trailing zeros dropped`},className:{required:!1,tsType:{name:`string`},description:`Class names added to the root element.
@default undefined`}}}})))()}function P(e){return`stops`in e?e:s(e)}var F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{f(),u(),g(),d(),N(),F=n(),I=p(`viridis`).scale,L=[`#b91c1c`,`#ea580c`,`#f59e0b`,`#16a34a`,`#0891b2`,`#1d4ed8`,`#5b21b6`],R=[{id:`trichloroacetic`,name:`trichloroacetic acid`,pKa:.7},{id:`formic`,name:`formic acid`,pKa:3.75},{id:`acetic`,name:`acetic acid`,pKa:4.76},{id:`carbonic`,name:`carbonic acid`,pKa:6.35},{id:`dihydrogen-phosphate`,name:`dihydrogen phosphate`,pKa:7.2},{id:`ammonium`,name:`ammonium`,pKa:9.25},{id:`bicarbonate`,name:`bicarbonate`,pKa:10.33},{id:`hydrogen-phosphate`,name:`hydrogen phosphate`,pKa:12.35}],z={title:`Color/ColorScaleLegend`,component:_,args:{scale:I,min:-12.4,max:-3.1,unit:`eV`,label:`Orbital energy`},argTypes:{min:{control:`number`},max:{control:`number`},unit:{control:`text`},label:{control:`text`},scale:{control:`object`}},parameters:{layout:`padded`,docs:{description:{component:`The key to a sequential colour scale: the value each end stands for, and the real gradient between them.`}}},render:e=>(0,F.jsx)(`div`,{style:{width:`min(34rem, 92vw)`},children:(0,F.jsx)(_,{...e})})},B={},V={args:{scale:L,min:1,max:14,unit:``,label:`pH`,formatValue:e=>e.toFixed(0)}},H={args:{scale:I,min:0,max:14,unit:``,label:`pKa`},render:e=>{let t=P(e.scale);return(0,F.jsxs)(`div`,{style:{display:`grid`,gap:12,width:`min(46rem, 92vw)`},children:[(0,F.jsx)(_,{...e}),(0,F.jsx)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:8},children:R.map(n=>{let r=c(t,h(n.pKa,e.min,e.max)),i=l(r.background,r.foreground);return(0,F.jsxs)(`div`,{style:{padding:`6px 10px`,borderRadius:8,background:r.background,color:r.foreground,fontSize:12},children:[(0,F.jsx)(`div`,{style:{fontWeight:600},children:n.name}),(0,F.jsx)(`div`,{style:{fontVariantNumeric:`tabular-nums`},children:`pKa ${n.pKa.toFixed(2)} · ${i.toFixed(1)}:1`})]},n.id)})})]})}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{}`,...B.parameters?.docs?.source},description:{story:`The orbital energies of a Hückel calculation, in electronvolts.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    scale: UNIVERSAL_INDICATOR,
    min: 1,
    max: 14,
    unit: '',
    label: 'pH',
    formatValue: value => value.toFixed(0)
  }
}`,...V.parameters?.docs?.source},description:{story:`A scale whose colours already mean something: universal indicator over pH, as a plain list.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source},description:{story:`Eight acids placed on the scale by their pKa, each written in the ink
\`readableInk\` picks — light on the dark bottom of viridis, dark on its pale
top — with the contrast ratio it reaches beside it. The mid teal is the hard
case, and is why the two inks are compared rather than thresholded.`,...H.parameters?.docs?.description}}},U=[`Default`,`UniversalIndicator`,`ReadableSwatches`]})))()}W();export{B as Default,H as ReadableSwatches,V as UniversalIndicator,U as __namedExportsOrder,z as default};