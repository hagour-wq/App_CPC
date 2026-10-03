// Repères copiés du Reporting fourni : objectifs indicatifs, pas des normes CGNC.
export const thresholds: Record<string, string> = {
  Indicateur: 'Repère',
  "Marge d'exploitation (REX / CA)": '10 % à 15 %',
  'Élasticité REX / CA': '> 1 = levier positif',
  'Poids de la masse salariale / CA': '< 30 %',
  'CAF / CA': '> 10 %',
  'Taux de croissance du résultat net (vs N-1)': '5 % à 10 %',
  'Ratio de densité des charges externes (charges externes / CA)': '< 10 %',
  'Charges variables (matières, sous-traitance, énergie, transports)':
    'hypothèse',
  'Effet de levier opérationnel (MCV / REX)': '2x à 4x',
  'Taux de valeur ajoutée locale (VA / Production)': '> 40 %',
  'Poids du personnel dans la valeur ajoutée': '< 65 % sain',
  'Part du change dans le REX': '< 20 %',
  'Coût moyen de la dette (annualisé)': '4 % à 7 %',
  'DSO — délai de paiement clients': '≈ 60 j',
  'DPO — délai de paiement fournisseurs': '60 à 75 j',
  'DIO — stocks en jours de CA': '60 à 90 j',
  'CCC — cycle de conversion du cash (DSO + DIO − DPO)': 'le plus bas possible',
};

export function assess(
  value: number,
  reference: string,
): 'good' | 'watch' | 'bad' | 'neutral' {
  const text = reference.replace(/,/g, '.');
  const numbers = (text.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
  if (!numbers.length || /hypothese|code couleur|levier positif/i.test(text))
    return 'neutral';
  const n = text.includes('%') ? value * 100 : value;
  if (text.includes('<')) return n < numbers[0] ? 'good' : 'bad';
  if (text.includes('>')) return n > numbers[0] ? 'good' : 'bad';
  if (text.includes('≈'))
    return n <= numbers[0] ? 'good' : n <= numbers[0] * 1.1 ? 'watch' : 'bad';
  if (numbers.length >= 2)
    return n >= numbers[0] && n <= numbers[1] ? 'good' : 'watch';
  return 'neutral';
}
