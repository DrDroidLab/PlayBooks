import { motion, Transition } from "framer-motion";
import { PropsWithChildren } from "react";

const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const pageTransition: Transition = {
  ease: "easeInOut",
  duration: 0.2,
};

const AnimatedRoute = ({ children }: PropsWithChildren) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}>
    {children}
  </motion.div>
);

export default AnimatedRoute;
