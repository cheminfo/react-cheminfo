import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-B4kzTPLe.js";import{n,t as r}from"./MenuButton-eBOln8ru.js";import{n as i,t as a}from"./CitationMenu-fvrdsRYc.js";function o(e){let t=e.label??`Cite`;return(0,s.jsx)(r,{compact:e.compact,placement:e.placement,className:`citation-button`,icon:`citation`,label:t,menu:`works`in e?(0,s.jsx)(a,{works:e.works,guidance:e.guidance}):(0,s.jsx)(a,{reference:e.reference})})}var s;function c(){return(c=e((()=>{n(),i(),s=t(),o.__docgenInfo={description:`The Cite entry of a site header: one button opening the article at its DOI,
the reference in the style a journal asks for, and the files a reference
manager imports. A site built on several works passes \`works\` rather than
\`reference\`, and each is then listed behind what citing it credits.
@param props - The work or works being cited, and how the menu opens.
@returns The button and its menu.`,methods:[],displayName:`CiteButton`}})))()}export{c as n,o as t};