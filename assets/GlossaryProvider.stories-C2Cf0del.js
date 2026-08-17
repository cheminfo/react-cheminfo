import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-PyJ4qDGk.js";import{d as n,f as r,v as i}from"./pedagogyFixtures-SRQjvSWn.js";import{i as a,n as o,r as s,t as c}from"./GlossaryText-BnTPsVZg.js";var l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{a(),o(),i(),l=t(),u={"chemical shift":{title:`Chemical shift`,summary:`Where a signal sits, in ppm of the spectrometer frequency, so the value does not change with the magnet.`,examples:[{code:`7.26 ppm`,note:`residual CHCl₃, the usual internal reference`},{code:`0 ppm`,note:`tetramethylsilane, by definition`}]},multiplicity:{title:`Multiplicity`,summary:`How many lines a signal is split into by its neighbours: n equivalent ones give n + 1 lines.`,examples:[{code:`t`,input:`the CH₃ of ethanol`,note:`split by two protons`},{code:`q`,input:`its CH₂`,note:`split by three`}]}},d=e=>(0,l.jsx)(`div`,{style:{maxWidth:`42rem`,lineHeight:1.55},children:(0,l.jsx)(e,{})}),f={title:`Pedagogy/GlossaryProvider`,component:s,decorators:[d],args:{glossary:n,children:(0,l.jsx)(c,{text:r})},parameters:{layout:`padded`,docs:{description:{component:`Hands one glossary to every piece of prose below it, so a tutorial step, an exercise statement and a revealed hint all define a term the same way.`}}}},p={},m={render:()=>(0,l.jsxs)(`div`,{style:{display:`grid`,gap:24},children:[(0,l.jsx)(s,{glossary:n,children:(0,l.jsx)(`p`,{style:{margin:0},children:(0,l.jsx)(c,{text:`Benzene is six [[aromatic atom|aromatic atoms]], and a [[ring closure]] digit is what joins the ends.`})})}),(0,l.jsx)(s,{glossary:u,children:(0,l.jsx)(`p`,{style:{margin:0},children:(0,l.jsx)(c,{text:`Ethanol shows a [[multiplicity|triplet]] and a quartet, at a [[chemical shift]] of 1.2 and 3.7 ppm.`})})})]})},h={args:{glossary:{}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gap: 24
  }}>
      <GlossaryProvider glossary={SMILES_GLOSSARY}>
        <p style={{
        margin: 0
      }}>
          <GlossaryText text="Benzene is six [[aromatic atom|aromatic atoms]], and a [[ring closure]] digit is what joins the ends." />
        </p>
      </GlossaryProvider>
      <GlossaryProvider glossary={NMR_GLOSSARY}>
        <p style={{
        margin: 0
      }}>
          <GlossaryText text="Ethanol shows a [[multiplicity|triplet]] and a quartet, at a [[chemical shift]] of 1.2 and 3.7 ppm." />
        </p>
      </GlossaryProvider>
    </div>
}`,...m.parameters?.docs?.source},description:{story:`Two vocabularies on one page: each column resolves against its own provider.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    glossary: {}
  }
}`,...h.parameters?.docs?.source},description:{story:`No terms written yet: the same prose reads plainly, with no brackets shown.`,...h.parameters?.docs?.description}}},g=[`Default`,`TwoVocabularies`,`NoTermsYet`]})))()}_();export{p as Default,h as NoTermsYet,m as TwoVocabularies,g as __namedExportsOrder,f as default};