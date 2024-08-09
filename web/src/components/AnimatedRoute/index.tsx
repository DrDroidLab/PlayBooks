import { motion, Transition } from "framer-motion";
import { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";

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
  duration: 0.25,
};

const AnimatedRoute = ({ children }: PropsWithChildren) => {
  const location = useLocation();

  return (
    <motion.div
      key={`animated-route-${location.pathname}`}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}>
      {children}
    </motion.div>
  );
};

export default AnimatedRoute;
