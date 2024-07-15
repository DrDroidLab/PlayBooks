import React, { useState } from "react";

interface SeeMoreTextWithoutModalProps {
  text: string;
  maxLength?: number;
  className: React.ClassAttributes<string>;
  showMoreText?: boolean;
}

const SeeMoreTextWithoutModal: React.FC<SeeMoreTextWithoutModalProps> = ({
  text,
  maxLength = 100,
  className,
  showMoreText = true,
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
    <div
      className={`${className} text-gray-800 ${
        text.length > 100 ? "min-w-[200px]" : "min-w-[50px]"
      } w-full`}>
      <p
        className={`${
          text.length < 100
            ? "whitespace-nowrap"
            : "whitespace-pre-line break-all"
        }`}>
        {displayedText}
      </p>
      {shouldTruncateByLength && showMoreText && (
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
