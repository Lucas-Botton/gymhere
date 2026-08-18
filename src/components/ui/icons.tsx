import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

type IconProps = { size?: number; color?: string };
const sw = 1.9;

export function IconLocationPin({ size = 24, color = '#000', filled = false }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11z" stroke={color} strokeWidth={sw} fill={filled ? color : 'none'} />
      <Circle cx="12" cy="10" r="2.3" fill={color} />
    </Svg>
  );
}

export function IconChevronDown({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m6 9 6 6 6-6" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconChevronRight({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m9 5 7 7-7 7" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconDumbbell({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6.5 9v6M17.5 9v6M4 10.5v3M20 10.5v3M6.5 12h11" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export function IconBolt({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2 3 14h7l-1 8 10-12h-7z" fill={color} />
    </Svg>
  );
}

export function IconExplore({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={sw} />
      <Path d="m20 20-3.2-3.2" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function IconCoach({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.4" stroke={color} strokeWidth={sw} />
      <Path d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function IconHeart({ size = 24, color = '#000', filled = false }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20.2s-7.6-4.6-9.7-9.4C.8 6.9 2.9 3.4 6.7 3c2.2-.2 4.2 1 5.3 2.8C13.1 4 15.1 2.8 17.3 3c3.8.4 5.9 3.9 4.4 7.8C19.6 15.6 12 20.2 12 20.2z"
        stroke={color}
        strokeWidth={sw}
        fill={filled ? color : 'none'}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconProfile({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={sw} />
      <Circle cx="12" cy="9.6" r="2.8" stroke={color} strokeWidth={sw} />
      <Path d="M6 18.2c1.3-2.3 3.5-3.4 6-3.4s4.7 1.1 6 3.4" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function IconCard({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5.5" width="18" height="13" rx="3" stroke={color} strokeWidth={sw} />
      <Path d="M3 10h18" stroke={color} strokeWidth={sw} />
      <Path d="M7 14h4" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function IconInbox({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3.5 13 6 5.5h12L20.5 13" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
      <Path
        d="M3.5 13v5a1.5 1.5 0 0 0 1.5 1.5h14a1.5 1.5 0 0 0 1.5-1.5v-5h-5.2a2.8 2.8 0 0 1-5.6 0H3.5z"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconStar({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconBack({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 5 4 12l7 7M4 12h16" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconBell({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.5 5.2 1.5 5.2H4.5S6 14.5 6 10.5Z" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
      <Path d="M10 18.5a2 2 0 0 0 4 0" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function IconMap({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6.2v13.6a.6.6 0 0 0 .82.56L9 18.3l5.7 2 5.48-2.06a.6.6 0 0 0 .39-.56V4.1a.6.6 0 0 0-.82-.56L15 5.6 9.3 3.6 3.82 5.66A.6.6 0 0 0 3 6.2Z"
        stroke={color}
        strokeWidth={2.1}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path d="M9 3.7v14.6M15 5.5v14.6" stroke={color} strokeWidth={2.1} strokeLinecap="round" />
    </Svg>
  );
}

export function IconList({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function IconFilter({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6h16M7 12h10M10 18h4" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function IconShare({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="18" cy="6" r="2.4" stroke={color} strokeWidth={sw} />
      <Circle cx="6" cy="12" r="2.4" stroke={color} strokeWidth={sw} />
      <Circle cx="18" cy="18" r="2.4" stroke={color} strokeWidth={sw} />
      <Path d="m8.2 10.7 7.6-3.4M8.2 13.3l7.6 3.4" stroke={color} strokeWidth={sw} />
    </Svg>
  );
}

export function IconClose({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m6 6 12 12M18 6 6 18" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}
