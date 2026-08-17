import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-d1eXCcja.js";function r(e){let t=typeof e==`string`?e.trim():``;if(!s.test(t))throw Error(`not a hex colour: ${e}`);let n=t.slice(1),r=n.length===c?1:2;return{red:a(n,0,r),green:a(n,1,r),blue:a(n,2,r)}}function i(e){return`#${o(e.red)}${o(e.green)}${o(e.blue)}`}function a(e,t,n){let r=e.slice(t*n,t*n+n);return Number.parseInt(n===1?`${r}${r}`:r,16)}function o(e){return(Number.isFinite(e)?Math.min(l,Math.max(0,Math.round(e))):0).toString(16).padStart(2,`0`)}var s,c,l;function u(){return(u=e((()=>{s=/^#(?:[\da-f]{3}|[\da-f]{6})$/i,c=3,l=255})))()}function d(e){let{red:t,green:n,blue:i}=r(e);return h*m(t)+g*m(n)+_*m(i)}function f(e,t){let n=d(e),r=d(t),i=Math.max(n,r),a=Math.min(n,r);return(i+.05)/(a+.05)}function p(e,t={}){let{dark:n=y,light:r=b}=t;return f(e,n)>=f(e,r)?n:r}function m(e){let t=e/255;return t<=v?t/12.92:((t+.055)/1.055)**2.4}var h,g,_,v,y,b;function x(){return(x=e((()=>{u(),h=.2126,g=.7152,_=.0722,v=.03928,y=`#182026`,b=`#ffffff`})))()}function S(e,t,n,r={}){let{logarithmic:i=!1}=r;if(!Number.isFinite(e)||!Number.isFinite(t)||!Number.isFinite(n))return 0;if(n===t)return .5;if(!i)return C((e-t)/(n-t));let a=Math.max(t,ne(t,n)),o=Math.log10(n)-Math.log10(a);return o===0?.5:C((Math.log10(Math.max(e,a))-Math.log10(a))/o)}function ee(e,t){if(e.length===0)throw Error(`a colour scale needs at least one stop`);let n=C(t)*(e.length-1),a=Math.floor(n),o=e[a],s=e[Math.min(a+1,e.length-1)];if(o===void 0||s===void 0)throw Error(`no colour at position ${String(t)}`);let c=r(o),l=r(s),u=n-a;return i({red:c.red+(l.red-c.red)*u,green:c.green+(l.green-c.green)*u,blue:c.blue+(l.blue-c.blue)*u})}function te(e,t,n={}){let r=ee(e,t);return{background:r,foreground:p(r,n)}}function C(e){return Number.isFinite(e)?Math.min(1,Math.max(0,e)):0}function ne(e,t){return e>0?e:t<=0?1:t*1e-12}var w;function T(){return(T=e((()=>{x(),u(),w=[`#440154`,`#482878`,`#3e4a89`,`#31688e`,`#26828e`,`#1f9e89`,`#35b779`,`#6dcd59`,`#b4de2c`]})))()}function E(e,t=k){return Number.isFinite(e)?Number.parseFloat(e.toFixed(D(t))).toString():`–`}function D(e){return Number.isFinite(e)?Math.min(O,Math.max(0,Math.trunc(e))):k}var O,k;function A(){return(A=e((()=>{new Intl.NumberFormat(`en-US`,{maximumFractionDigits:0}),new Intl.NumberFormat(`en-US`,{notation:`compact`,maximumFractionDigits:1}),O=20,k=2})))()}function j(e){let{stops:t,min:n,max:r,unit:i=``,label:a=``,formatValue:o=N}=e,s=(0,F.useId)(),c=t.length===0?L:t,l=P(o(n),i),u=P(o(r),i);return(0,I.jsxs)(`div`,{style:B,children:[a===``?null:(0,I.jsx)(`span`,{style:V,children:a}),(0,I.jsx)(`span`,{style:H,children:l}),(0,I.jsxs)(`svg`,{style:U,viewBox:`0 0 ${z} ${R}`,preserveAspectRatio:`none`,role:`img`,"aria-label":`${a===``?`Colour scale`:a} from ${l} to ${u}`,children:[(0,I.jsx)(`defs`,{children:(0,I.jsx)(`linearGradient`,{id:s,x1:`0`,y1:`0`,x2:`1`,y2:`0`,children:M(c).map(e=>(0,I.jsx)(`stop`,{offset:e.offset,stopColor:e.color},e.offset))})}),(0,I.jsx)(`rect`,{x:`0`,y:`0`,width:z,height:R,rx:`2`,fill:`url(#${s})`})]}),(0,I.jsx)(`span`,{style:H,children:u})]})}function M(e){let t=e.length-1,n=[];for(let r=0;r<e.length;r++){let i=e[r];i!==void 0&&n.push({offset:t===0?r:r/t,color:i})}if(n.length===1){let e=n[0];e!==void 0&&n.push({offset:1,color:e.color})}return n}function N(e){return E(e,3)}function P(e,t){return t===``?e:`${e} ${t}`}var F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{F=t(),A(),I=n(),L=[`#e4e8ee`],R=12,z=100,B={display:`flex`,flexWrap:`wrap`,alignItems:`center`,gap:8},V={color:`rgb(95 107 124)`,fontSize:12},H={fontSize:12,fontVariantNumeric:`tabular-nums`},U={display:`inline-block`,flex:`1 1 160px`,maxWidth:320,height:R},j.__docgenInfo={description:`The key to a sequential colour scale: its two end values, and the ramp
between them.

