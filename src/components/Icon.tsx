import React from 'react';
import { icons } from 'lucide-react';

interface IconProps {
  name: keyof typeof icons;
  color?: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name, color, size }) => {
  const LucideIcon = icons[name];

  return <LucideIcon color={color} size={size} />;
};

export default Icon;
