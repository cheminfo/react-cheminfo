import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-X62GV0XO.js";import{n as r,t as i}from"./icon-DTsLHYk6.js";import{n as a,t as o}from"./tag-CHMgqV1s.js";import{n as s,r as c}from"./buttons-WcYIUGTa.js";import{n as l,t as u}from"./collapse-B-HPjeeb.js";import{n as d}from"./joinClassNames-BbK_6p9Z.js";import{i as f,n as p,t as m}from"./moleculeFixtures-BmLC_E8B.js";function h(e){let{title:t,children:n,icon:r,defaultOpen:a=!0,rightElement:o,isOpen:s,onToggle:c,id:l,className:f}=e,[p,m]=(0,g.useState)(a),h=s!==void 0,C=h?s:p;function w(){h?c?.():m(e=>!e)}return(0,_.jsxs)(`section`,{id:l,className:d(`collapsible-section`,f),children:[(0,_.jsxs)(`div`,{style:v,children:[(0,_.jsxs)(`button`,{type:`button`,style:y,"aria-expanded":C,onClick:w,children:[(0,_.jsx)(i,{icon:C?`chevron-down`:`chevron-right`,size:14}),r===void 0?null:(0,_.jsx)(i,{icon:r,size:14}),(0,_.jsx)(`span`,{style:b,children:t})]}),o===void 0?null:(0,_.jsx)(`div`,{style:x,children:o})]}),(0,_.jsx)(u,{isOpen:C,children:(0,_.jsx)(`div`,{style:S,children:n})})]})}var g,_,v,y,b,x,S;function C(){return(C=e((()=>{l(),r(),g=t(),_=n(),v={display:`flex`,alignItems:`center`,gap:8},y={display:`flex`,flex:`1 1 auto`,minWidth:0,alignItems:`center`,padding:`4px 0`,border:0,background:`none`,color:`inherit`,font:`inherit`,fontWeight:600,gap:6,textAlign:`left`,cursor:`pointer`},b={overflow:`hidden`,textOverflow:`ellipsis`,whiteSpace:`nowrap`},x={display:`flex`,flex:`0 0 auto`,alignItems:`center`,gap:4},S={paddingTop:4},h.__docgenInfo={description:`A titled block of a page that folds away when its heading is pressed.

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
@default undefined`},className:{required:!1,tsType:{name:`string`},description:"Class the section carries, in addition to `collapsible-section`.\n@default undefined"}}}})))()}function w(e){return(0,D.jsx)(`dl`,{style:R,children:e.properties.map(e=>(0,D.jsxs)(`div`,{style:z,children:[(0,D.jsx)(`dt`,{style:B,children:e.name}),(0,D.jsx)(`dd`,{style:V,children:e.value})]},e.name))})}function T(){let[e,t]=(0,E.useState)({caffeine:!0,aspirin:!1});function n(e){t(t=>({...t,[e]:t[e]!==!0}))}function r(e){t({caffeine:e,aspirin:e})}return(0,D.jsxs)(`div`,{style:I,children:[(0,D.jsxs)(`div`,{style:L,children:[(0,D.jsx)(s,{size:`small`,text:`Expand all`,onClick:()=>r(!0)}),(0,D.jsx)(s,{size:`small`,text:`Collapse all`,onClick:()=>r(!1)})]}),(0,D.jsx)(h,{title:`Caffeine`,icon:`lab-test`,isOpen:e.caffeine,onToggle:()=>n(`caffeine`),children:(0,D.jsx)(w,{properties:p})}),(0,D.jsx)(h,{title:`Aspirin`,icon:`lab-test`,isOpen:e.aspirin,onToggle:()=>n(`aspirin`),children:(0,D.jsx)(w,{properties:m})})]})}var E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H;function U(){return(U=e((()=>{c(),a(),E=t(),C(),f(),D=n(),O=e=>(0,D.jsx)(`div`,{style:F,children:(0,D.jsx)(e,{})}),k={title:`Disclosure/CollapsibleSection`,component:h,decorators:[O],args:{title:`Caffeine`,defaultOpen:!0,children:(0,D.jsx)(w,{properties:p})},argTypes:{title:{control:`text`},defaultOpen:{control:`boolean`},id:{control:`text`}},parameters:{layout:`padded`,docs:{description:{component:`A titled block of a panel that folds away when its heading is pressed.`}}}},A={},j={args:{defaultOpen:!1}},M={args:{icon:`lab-test`}},N={args:{title:`Predicted signals`,icon:`pulse`,rightElement:(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(o,{minimal:!0,round:!0,children:`14`}),(0,D.jsx)(s,{variant:`minimal`,size:`small`,icon:`duplicate`})]}),children:(0,D.jsx)(w,{properties:p})}},P={render:()=>(0,D.jsx)(T,{})},F={width:`min(28rem, 90vw)`,padding:`0.75rem 1rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`},I={display:`flex`,flexDirection:`column`,gap:8},L={display:`flex`,gap:6},R={display:`flex`,flexDirection:`column`,margin:0,gap:2},z={display:`flex`,alignItems:`baseline`,gap:8},B={flex:`0 0 11rem`,color:`var(--text-muted)`,fontSize:13},V={margin:0,fontFamily:`ui-monospace, SFMono-Regular, Menlo, monospace`,fontSize:13,overflowWrap:`anywhere`},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: false
  }
}`,...j.parameters?.docs?.source},description:{story:`A section a page opens folded, so only its heading is offered at first.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    icon: 'lab-test'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source},description:{story:`The count and the button beside the heading sit outside it, so pressing
either leaves the section open.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <ExpandAllDemo />
}`,...P.parameters?.docs?.source},description:{story:`Two sections a parent drives, which is what an "expand all" button needs.`,...P.parameters?.docs?.description}}},H=[`Default`,`Closed`,`WithIcon`,`WithRightElement`,`Controlled`]})))()}U();export{j as Closed,P as Controlled,A as Default,M as WithIcon,N as WithRightElement,H as __namedExportsOrder,k as default};