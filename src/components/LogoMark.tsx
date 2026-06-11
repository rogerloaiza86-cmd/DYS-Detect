/* Mark Geronimo — un enfant qui tend la main vers une étoile, porté
   par une vague (charte v1.0). `color` = silhouette/vague,
   `starColor` = Or Boussole. */

export default function LogoMark({
  className,
  color = 'currentColor',
  starColor = '#f4b942',
}: {
  className?: string;
  color?: string;
  starColor?: string;
}) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      {/* Vague */}
      <path
        d="M2 44 C12 28 30 26 46 38"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Enfant : tête */}
      <circle cx="20" cy="13" r="4.5" fill={color} />
      {/* Enfant : corps élancé, bras tendu vers l'étoile */}
      <path
        d="M19 20 C18 25 18 29 16.5 33 M20 19.5 L30 13.5 M19.5 21 L13 17"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Étoile Or Boussole */}
      <path
        d="M37.5 2.5l1.9 4.9 5.2.3-4 3.3 1.3 5-4.4-2.8-4.4 2.8 1.3-5-4-3.3 5.2-.3 1.9-4.9z"
        fill={starColor}
      />
    </svg>
  );
}
