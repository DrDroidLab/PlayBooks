function TabsComponent({ options, handleSelect, selectedId, ...props }) {
  return (
    <div className="flex items-center mt-2 overflow-hidden w-fit">
      {options.map((option, index) => (
        <button
          key={option.id}
          onClick={(e) => handleSelect(e, option)}
          className={`${
            selectedId === option.id
              ? "!bg-white !text-violet-500 border-violet-500"
              : "text-gray-500 bg-gray-50 border-gray-200"
          } ${index === options.length - 1 ? "rounded-r" : ""} ${
            index === 0 ? "rounded-l" : ""
          } p-1 text-xs hover:bg-gray-100 cursor-pointer transition-all border`}
          {...props}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default TabsComponent;