The ramp is a real gradient rather than a row of buckets, and both ends
carry their value, so a figure lifted out of the page still says what it is
measuring. It is drawn as an SVG, which keeps it crisp in a print and in an
exported image.
@param props - See {@link ColorScaleLegendProps}.
@returns The labelled gradient strip.`,methods:[],displayName:`ColorScaleLegend`,props:{stops:{required:!0,tsType:{name:`unknown`},description:`The scale's colours, from its low end to its high end.`},min:{required:!0,tsType:{name:`number`},description:`The value the low end stands for.`},max:{required:!0,tsType:{name:`number`},description:`The value the high end stands for.`},unit:{required:!1,tsType:{name:`string`},description:"Unit written after each end value, e.g. `g/mol`.\n@default '' — no unit is written"},label:{required:!1,tsType:{name:`string`},description:`What the scale measures, written before it.
@default '' — no label is written`},formatValue:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: number) => string`,signature:{arguments:[{type:{name:`number`},name:`value`}],return:{name:`string`}}},description:`How an end value is written.
@default a rounding to three decimals with the trailing zeros dropped`}}}})))()}var G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{x(),T(),W(),G=n(),K=[`#b91c1c`,`#ea580c`,`#f59e0b`,`#16a34a`,`#0891b2`,`#1d4ed8`,`#5b21b6`],q=[{id:`trichloroacetic`,name:`trichloroacetic acid`,pKa:.7},{id:`formic`,name:`formic acid`,pKa:3.75},{id:`acetic`,name:`acetic acid`,pKa:4.76},{id:`carbonic`,name:`carbonic acid`,pKa:6.35},{id:`dihydrogen-phosphate`,name:`dihydrogen phosphate`,pKa:7.2},{id:`ammonium`,name:`ammonium`,pKa:9.25},{id:`bicarbonate`,name:`bicarbonate`,pKa:10.33},{id:`hydrogen-phosphate`,name:`hydrogen phosphate`,pKa:12.35}],J={title:`Color/ColorScaleLegend`,component:j,args:{stops:w,min:-12.4,max:-3.1,unit:`eV`,label:`Orbital energy`},argTypes:{min:{control:`number`},max:{control:`number`},unit:{control:`text`},label:{control:`text`},stops:{control:`object`}},parameters:{layout:`padded`,docs:{description:{component:`The key to a sequential colour scale: the value each end stands for, and the real gradient between them.`}}},render:e=>(0,G.jsx)(`div`,{style:{width:`min(34rem, 92vw)`},children:(0,G.jsx)(j,{...e})})},Y={},X={args:{stops:K,min:1,max:14,unit:``,label:`pH`,formatValue:e=>e.toFixed(0)}},Z={args:{stops:w,min:0,max:14,unit:``,label:`pKa`},render:e=>(0,G.jsxs)(`div`,{style:{display:`grid`,gap:12,width:`min(46rem, 92vw)`},children:[(0,G.jsx)(j,{...e}),(0,G.jsx)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:8},children:q.map(t=>{let n=te(e.stops,S(t.pKa,e.min,e.max)),r=f(n.background,n.foreground);return(0,G.jsxs)(`div`,{style:{padding:`6px 10px`,borderRadius:8,background:n.background,color:n.foreground,fontSize:12},children:[(0,G.jsx)(`div`,{style:{fontWeight:600},children:t.name}),(0,G.jsx)(`div`,{style:{fontVariantNumeric:`tabular-nums`},children:`pKa ${t.pKa.toFixed(2)} · ${r.toFixed(1)}:1`})]},t.id)})})]})},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{}`,...Y.parameters?.docs?.source},description:{story:`The orbital energies of a Hückel calculation, in electronvolts.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    stops: UNIVERSAL_INDICATOR,
    min: 1,
    max: 14,
    unit: '',
    label: 'pH',
    formatValue: value => value.toFixed(0)
  }
}`,...X.parameters?.docs?.source},description:{story:`A scale whose colours already mean something: universal indicator over pH.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source},description:{story:`Eight acids placed on the scale by their pKa, each written in the ink
\`readableInk\` picks — light on the dark bottom of viridis, dark on its pale
top — with the contrast ratio it reaches beside it. The mid teal is the hard
case, and is why the two inks are compared rather than thresholded.`,...Z.parameters?.docs?.description}}},Q=[`Default`,`UniversalIndicator`,`ReadableSwatches`]})))()}$();export{Y as Default,Z as ReadableSwatches,X as UniversalIndicator,Q as __namedExportsOrder,J as default};