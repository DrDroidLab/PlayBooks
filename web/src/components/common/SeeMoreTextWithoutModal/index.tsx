import React, { useState } from "react";

interface SeeMoreTextWithoutModalProps {
  text: string;
  maxLength?: number;
  shouldNoWrap?: boolean;
  className: React.ClassAttributes<string>;
}

const SeeMoreTextWithoutModal: React.FC<SeeMoreTextWithoutModalProps> = ({
  text,
  maxLength = 100,
  shouldNoWrap = false,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const shouldTruncateByLength = text.length > maxLength;

  const truncatedText = shouldTruncateByLength
    ? text.slice(0, maxLength) + "..."
    : text;

  const displayedText = expanded
    ? text
    : shouldTruncateByLength
    ? truncatedText
    : text;

  return (
    <div className={`${className} text-gray-800 min-w-[50px] w-full`}>
      <p
        className={`${
          shouldNoWrap && text.length < 50
            ? "whitespace-nowrap"
            : "whitespace-pre-line break-all"
        }`}>
        {displayedText}
      </p>
      {shouldTruncateByLength && (
        <button
          onClick={handleToggle}
          className="text-violet-500 hover:underline mt-2">
          {expanded ? "See Less" : "See More"}
        </button>
      )}
    </div>
  );
};

export default SeeMoreTextWithoutModal;
