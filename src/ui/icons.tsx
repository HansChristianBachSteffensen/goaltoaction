/* Icon set: Tabler Icons (https://tabler.io/icons), re-exported behind
   product-named wrappers so views stay decoupled from the library. */
import {
  IconArrowLeft as TArrowLeft,
  IconArrowRight as TArrowRight,
  IconCalendarWeek,
  IconCheck as TCheck,
  IconChevronRight as TChevronRight,
  IconClock as TClock,
  IconFocus2,
  IconInbox as TInbox,
  IconMail as TMail,
  IconMinus as TMinus,
  IconNotes,
  IconPlus as TPlus,
  IconRepeat as TRepeat,
  IconSparkles,
  IconSunHigh,
  IconTargetArrow,
  IconUsers,
  IconX as TX,
} from '@tabler/icons-react'

interface IconProps {
  size?: number
  strokeWidth?: number
}

export function IconCheck({ size = 12, strokeWidth = 3.5 }: IconProps) {
  return <TCheck size={size} stroke={strokeWidth} />
}

export function IconPlus({ size = 16, strokeWidth = 2 }: IconProps) {
  return <TPlus size={size} stroke={strokeWidth} />
}

export function IconArrowRight({ size = 16, strokeWidth = 2 }: IconProps) {
  return <TArrowRight size={size} stroke={strokeWidth} />
}

export function IconArrowLeft({ size = 16, strokeWidth = 2 }: IconProps) {
  return <TArrowLeft size={size} stroke={strokeWidth} />
}

export function IconChevronRight({ size = 14, strokeWidth = 2 }: IconProps) {
  return <TChevronRight size={size} stroke={strokeWidth} />
}

export function IconX({ size = 14, strokeWidth = 2 }: IconProps) {
  return <TX size={size} stroke={strokeWidth} />
}

export function IconSun({ size = 16, strokeWidth = 1.8 }: IconProps) {
  return <IconSunHigh size={size} stroke={strokeWidth} />
}

export function IconWeek({ size = 16, strokeWidth = 1.8 }: IconProps) {
  return <IconCalendarWeek size={size} stroke={strokeWidth} />
}

export function IconInbox({ size = 16, strokeWidth = 1.8 }: IconProps) {
  return <TInbox size={size} stroke={strokeWidth} />
}

export function IconFocus({ size = 16, strokeWidth = 1.8 }: IconProps) {
  return <IconFocus2 size={size} stroke={strokeWidth} />
}

export function IconGoals({ size = 16, strokeWidth = 1.8 }: IconProps) {
  return <IconTargetArrow size={size} stroke={strokeWidth} />
}

export function IconSpark({ size = 14, strokeWidth = 1.6 }: IconProps) {
  return <IconSparkles size={size} stroke={strokeWidth} />
}

export function IconClock({ size = 14, strokeWidth = 1.8 }: IconProps) {
  return <TClock size={size} stroke={strokeWidth} />
}

export function IconMail({ size = 14, strokeWidth = 1.7 }: IconProps) {
  return <TMail size={size} stroke={strokeWidth} />
}

export function IconNote({ size = 14, strokeWidth = 1.7 }: IconProps) {
  return <IconNotes size={size} stroke={strokeWidth} />
}

export function IconPeople({ size = 14, strokeWidth = 1.7 }: IconProps) {
  return <IconUsers size={size} stroke={strokeWidth} />
}

export function IconRepeat({ size = 13, strokeWidth = 1.8 }: IconProps) {
  return <TRepeat size={size} stroke={strokeWidth} />
}

export function IconMinus({ size = 14, strokeWidth = 2 }: IconProps) {
  return <TMinus size={size} stroke={strokeWidth} />
}
