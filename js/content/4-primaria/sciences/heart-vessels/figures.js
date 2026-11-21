/** Dibujo propio (esquema) del corazón visto de frente, con partes numeradas. Los números deben coincidir con `parts` en exercises.js. */
export const heartFigure = `<svg class="sci-fig" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 350" role="img" aria-label="Diagram of the heart with numbered parts">
<defs>
<linearGradient id="hb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e07a80"/><stop offset="1" stop-color="#a73a4a"/></linearGradient>
<linearGradient id="hr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d98aa2"/><stop offset="1" stop-color="#b5546f"/></linearGradient>
<linearGradient id="ha" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8545c"/><stop offset="1" stop-color="#b8303c"/></linearGradient>
<linearGradient id="hv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6f8fe0"/><stop offset="1" stop-color="#4a63b8"/></linearGradient>
<radialGradient id="sh" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>
<rect rx="18" fill="#fff"/>
<!-- aorta (detrás) -->
<path d="M170,125 C168,62 190,38 226,42 C254,46 262,68 262,112" fill="none" stroke="#7d1f2b" stroke-width="38" stroke-linecap="round"/>
<path d="M170,125 C168,62 190,38 226,42 C254,46 262,68 262,112" fill="none" stroke="url(#ha)" stroke-width="32" stroke-linecap="round"/>
<!-- vena cava superior -->
<path d="M102,22 V130" fill="none" stroke="#2f3f80" stroke-width="32" stroke-linecap="round"/>
<path d="M102,22 V130" fill="none" stroke="url(#hv)" stroke-width="26" stroke-linecap="round"/>
<!-- cuerpo del corazón -->
<path d="M208,328 C118,300 66,215 80,150 C86,112 128,98 160,112 C196,92 258,100 262,160 C268,225 244,285 208,328 Z" fill="url(#hb)" stroke="#6b1d2b" stroke-width="3"/>
<!-- aurícula derecha -->
<path d="M84,128 C66,160 76,205 112,214 C128,190 134,150 128,112 C108,98 92,108 84,128 Z" fill="url(#hr)" stroke="#6b1d2b" stroke-width="3"/>
<!-- orejuela izquierda -->
<path d="M196,112 C200,88 246,86 254,118 C256,140 226,150 204,140 C196,134 194,122 196,112 Z" fill="#e58a8f" stroke="#6b1d2b" stroke-width="3"/>
<!-- surcos -->
<path d="M150,120 C160,190 178,250 206,322" fill="none" stroke="#7d1f2b" stroke-width="4" stroke-linecap="round" opacity=".75"/>
<path d="M112,214 C150,205 180,160 198,138" fill="none" stroke="#7d1f2b" stroke-width="3" stroke-linecap="round" opacity=".6"/>
<ellipse cx="190" cy="215" rx="58" ry="80" fill="url(#sh)"/>
<!-- tronco pulmonar -->
<path d="M138,125 C136,92 148,76 172,68" fill="none" stroke="#2f3f80" stroke-width="30" stroke-linecap="round"/>
<path d="M138,125 C136,92 148,76 172,68" fill="none" stroke="url(#hv)" stroke-width="24" stroke-linecap="round"/>
<g font-family="Nunito,Arial,sans-serif" font-weight="800" font-size="17" text-anchor="middle" fill="#2b3a67">
<g><circle cx="100" cy="162" r="14" fill="#fff" stroke="#2b3a67" stroke-width="2.5"/><text x="100" y="168">1</text></g>
<g><circle cx="226" cy="114" r="14" fill="#fff" stroke="#2b3a67" stroke-width="2.5"/><text x="226" y="120">2</text></g>
<g><circle cx="124" cy="250" r="14" fill="#fff" stroke="#2b3a67" stroke-width="2.5"/><text x="124" y="256">3</text></g>
<g><circle cx="214" cy="230" r="14" fill="#fff" stroke="#2b3a67" stroke-width="2.5"/><text x="214" y="236">4</text></g>
<g><circle cx="102" cy="52" r="14" fill="#fff" stroke="#2b3a67" stroke-width="2.5"/><text x="102" y="58">5</text></g>
<g><circle cx="222" cy="48" r="14" fill="#fff" stroke="#2b3a67" stroke-width="2.5"/><text x="222" y="54">6</text></g>
<g><circle cx="146" cy="100" r="14" fill="#fff" stroke="#2b3a67" stroke-width="2.5"/><text x="146" y="106">7</text></g>
</g>
<text x="160" y="344" font-family="Nunito,Arial,sans-serif" font-size="11" text-anchor="middle" fill="#6b6b85">Front view: the right side of the heart is on your left</text>
</svg>`;
