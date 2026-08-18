import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-CGFjf9cs.js";import{n as r,t as i}from"./icon-DB0ya6Yj.js";import{n as a,t as o}from"./tag-DOv264S0.js";import{n as s,r as c}from"./buttons-C48J1DRg.js";import{n as l,t as u}from"./collapse-G_lxSlXV.js";import{i as d,n as f,t as p}from"./moleculeFixtures-BmLC_E8B.js";function m(e){let{title:t,children:n,icon:r,defaultOpen:a=!0,rightElement:o,isOpen:s,onToggle:c,id:l,className:d}=e,[f,p]=(0,h.useState)(a),m=s!==void 0,S=m?s:f;function C(){m?c?.():p(e=>!e)}return(0,g.jsxs)(`section`,{id:l,className:d===void 0?`collapsible-section`:`collapsible-section ${d}`,children:[(0,g.jsxs)(`div`,{style:_,children:[(0,g.jsxs)(`button`,{type:`button`,style:v,"aria-expanded":S,onClick:C,children:[(0,g.jsx)(i,{icon:S?`chevron-down`:`chevron-right`,size:14}),r===void 0?null:(0,g.jsx)(i,{icon:r,size:14}),(0,g.jsx)(`span`,{style:y,children:t})]}),o===void 0?null:(0,g.jsx)(`div`,{style:b,children:o})]}),(0,g.jsx)(u,{isOpen:S,children:(0,g.jsx)(`div`,{style:x,children:n})})]})}var h,g,_,v,y,b,x;function S(){return(S=e((()=>{l(),r(),h=t(),g=n(),_={display:`flex`,alignItems:`center`,gap:8},v={display:`flex`,flex:`1 1 auto`,minWidth:0,alignItems:`center`,padding:`4px 0`,border:0,background:`none`,color:`inherit`,font:`inherit`,fontWeight:600,gap:6,textAlign:`left`,cursor:`pointer`},y={overflow:`hidden`,textOverflow:`ellipsis`,whiteSpace:`nowrap`},b={display:`flex`,flex:`0 0 auto`,alignItems:`center`,gap:4},x={paddingTop:4},m.__docgenInfo={description:`A titled block of a page that folds away when its heading is pressed.

It works on its own or under a parent: pass \`isOpen\` and \`onToggle\` and the
caller owns the state, which is what a page needs to open every section at
once.
@param props - See {@link CollapsibleSectionProps}.
@returns The section.`,methods:[],displayName:`CollapsibleSection`,props:{title:{required:!0,tsType:{name:`ReactNode`},description:`The heading, which is also what opens and closes the section.`},children:{required:!0,tsType:{name:`ReactNode`},description:`The body, shown only while the section is open.`},icon:{required:!1,tsType:{name:`IconName`},description:`Glyph before the title.
@default undefined — only the chevron is drawn`},defaultOpen:{required:!1,tsType:{name:`boolean`},description:`Whether the section starts open, when the caller does not drive it.
@default true`},rightElement:{required:!1,tsType:{name:`ReactNode`},description:`Controls beside the heading — a count, a copy button, a menu. They sit
outside the heading button, so pressing one does not fold the section.
@default undefined`},isOpen:{required:!1,tsType:{name:`boolean`},description:`Whether the section is open, when a parent drives it — which is what an
"expand all" button, or a badge that opens and scrolls to a section, needs.
@default undefined — the section keeps its own state`},onToggle:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when the heading is pressed while a parent drives the section.
@default undefined`},id:{required:!1,tsType:{name:`string`},description:`Identifier of the section element, so a link can jump to it.
@default undefined`},className:{required:!1,tsType:{name:`string`},description:"Class the section carries, in addition to `collapsible-section`.\n@default undefined"}}}})))()}function C(e){return(0,E.jsx)(`dl`,{style:L,children:e.properties.map(e=>(0,E.jsxs)(`div`,{style:R,children:[(0,E.jsx)(`dt`,{style:z,children:e.name}),(0,E.jsx)(`dd`,{style:B,children:e.value})]},e.name))})}function w(){let[e,t]=(0,T.useState)({caffeine:!0,aspirin:!1});function n(e){t(t=>({...t,[e]:t[e]!==!0}))}function r(e){t({caffeine:e,aspirin:e})}return(0,E.jsxs)(`div`,{style:F,children:[(0,E.jsxs)(`div`,{style:I,children:[(0,E.jsx)(s,{size:`small`,text:`Expand all`,onClick:()=>r(!0)}),(0,E.jsx)(s,{size:`small`,text:`Collapse all`,onClick:()=>r(!1)})]}),(0,E.jsx)(m,{title:`Caffeine`,icon:`lab-test`,isOpen:e.caffeine,onToggle:()=>n(`caffeine`),children:(0,E.jsx)(C,{properties:f})}),(0,E.jsx)(m,{title:`Aspirin`,icon:`lab-test`,isOpen:e.aspirin,onToggle:()=>n(`aspirin`),children:(0,E.jsx)(C,{properties:p})})]})}var T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{c(),a(),T=t(),S(),d(),E=n(),D=e=>(0,E.jsx)(`div`,{style:P,children:(0,E.jsx)(e,{})}),O={title:`Disclosure/CollapsibleSection`,component:m,decorators:[D],args:{title:`Caffeine`,defaultOpen:!0,children:(0,E.jsx)(C,{properties:f})},argTypes:{title:{control:`text`},defaultOpen:{control:`boolean`},id:{control:`text`}},parameters:{layout:`padded`,docs:{description:{component:`A titled block of a panel that folds away when its heading is pressed.`}}}},k={},A={args:{defaultOpen:!1}},j={args:{icon:`lab-test`}},M={args:{title:`Predicted signals`,icon:`pulse`,rightElement:(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(o,{minimal:!0,round:!0,children:`14`}),(0,E.jsx)(s,{variant:`minimal`,size:`small`,icon:`duplicate`})]}),children:(0,E.jsx)(C,{properties:f})}},N={render:()=>(0,E.jsx)(w,{})},P={width:`min(28rem, 90vw)`,padding:`0.75rem 1rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`},F={display:`flex`,flexDirection:`column`,gap:8},I={display:`flex`,gap:6},L={display:`flex`,flexDirection:`column`,margin:0,gap:2},R={display:`flex`,alignItems:`baseline`,gap:8},z={flex:`0 0 11rem`,color:`var(--text-muted)`,fontSize:13},B={margin:0,fontFamily:`ui-monospace, SFMono-Regular, Menlo, monospace`,fontSize:13,overflowWrap:`anywhere`},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: false
  }
}`,...A.parameters?.docs?.source},description:{story:`A section a page opens folded, so only its heading is offered at first.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    icon: 'lab-test'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Predicted signals',
    icon: 'pulse',
    rightElement: <>
        <Tag minimal round>
          14
        </Tag>
        <Button variant="minimal" size="small" icon="duplicate" />
      </>,
    children: <PropertyList properties={CAFFEINE_PROPERTIES} />
  }
}`,...M.parameters?.docs?.source},description:{story:`The count and the button beside the heading sit outside it, so pressing
either leaves the section open.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <ExpandAllDemo />
}`,...N.parameters?.docs?.source},description:{story:`Two sections a parent drives, which is what an "expand all" button needs.`,...N.parameters?.docs?.description}}},V=[`Default`,`Closed`,`WithIcon`,`WithRightElement`,`Controlled`]})))()}H();export{A as Closed,N as Controlled,k as Default,j as WithIcon,M as WithRightElement,V as __namedExportsOrder,O as default};