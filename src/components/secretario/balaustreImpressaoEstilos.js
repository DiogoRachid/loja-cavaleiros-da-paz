import { ESTILOS_TEXTO_RICO } from "@/components/secretario/textoRico";
export const estilosBalaustre = `
  * { box-sizing: border-box; }
  body { font-family: Georgia, serif; color: #1a1a1a; background: #fff; max-width: 720px; margin: 32px auto; padding: 0 20px; line-height: 1.7; overflow-wrap: anywhere; }
  header { display: flex; align-items: center; gap: 20px; border-bottom: 2px solid #1B3A5F; padding-bottom: 16px; margin-bottom: 24px; break-inside: avoid; }
  header .logo { width: 78px; height: 78px; object-fit: contain; flex-shrink: 0; }
  header .titulo { flex: 1; text-align: center; }
  header h1 { font-size: 18px; color: #1B3A5F; margin: 0; }
  header p { margin: 4px 0 0; font-size: 13px; color: #555; text-align: center; }
  h2 { text-align: center; font-size: 16px; margin: 24px 0; }
  h3 { font-size: 13px; color: #1B3A5F; text-transform: uppercase; letter-spacing: .5px; margin: 20px 0 4px; break-after: avoid; }
  p, .texto-rico { font-size: 13px; text-align: justify; orphans: 3; widows: 3; }
  .assinaturas { display: flex; justify-content: space-between; gap: 16px; margin-top: 70px; break-inside: avoid; page-break-inside: avoid; }
  .assinaturas div { flex: 1; min-width: 0; border-top: 1px solid #333; text-align: center; font-size: 12px; padding-top: 6px; }
  .assinaturas strong { display: block; font-size: 12px; }
  .assinaturas span { font-size: 11px; color: #555; }
  ${ESTILOS_TEXTO_RICO}
  @page { size: A4; margin: 20mm; }
  @media print { body { max-width: none; margin: 0; padding: 0; } }
`;