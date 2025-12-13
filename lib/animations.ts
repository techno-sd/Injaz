import { Variants, Transition } from "framer-motion"

// Animation timing constants
export const timing = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  spring: { type: "spring", stiffness: 300, damping: 30 },
  springBouncy: { type: "spring", stiffness: 400, damping: 25 },
  springSmooth: { type: "spring", stiffness: 200, damping: 35 },
  easeOut: { type: "tween", ease: "easeOut" },
  easeInOut: { type: "tween", ease: "easeInOut" },
} as const

// Fade animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: timing.normal } },
  exit: { opacity: 0, transition: { duration: timing.fast } },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: timing.normal, ...timing.easeOut }
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: timing.fast }
  },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: timing.normal, ...timing.easeOut }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: timing.fast }
  },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: timing.normal, ...timing.easeOut }
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: timing.fast }
  },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: timing.normal, ...timing.easeOut }
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: { duration: timing.fast }
  },
}

// Scale animations
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: timing.normal, ...timing.spring }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: timing.fast }
  },
}

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: timing.springBouncy
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: timing.fast }
  },
}

// Slide animations
export const slideInFromRight: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { duration: timing.normal, ...timing.easeOut }
  },
  exit: {
    x: "100%",
    transition: { duration: timing.fast }
  },
}

export const slideInFromLeft: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: { duration: timing.normal, ...timing.easeOut }
  },
  exit: {
    x: "-100%",
    transition: { duration: timing.fast }
  },
}

export const slideInFromBottom: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { duration: timing.normal, ...timing.easeOut }
  },
  exit: {
    y: "100%",
    transition: { duration: timing.fast }
  },
}

export const slideInFromTop: Variants = {
  hidden: { y: "-100%" },
  visible: {
    y: 0,
    transition: { duration: timing.normal, ...timing.easeOut }
  },
  exit: {
    y: "-100%",
    transition: { duration: timing.fast }
  },
}

// Stagger container and children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: timing.normal, ...timing.easeOut }
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: timing.fast }
  },
}

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: timing.normal, ...timing.spring }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: timing.fast }
  },
}

// Button micro-interactions
export const buttonPress = {
  scale: 0.97,
  transition: { duration: 0.1 },
}

export const buttonHover = {
  scale: 1.02,
  y: -2,
  transition: { duration: 0.2 },
}

export const buttonTap = {
  scale: 0.95,
}

// Card hover effects
export const cardHover = {
  y: -4,
  scale: 1.02,
  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  transition: { duration: 0.2 },
}

export const cardHoverSubtle = {
  y: -2,
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  transition: { duration: 0.2 },
}

// List item animations
export const listItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: timing.normal }
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: timing.fast }
  },
}

// Modal/Dialog animations
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: timing.fast } },
  exit: { opacity: 0, transition: { duration: timing.fast } },
}

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: timing.spring
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: timing.fast }
  },
}

// Skeleton/Loading animations
export const pulse: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

export const shimmer: Variants = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

// Rotate animations
export const spin: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

// Notification/Toast animations
export const toastSlideIn: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: timing.spring
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.9,
    transition: { duration: timing.fast }
  },
}

// Collapse/Expand animations
export const collapse: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { duration: timing.normal, ...timing.easeOut }
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: timing.fast }
  },
}

// Flip animations
export const flipX: Variants = {
  hidden: { rotateX: 90, opacity: 0 },
  visible: {
    rotateX: 0,
    opacity: 1,
    transition: { duration: timing.normal }
  },
  exit: {
    rotateX: -90,
    opacity: 0,
    transition: { duration: timing.fast }
  },
}

export const flipY: Variants = {
  hidden: { rotateY: 90, opacity: 0 },
  visible: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: timing.normal }
  },
  exit: {
    rotateY: -90,
    opacity: 0,
    transition: { duration: timing.fast }
  },
}

// Utility function to create custom stagger
export function createStagger(
  staggerDelay = 0.1,
  childAnimation: Variants = staggerItem
): { container: Variants; item: Variants } {
  return {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: 0.1,
        },
      },
    },
    item: childAnimation,
  }
}

// Utility to add delay to any variant
export function withDelay(variants: Variants, delay: number): Variants {
  return Object.fromEntries(
    Object.entries(variants).map(([key, value]) => {
      if (typeof value === "object" && value !== null && "transition" in value) {
        return [
          key,
          {
            ...value,
            transition: {
              ...(value as any).transition,
              delay,
            },
          },
        ]
      }
      return [key, value]
    })
  )
}
