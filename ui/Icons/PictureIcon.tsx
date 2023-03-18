import { IconProps } from "./props";

export const PictureIcon = ({ width = 120, height = 120 }: IconProps) => (
    <svg width={width} height={height}>
      <circle cx="60" cy="60" r="50" fill="#fff" stroke="black" strokeWidth="2" />
      <circle cx="60" cy="60" r="40" fill="#fff" stroke="black" strokeWidth="4" />
    </svg>
)