import React from 'react';

// Lucide-react bilan bir xil arxitektura va barcha propslar ixtiyoriy
export interface InstagramIconProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number | string;
  strokeWidth?: number | string;
}

export const InstagramIcon = ({
  size = 24,                  // Default o'lcham
  stroke = "currentColor",    // Chiziq rangi matn rangiga moslashadi (Tailwind uchun)
  strokeWidth = 2,            // Chiziq qalinligi
  className = "",
  ...props
}: InstagramIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"             // Ikonka ichi bo'sh bo'lishi uchun
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path d="M16.65 7.2H16.66M8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20ZM15.75 12C15.75 14.0711 14.0711 15.75 12 15.75C9.92893 15.75 8.25 14.0711 8.25 12C8.25 9.92893 9.92893 8.25 12 8.25C14.0711 8.25 15.75 9.92893 15.75 12Z" />
    </svg>
  );
};

export default InstagramIcon;